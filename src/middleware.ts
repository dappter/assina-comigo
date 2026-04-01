import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';
// global default client for anon fallbacks
import { supabase as defaultSupabase } from './lib/supabaseClient';
import { getSupabaseServerClient } from './lib/supabaseSSR';
import { supabaseAdmin } from './lib/supabaseAdmin';

const ADMIN_BYPASS_COOKIE = 'admin_bypass_session';
let cachedAdminBypassTenantId: string | null = null;
let cachedAdminBypassTenantUpdatedAt = 0;
const ADMIN_BYPASS_TENANT_CACHE_TTL_MS = 60_000;

async function resolveAdminBypassTenantId(): Promise<string | null> {
    const now = Date.now();
    if (cachedAdminBypassTenantId && now - cachedAdminBypassTenantUpdatedAt < ADMIN_BYPASS_TENANT_CACHE_TTL_MS) {
        return cachedAdminBypassTenantId;
    }

    // 1) Fonte preferencial: tenant_settings (tenant oficial da operação)
    const { data: tenantSettingsRows, error: tenantSettingsError } = await supabaseAdmin
        .from('tenant_settings')
        .select('tenant_id')
        .limit(1);

    if (!tenantSettingsError && tenantSettingsRows?.[0]?.tenant_id) {
        cachedAdminBypassTenantId = tenantSettingsRows[0].tenant_id;
        cachedAdminBypassTenantUpdatedAt = now;
        return cachedAdminBypassTenantId;
    }

    // 2) Fallback: qualquer tenant já usado em profiles
    const { data: profileRows, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('tenant_id')
        .not('tenant_id', 'is', null)
        .limit(1);

    if (!profilesError && profileRows?.[0]?.tenant_id) {
        cachedAdminBypassTenantId = profileRows[0].tenant_id;
        cachedAdminBypassTenantUpdatedAt = now;
        return cachedAdminBypassTenantId;
    }

    return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
    // Ignora rotas da API, rotas estáticas e assets internos do frontend (Vite/Astro)
    const pathname = new URL(context.request.url).pathname;
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_image') ||
        pathname.startsWith('/ref/') ||
        pathname.startsWith('/grupo/') ||   // Página pública de captação por grupo
        pathname.startsWith('/_astro/') ||
        pathname.startsWith('/@vite/') ||
        pathname.startsWith('/@fs/') ||
        pathname.startsWith('/src/') ||
        pathname.startsWith('/node_modules/') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.svg')
    ) {
        return next();
    }

    try {
        const hasAdminBypass = context.cookies.get(ADMIN_BYPASS_COOKIE)?.value === '1';

        if (hasAdminBypass) {
            const bypassTenantId = await resolveAdminBypassTenantId();

            if (bypassTenantId) {
                context.locals.tenantId = bypassTenantId;
                context.locals.role = 'admin';
                context.locals.profileId = bypassTenantId;
                context.locals.user = {
                    id: bypassTenantId,
                    email: 'admin@topconexoes.com',
                } as any;
            } else {
                console.error('[ADMIN_BYPASS] Nenhum tenant_id valido encontrado para sessao de bypass.');
                context.cookies.delete(ADMIN_BYPASS_COOKIE, { path: '/' });
            }
        }

        const supabase = getSupabaseServerClient(context.cookies);

        // Configura a sessão corrente para a request
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (user && !authError) {
            console.log("[SESSION_CHECK] User authenticated.", { userId: user.id });
            context.locals.user = user;

            // Busca o tenant e a role nas claims da sessão atual (injeteados pelo custom Auth Hook)
            // Caso o token não possua as claims (tokens velhos), faz o fallback para a query na tabela
            const { data: { session } } = await supabase.auth.getSession();
            
            let tenantId = user.app_metadata?.tenant_id;
            let role = user.app_metadata?.tipo_usuario;
            
            if (!tenantId && session?.access_token) {
                try {
                    const jwtBase64Url = session.access_token.split('.')[1];
                    const jwtBase64 = jwtBase64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jwtPayload = JSON.parse(Buffer.from(jwtBase64, 'base64').toString('utf8'));
                    tenantId = jwtPayload.tenant_id;
                    role = jwtPayload.tipo_usuario;
                } catch(e) {}
            }

            if (tenantId && role) {
                // Cache hit no JWT
                context.locals.tenantId = tenantId;
                context.locals.role = role;
                context.locals.profileId = user.id;
            } else {
                console.log("[SESSION_CHECK] Claims not found in token. Fallback to DB...");
                // Busca o profile associado para descobrir o tenant e a role
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("[MIDDLEWARE] Erro ao buscar profile do user", user.id, error);
                }

                if (profile) {
                    context.locals.tenantId = profile.tenant_id;
                    context.locals.role = profile.tipo_usuario;
                    context.locals.profileId = profile.id;
                }
            }
        } else {
            console.log("[SESSION_CHECK] User NOT authenticated or error.", { authError });
            // The SSR client automatically clears invalid cookies when getUser() fails
        }
    } catch (criticalError) {
        console.error("[CRITICAL_MIDDLEWARE_ERROR]", criticalError);
        // Em caso de erro crítico (ex: falta de env vars), permitimos que a request continue para rotas públicas
        // ou que o Astro renderize páginas de erro customizadas em vez de um 500 branco.
    }

    // Proteção de rotas internas de parceiro
    if (pathname.startsWith('/parceiro')) {
        // Se não estiver logado e não for a tela de login ou registro
        if (!context.locals.tenantId && !['/parceiro/login', '/parceiro/registro'].includes(pathname)) {
            return context.redirect('/?mode=login#signup');
        }

        // Se estiver logado e for admin tentando acessar uma rota interna de parceiro (exceto login/registro)
        // reorientar para o dashboard admin
        if (context.locals.tenantId && context.locals.role === 'admin') {
            if (!['/parceiro/login', '/parceiro/registro'].includes(pathname)) {
                return context.redirect('/admin/dashboard');
            }
        }

        // Se estiver logado como parceiro e tentar acessar login/registro, manda pro dashboard do parceiro
        if (context.locals.tenantId && context.locals.role === 'parceiro' && ['/parceiro/login', '/parceiro/registro'].includes(pathname)) {
            return context.redirect('/parceiro/dashboard');
        }
    }

    // Proteção de rotas do administrador
    if (pathname.startsWith('/admin')) {
        if (!context.locals.tenantId && pathname !== '/admin/login') {
            return context.redirect('/admin/login');
        }

        if (context.locals.tenantId && pathname === '/admin/login') {
            if (context.locals.role === 'admin') {
                return context.redirect('/admin/dashboard');
            } else {
                return context.redirect('/parceiro/dashboard'); // se for logado mas n for admin reorientar
            }
        }

        if (pathname !== '/admin/login' && context.locals.role !== 'admin') {
            return context.redirect('/?mode=login#signup');
        }
    }

    return next();
});

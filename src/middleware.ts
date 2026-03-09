import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabaseClient';

export const onRequest = defineMiddleware(async (context, next) => {
    // Ignora rotas da API, rotas estáticas e assets internos do frontend (Vite/Astro)
    const pathname = new URL(context.request.url).pathname;
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_image') ||
        pathname.startsWith('/ref/') ||
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

    // Verifica tokens de auth no cookie do Supabase
    const accessToken = context.cookies.get('sb-access-token')?.value;
    const refreshToken = context.cookies.get('sb-refresh-token')?.value;

    if (accessToken && refreshToken) {
        // Configura a sessão corrente para a request
        const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

        if (user && !authError) {
            context.locals.user = user;

            // Busca o profile associado para descobrir o tenant e a role
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                context.locals.tenantId = profile.tenant_id;
                context.locals.role = profile.tipo_usuario;
                context.locals.profileId = profile.id;
            }
        } else {
            // Token inválido, limpa cookies
            context.cookies.delete('sb-access-token', { path: '/' });
            context.cookies.delete('sb-refresh-token', { path: '/' });
        }
    }

    // Proteção de rotas internas de parceiro
    if (pathname.startsWith('/parceiro')) {
        // Se não estiver logado e não for a tela de login ou registro
        if (!context.locals.tenantId && !['/parceiro/login', '/parceiro/registro'].includes(pathname)) {
            return context.redirect('/parceiro/login');
        }

        // Se estiver logado e tentar acessar login ou registro, manda pro dashboard
        if (context.locals.tenantId && ['/parceiro/login', '/parceiro/registro'].includes(pathname)) {
            if (context.locals.role === 'admin') {
                return context.redirect('/admin/dashboard');
            }
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
            return context.redirect('/parceiro/login');
        }
    }

    return next();
});

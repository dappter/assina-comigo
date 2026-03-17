import type { APIRoute } from 'astro';
import { getSupabaseServerClient } from '../../../lib/supabaseSSR';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
    const authCode = url.searchParams.get('code');
    const next = url.searchParams.get('next') || '/parceiro/dashboard';

    if (!authCode) {
        return new Response('Nenhum código de autorização providenciado (Auth Code was missing)', { status: 400 });
    }

    // Troca o código pela sessão usando o cliente SSR
    const supabaseSSR = getSupabaseServerClient(cookies);
    const { data, error } = await supabaseSSR.auth.exchangeCodeForSession(authCode);

    if (error || !data.session) {
        return new Response(error?.message || 'Sessão inválida. Ocorreu um erro no servidor.', { status: 500 });
    }

    const { user } = data.session;
    // O cliente SSR (supabaseSSR) já salva os tokens nos cookies automaticamente através do manipulador definido em supabaseSSR.ts

    // VERIFICAÇÃO E CRIAÇÃO DE PERFIL (CYBERSECURITY SKILL)
    // Se o usuário não existe na tabela profiles, precisamos criá-lo com um tenant padrão
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, tipo_usuario')
        .eq('id', user.id)
        .single();

    if (!profile) {
        // Buscamos o ID do Tenant Principal para associar ao novo usuário
        let MAIN_TENANT_ID = import.meta.env.PUBLIC_MAIN_TENANT_ID;
        
        if (!MAIN_TENANT_ID) {
            const { data: adminProfile } = await supabaseAdmin
                .from('profiles')
                .select('tenant_id')
                .eq('tipo_usuario', 'admin')
                .limit(1)
                .maybeSingle();
            
            MAIN_TENANT_ID = adminProfile?.tenant_id || "4a254f52-99bd-43dd-86e2-ec031206077a";
        }

        console.log(`[AUTH_CALLBACK] Criando perfil para novo usuário Google: ${user.email}`);
        
        await supabaseAdmin.from('profiles').insert({
            id: user.id,
            tenant_id: MAIN_TENANT_ID,
            email: user.email,
            nome: user.user_metadata.full_name || user.email?.split('@')[0],
            tipo_usuario: 'parceiro'
        });
    }

    // Redireciona para o dashboard ou para onde foi solicitado
    if (profile?.tipo_usuario === 'admin' || next.includes('/admin')) {
        return redirect('/admin/dashboard');
    }

    return redirect(next);
};

import type { APIRoute } from 'astro';
import { getSupabaseServerClient } from '../../../lib/supabaseSSR';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
    const authCode = url.searchParams.get('code');
    const next = url.searchParams.get('next') || '/parceiro/dashboard';
    const grupoId = url.searchParams.get('grupo_id');
    const tenantIdParam = url.searchParams.get('tenant_id');

    if (!authCode) {
        return new Response('Nenhum código de autorização providenciado (Auth Code was missing)', { status: 400 });
    }

    // Troca o código pela sessão usando o cliente SSR
    const supabaseSSR = getSupabaseServerClient(cookies);
    
    console.log(`[AUTH_CALLBACK_EXCHANGE] Iniciando troca de código por sessão...`);
    
    const { data, error } = await supabaseSSR.auth.exchangeCodeForSession(authCode);

    if (error || !data.session) {
        console.error(`[AUTH_CALLBACK_ERROR] Erro na troca de código: ${error?.message || 'Sem sessão'}`);
        return new Response(error?.message || 'Sessão inválida. Ocorreu um erro ao validar sua conta.', { status: 500 });
    }

    const { user } = data.session;
    console.log(`[AUTH_CALLBACK_SUCCESS] Sessão obtida para: ${user.email}`);

    // VERIFICAÇÃO E CRIAÇÃO DE PERFIL (CYBERSECURITY SKILL)
    // Se o usuário não existe na tabela profiles, precisamos criá-lo com um tenant padrão
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, tipo_usuario')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile) {
        // Buscamos o ID do Tenant Principal para associar ao novo usuário
        let finalTenantId = tenantIdParam || import.meta.env.PUBLIC_MAIN_TENANT_ID;
        
        if (!finalTenantId) {
            // Fallback para o tenant do primeiro admin encontrado ou ID fixo seguro
            const { data: adminProfile } = await supabaseAdmin
                .from('profiles')
                .select('tenant_id')
                .eq('tipo_usuario', 'admin')
                .limit(1)
                .maybeSingle();
            
            finalTenantId = adminProfile?.tenant_id || "4a254f52-99bd-43dd-86e2-ec031206077a";
        }

        console.log(`[AUTH_CALLBACK_NEW_USER] Criando perfil 'parceiro' para: ${user.email} (Tenant: ${finalTenantId})`);
        
        const novoPerfil: any = {
            id: user.id,
            tenant_id: finalTenantId,
            email: user.email,
            nome: user.user_metadata.full_name || user.email?.split('@')[0],
            tipo_usuario: 'parceiro', // OAuth do Google sempre cria como parceiro
            status: 'ativo'
        };

        if (grupoId) {
            novoPerfil.grupo_id = grupoId;
        }

        const { error: insertError } = await supabaseAdmin.from('profiles').insert(novoPerfil);
        if (insertError) {
            console.error(`[AUTH_CALLBACK_INSERT_ERROR] Erro ao criar perfil:`, insertError);
        }
    }

    // Lógica de redirecionamento final com base no tipo de usuário real ou solicitado
    const isActuallyAdmin = profile?.tipo_usuario === 'admin';
    const destination = (isActuallyAdmin && next.includes('/admin')) ? '/admin/dashboard' : next;

    console.log(`[AUTH_CALLBACK_REDIRECT] Finalizando fluxo. Destino: ${destination}`);
    return redirect(destination);
};

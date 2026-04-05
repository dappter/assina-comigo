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

    const supabaseSSR = getSupabaseServerClient(cookies);
    
    console.log(`[AUTH_CALLBACK_EXCHANGE] Iniciando troca de código por sessão...`);
    
    const { data, error } = await supabaseSSR.auth.exchangeCodeForSession(authCode);

    if (error || !data.session) {
        console.error(`[AUTH_CALLBACK_ERROR] Erro na troca de código: ${error?.message || 'Sem sessão'}`);
        return new Response(error?.message || 'Sessão inválida. Ocorreu um erro ao validar sua conta.', { status: 500 });
    }

    const { user } = data.session;
    console.log(`[AUTH_CALLBACK_SUCCESS] Sessão obtida para: ${user.email}`);

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, tipo_usuario, telefone, chave_pix, tipo_pix')
        .eq('id', user.id)
        .maybeSingle();

    let needsCompletion = false;

    if (!profile) {
        let finalTenantId = tenantIdParam || import.meta.env.PUBLIC_MAIN_TENANT_ID;
        
        if (!finalTenantId) {
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
            tipo_usuario: 'parceiro',
            status: 'ativo'
        };

        let resolvedGrupoId = grupoId;
        if (!resolvedGrupoId) {
            const { data: defaultGroup } = await supabaseAdmin
                .from('grupos_parceiros')
                .select('id')
                .eq('tenant_id', finalTenantId)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();
            resolvedGrupoId = defaultGroup?.id || null;
        }

        if (resolvedGrupoId) {
            novoPerfil.grupo_id = resolvedGrupoId;
        }

        const { error: insertError } = await supabaseAdmin.from('profiles').insert(novoPerfil);
        if (insertError) {
            console.error(`[AUTH_CALLBACK_INSERT_ERROR] Erro ao criar perfil:`, insertError);
        }
        
        // Novo perfil acabou de nascer, logo precisará completar (falta telefone e PIX)
        needsCompletion = true;
    } else {
        // Se já existe, checa os campos obrigatórios atualizados
        if (!profile.telefone || !profile.chave_pix || !profile.tipo_pix) {
            needsCompletion = true;
        }
    }

    let destination = next;
    const isActuallyAdmin = profile?.tipo_usuario === 'admin';
    const isVendedor = profile?.tipo_usuario === 'vendedor';

    if (isActuallyAdmin) {
        destination = '/admin/dashboard';
    } else if (isVendedor) {
        destination = '/vendedor/dashboard';
    } else if (!profile || needsCompletion) {
        destination = '/parceiro/completar-cadastro';
    }

    console.log(`[AUTH_CALLBACK_REDIRECT] Redirecionando para: ${destination}`);
    return redirect(destination);
};

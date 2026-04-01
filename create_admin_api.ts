import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carrega as variáveis do .env do projeto
dotenv.config();

const supabaseAdmin = createClient(
    process.env.PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function getDefaultTenantId(): string {
    return process.env.PUBLIC_MAIN_TENANT_ID || '4a254f52-99bd-43dd-86e2-ec031206077a';
}

async function setupAdmin() {
    console.log('[ADMIN_SETUP] Iniciando criacao segura de admin via API...');

    if (!process.env.PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[ADMIN_SETUP] Variaveis PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes.');
        return;
    }

    const email = (process.env.ADMIN_EMAIL || 'admin@topconexoes.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'adm123';
    const nome = process.env.ADMIN_NAME || 'Gestor Top Conexoes';
    let tenantId = getDefaultTenantId();

    // Tenta herdar tenant do primeiro admin existente para manter consistencia.
    const { data: firstAdminProfile } = await supabaseAdmin
        .from('profiles')
        .select('tenant_id')
        .eq('tipo_usuario', 'admin')
        .limit(1)
        .maybeSingle();

    if (firstAdminProfile?.tenant_id) {
        tenantId = firstAdminProfile.tenant_id;
    }

    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
        console.error('[ADMIN_SETUP] Falha ao listar usuarios:', listError.message);
        return;
    }

    const existingUser = existingUsers.users.find((u: any) => u.email?.toLowerCase() === email);
    let userId = existingUser?.id;

    if (!existingUser) {
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nome },
            app_metadata: {
                tenant_id: tenantId,
                tipo_usuario: 'admin',
            },
        });

        if (createError || !created.user) {
            console.error('[ADMIN_SETUP] Erro ao criar usuario no Auth:', createError?.message);
            return;
        }

        userId = created.user.id;
        console.log(`[ADMIN_SETUP] Usuario criado no Auth: ${userId}`);
    } else {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
            user_metadata: { nome },
            app_metadata: {
                tenant_id: tenantId,
                tipo_usuario: 'admin',
            },
        });

        if (updateError) {
            console.error('[ADMIN_SETUP] Erro ao atualizar usuario existente no Auth:', updateError.message);
            return;
        }

        console.log(`[ADMIN_SETUP] Usuario existente atualizado no Auth: ${existingUser.id}`);
    }

    if (!userId) {
        console.error('[ADMIN_SETUP] Nao foi possivel resolver o userId do admin.');
        return;
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
        {
            id: userId,
            tenant_id: tenantId,
            nome,
            email,
            tipo_usuario: 'admin',
            status: 'ativo',
        },
        { onConflict: 'id' }
    );

    if (profileError) {
        console.error('[ADMIN_SETUP] Erro ao criar/atualizar profile admin:', profileError.message);
        return;
    }

    const { error: settingsErr } = await supabaseAdmin
        .from('tenant_settings')
        .upsert({ tenant_id: tenantId }, { onConflict: 'tenant_id' });

    if (settingsErr) {
        console.warn('[ADMIN_SETUP] Aviso ao sincronizar tenant_settings:', settingsErr.message);
    }

    console.log('-----------------------------------------');
    console.log('SUCESSO! ADMIN SINCRONIZADO COM SEGURANCA');
    console.log(`Login: ${email}`);
    console.log('-----------------------------------------');
}

setupAdmin();

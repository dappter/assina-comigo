import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[ADMIN_SETUP] Variaveis PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const email = (process.env.ADMIN_EMAIL || 'admin@topconexoes.com').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'adm123';
const nome = process.env.ADMIN_NAME || 'Gestor Top Conexoes';
const fallbackTenantId = process.env.PUBLIC_MAIN_TENANT_ID || '4a254f52-99bd-43dd-86e2-ec031206077a';

async function run() {
  console.log('[ADMIN_SETUP] Iniciando sincronizacao segura de admin...');

  let tenantId = fallbackTenantId;
  const { data: firstAdminProfile } = await supabaseAdmin
    .from('profiles')
    .select('tenant_id')
    .eq('tipo_usuario', 'admin')
    .limit(1)
    .maybeSingle();

  if (firstAdminProfile?.tenant_id) {
    tenantId = firstAdminProfile.tenant_id;
  }

  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    throw listError;
  }

  const existingUser = usersData.users.find((u) => u.email?.toLowerCase() === email);
  let userId = existingUser?.id;

  if (!existingUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
      app_metadata: {
        tenant_id: tenantId,
        tipo_usuario: 'admin',
      },
    });

    if (error || !data.user) {
      throw error || new Error('Usuario nao foi criado.');
    }

    userId = data.user.id;
    console.log(`[ADMIN_SETUP] Usuario admin criado: ${userId}`);
  } else {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: { nome },
      app_metadata: {
        tenant_id: tenantId,
        tipo_usuario: 'admin',
      },
    });

    if (error) {
      throw error;
    }

    console.log(`[ADMIN_SETUP] Usuario admin atualizado: ${existingUser.id}`);
  }

  if (!userId) {
    throw new Error('User ID do admin nao resolvido.');
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
    { onConflict: 'id' },
  );

  if (profileError) {
    throw profileError;
  }

  const { error: settingsError } = await supabaseAdmin
    .from('tenant_settings')
    .upsert({ tenant_id: tenantId }, { onConflict: 'tenant_id' });

  if (settingsError) {
    console.warn('[ADMIN_SETUP] Aviso ao atualizar tenant_settings:', settingsError.message);
  }

  console.log('-----------------------------------------');
  console.log('SUCESSO! ADMIN SINCRONIZADO COM SEGURANCA');
  console.log(`Login: ${email}`);
  console.log('-----------------------------------------');
}

run().catch((error) => {
  console.error('[ADMIN_SETUP] Falha:', error?.message || error);
  process.exit(1);
});

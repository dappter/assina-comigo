import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    // Não lançamos erro aqui para não travar o build, mas avisamos no console em ambiente dev
    if (import.meta.env.DEV) {
        console.warn('Supabase admin variables are missing. Admin functions will fail.');
    }
}

// Client com papel de Service Role - By-pass nas regras de RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

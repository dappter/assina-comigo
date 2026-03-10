import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin variables are missing from environment.');
}

// Client com papel de Service Role - By-pass nas regras de RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

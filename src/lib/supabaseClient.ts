import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
        console.error('Supabase variables are missing from environment. Client will be initialized with empty values and calls will fail.');
    }
}

export const supabase = createClient(
    supabaseUrl || '', 
    supabaseAnonKey || '', 
    {
        auth: {
            flowType: 'pkce',
        },
    }
);

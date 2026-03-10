import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

const reqSupabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    const { data: sessionData, error } = await reqSupabase.auth.signInWithPassword({
        email: "test_tele_cpf@gmail.com",
        password: "password123",
    });

    if (error) {
        console.error("Login Error:", error.message);
        return;
    }

    const accessToken = sessionData.session.access_token;

    console.log("Logged in correctly. Tokens size:", accessToken.length);

    // Now emulate middleware checking the active user with a NEW client!
    const mwClient = createClient(
        process.env.PUBLIC_SUPABASE_URL,
        process.env.PUBLIC_SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            auth: {
                persistSession: false,
            } // In Astro SSR you often want persistSession=false
        }
    );

    const { data: { user }, error: authError } = await mwClient.auth.getUser(accessToken);

    if (authError) {
        console.error("Auth User Error:", authError.message);
    } else {
        console.log("Got user:", user.id);
    }

}

test();

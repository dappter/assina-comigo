import type { APIRoute } from "astro";

import { getSupabaseServerClient } from "../../../lib/supabaseSSR";

const ADMIN_BYPASS_COOKIE = "admin_bypass_session";

export const POST: APIRoute = async ({ cookies, redirect }) => {
    const supabase = getSupabaseServerClient(cookies);

    // O signOut do client SSR automaticamente chama a função 'remove' dos cookies definida no lib/supabaseSSR.ts
    await supabase.auth.signOut();
    cookies.delete(ADMIN_BYPASS_COOKIE, {
        path: "/",
    });

    return redirect("/parceiro/login", 302);
};

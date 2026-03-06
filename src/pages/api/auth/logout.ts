import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies, redirect }) => {
    // Remove os cookies de sessão do Supabase
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    return redirect("/parceiro/login", 302);
};

import type { APIRoute } from 'astro';
import { getSupabaseServerClient } from '../../../lib/supabaseSSR';
import { logger } from '../../../utils/logger';

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
    const host = request.headers.get("host") || url.host;
    const proto = request.headers.get("x-forwarded-proto") || (url.protocol?.replace(":", "") || "http");
    const finalProto = host.includes("localhost") || host.includes("127.0.0.1") ? proto : "https";
    const origin = `${finalProto}://${host}`;

    const modeField = url.searchParams.get("mode") || "login";
    const grupoId = url.searchParams.get("grupo_id");
    const tenantId = url.searchParams.get("tenant_id");

    const supabaseSSR = getSupabaseServerClient(cookies);

    let callbackUrl = `${origin}/api/auth/callback?next=/parceiro/dashboard`;
    if (modeField === "register" && grupoId) {
        callbackUrl += `&grupo_id=${grupoId}`;
        if (tenantId) callbackUrl += `&tenant_id=${tenantId}`;
    }

    console.log(`[OAUTH_INIT] Iniciando fluxo Google OAuth. Callback: ${callbackUrl}`);

    const { data: authData, error } = await supabaseSSR.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: callbackUrl,
        },
    });

    if (error) {
        logger.error("[AUTH_OAUTH_ERROR] Falha ao iniciar OAuth na rota API", { host, origin }, error);
        return redirect(`/?error=oauth_error&message=${encodeURIComponent(error.message)}`);
    } else if (authData?.url) {
        return redirect(authData.url);
    } else {
        return redirect(`/?error=oauth_error&message=Sem_URL_Gerada`);
    }
};

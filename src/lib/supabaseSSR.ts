import { createServerClient } from "@supabase/ssr";
import type { AstroCookies } from "astro";

export const getSupabaseServerClient = (cookies: AstroCookies) => {
    // Busca chaves com fallback para process.env (essencial para Vercel)
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("[SUPABASE_SSR_CONFIG] Erro: PUBLIC_SUPABASE_URL ou PUBLIC_SUPABASE_ANON_KEY não definidos!");
    }

    return createServerClient(
        supabaseUrl || '',
        supabaseAnonKey || '',
        {
            cookies: {
                get(key: string) {
                    return cookies.get(key)?.value;
                },
                set(key: string, value: string, options: any) {
                    const isProd = !import.meta.env.DEV;
                    const host = cookies.get("_host_hint")?.value || ""; // Podemos passar o host por um cookie temporário se necessário, ou usar o padrão
                    
                    let cookieOptions: any = {
                        ...options,
                        path: "/",
                        secure: isProd,
                        sameSite: "Lax",
                        httpOnly: false,
                    };

                    // Se estamos no domínio principal, forçamos o domínio base com ponto para abranger subdomínios
                    if (isProd) {
                        // Nota: Em Astro SSR, o host está disponível em request.headers, mas o client de cookies aqui
                        // é abstrato. O Supabase recomenda deixar o domínio automático se não houver cross-subdomain.
                        // Mas como queremos www <-> naked domain, tentamos injetar se soubermos que é o domínio oficial.
                    }

                    cookies.set(key, value, cookieOptions);
                },
                remove(key: string, options: any) {
                    const isProd = !import.meta.env.DEV;
                    cookies.delete(key, {
                        ...options,
                        path: "/",
                        secure: isProd,
                        sameSite: "Lax",
                    });
                },
            },
        }
    );
};

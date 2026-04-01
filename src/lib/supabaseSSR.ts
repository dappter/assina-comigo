import { createServerClient } from "@supabase/ssr";
import type { AstroCookies } from "astro";

export const getSupabaseServerClient = (cookies: AstroCookies) => {
    return createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(key: string) {
                    return cookies.get(key)?.value;
                },
                set(key: string, value: string, options: any) {
                    cookies.set(key, value, {
                        ...options,
                        path: "/",
                        secure: import.meta.env.PROD,
                        sameSite: "Lax",
                    });
                },
                remove(key: string, options: any) {
                    cookies.delete(key, {
                        ...options,
                        path: "/",
                        secure: import.meta.env.PROD,
                        sameSite: "Lax",
                    });
                },
            },
        }
    );
};

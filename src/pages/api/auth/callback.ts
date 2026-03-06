import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabaseClient';

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
    const authCode = url.searchParams.get('code');

    if (!authCode) {
        return new Response('Nenhum código de autorização providenciado (Auth Code was missing)', { status: 400 });
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

    if (error || !data.session) {
        return new Response(error?.message || 'Sessão inválida. Ocorreu um erro no servidor.', { status: 500 });
    }

    const { access_token, refresh_token } = data.session;

    cookies.set("sb-access-token", access_token, {
        path: "/",
        secure: import.meta.env.PROD,
        httpOnly: true,
        sameSite: "lax",
    });
    cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
        secure: import.meta.env.PROD,
        httpOnly: true,
        sameSite: "lax",
    });

    // Em modo real verifique a trigger ou valide se a pessoa já esta salva na sua tabela `profiles`
    // Dependendo do seu fluxo de entrada o usuário terá que ser direcionado para criar o form de registro inicial ou completar os dados. 
    // Por enquanto, direcionar diretamente para o Dashboard (O middleware cuidará se o JWT for valido)

    return redirect('/parceiro/dashboard');
};

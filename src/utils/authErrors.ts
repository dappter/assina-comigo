const SCHEMA_ERROR_FRAGMENT = "database error querying schema";

export function mapSupabaseAuthErrorMessage(
    rawMessage: string | undefined,
    context: "admin" | "partner" = "partner",
    rawCode?: string,
    rawStatus?: number,
): string {
    if (!rawMessage) {
        if (rawStatus === 429) {
            return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
        }
        return "Nao foi possivel autenticar no momento. Verifique sua conexao e tente novamente.";
    }

    const normalized = rawMessage.toLowerCase();
    const code = (rawCode || "").toLowerCase();

    if (normalized.includes("invalid login credentials")) {
        return "E-mail ou senha incorretos.";
    }

    if (normalized.includes("email logins are disabled") || code.includes("email_provider_disabled")) {
        return "Login por senha esta desativado neste ambiente. Use o botao Entrar com Google.";
    }

    if (normalized.includes("signup is disabled") || normalized.includes("signups not allowed")) {
        return "Cadastro por e-mail esta desativado neste ambiente. Contate o suporte para habilitar o acesso.";
    }

    if (normalized.includes(SCHEMA_ERROR_FRAGMENT)) {
        return context === "admin"
            ? "Sua conta administrativa esta inconsistente no banco. Contate o suporte para reprocessar o usuario admin."
            : "Sua conta esta inconsistente no banco. Contate o suporte para reprocessar seu acesso.";
    }

    if (normalized.includes("email not confirmed")) {
        return "Seu e-mail ainda nao foi confirmado. Verifique sua caixa de entrada.";
    }

    if (normalized.includes("too many requests")) {
        return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
    }

    if (normalized.includes("network") || normalized.includes("fetch") || normalized.includes("failed")) {
        return "Falha de conexao com o servidor de autenticacao. Tente novamente em instantes.";
    }

    return "Nao foi possivel autenticar agora. Tente novamente em instantes.";
}

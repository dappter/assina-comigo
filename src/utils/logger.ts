/**
 * Padroniza a exibição de erros críticos ou de autenticação no backend.
 * Facilita a identificação de falhas nos logs do servidor.
 */
export function logError(context: string, details: any, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${context}`, {
        ...details,
        message: error?.message || error?.toString(),
        stack: error?.stack,
    });
}

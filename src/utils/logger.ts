/**
 * Logger centralizado do sistema Assina Comigo.
 * Suporta múltiplos níveis (info, warn, error) com timestamp e contexto.
 * Mantém backward compatibility com a função logError anterior.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
    level: LogLevel;
    context: string;
    details: Record<string, unknown>;
    message?: string;
    stack?: string;
    timestamp: string;
}

function buildPayload(
    level: LogLevel,
    context: string,
    details: Record<string, unknown>,
    error?: unknown,
): LogPayload {
    return {
        level,
        context,
        details,
        message: error instanceof Error ? error.message : error !== undefined ? String(error) : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
    };
}

function emit(payload: LogPayload): void {
    const prefix = `[${payload.timestamp}] [${payload.level.toUpperCase()}] ${payload.context}`;
    const output = { ...payload.details, ...(payload.message ? { message: payload.message } : {}), ...(payload.stack ? { stack: payload.stack } : {}) };

    switch (payload.level) {
        case 'error':
            console.error(prefix, output);
            break;
        case 'warn':
            console.warn(prefix, output);
            break;
        default:
            console.log(prefix, output);
    }
}

/**
 * Logger com suporte a múltiplos níveis.
 *
 * @example
 * logger.info('[AUTH] Login bem-sucedido', { userId });
 * logger.warn('[AUTH] Tentativa de acesso negada', { ip });
 * logger.error('[DB] Falha ao inserir profile', { userId }, err);
 */
export const logger = {
    info: (context: string, details: Record<string, unknown> = {}): void =>
        emit(buildPayload('info', context, details)),

    warn: (context: string, details: Record<string, unknown> = {}, error?: unknown): void =>
        emit(buildPayload('warn', context, details, error)),

    error: (context: string, details: Record<string, unknown> = {}, error?: unknown): void =>
        emit(buildPayload('error', context, details, error)),
};

/**
 * Compatibilidade retroativa com o logError original.
 * Prefira usar `logger.error()` diretamente em novos módulos.
 */
export function logError(context: string, details: unknown, error?: unknown): void {
    logger.error(context, details as Record<string, unknown>, error);
}

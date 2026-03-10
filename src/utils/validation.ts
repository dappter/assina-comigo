/**
 * Remove caracteres de formatação de um número de telefone.
 * Extrai apenas os dígitos.
 */
export function sanitizePhone(phone: string): string {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
}

/**
 * Valida se o telefone (após sanitizado) tem um tamanho válido.
 * Telefones no Brasil têm 10 ou 11 dígitos (com DDD).
 */
export function isValidPhone(phone: string): boolean {
    const sanitized = sanitizePhone(phone);
    return sanitized.length === 10 || sanitized.length === 11;
}

/**
 * Remove caracteres de formatação do CPF.
 * Extrai apenas dígitos.
 */
export function sanitizeCPF(cpf: string): string {
    if (!cpf) return "";
    return cpf.replace(/\D/g, "");
}

/**
 * Valida se o CPF é matematicamente correto.
 */
export function isValidCPF(cpf: string): boolean {
    const sanitized = sanitizeCPF(cpf);
    if (sanitized.length !== 11) return false;

    // Rejeita sequências inválidas conhecidas (ex: 111.111.111-11)
    if (/^(\d)\1+$/.test(sanitized)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(sanitized.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(sanitized.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(sanitized.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(sanitized.substring(10, 11))) return false;

    return true;
}

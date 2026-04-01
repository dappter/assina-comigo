/**
 * Utilitários de Validação e Sanitização — Assina Comigo
 * Validadores puros, reutilizáveis entre SSR (Astro) e browser.
 */

// ── TELEFONE ──────────────────────────────────────────────────────────────────

/** Remove todos os caracteres não numéricos de um telefone. */
export function sanitizePhone(phone: string): string {
    if (!phone) return '';
    const digitsOnly = phone.replace(/\D/g, '');
    // Aceita +55 no input e normaliza para DDD + numero.
    if (digitsOnly.length === 13 && digitsOnly.startsWith('55')) {
        return digitsOnly.slice(2);
    }
    return digitsOnly;
}

/** Formata um telefone brasileiro para exibição enquanto o usuário digita. */
export function formatPhoneDisplay(phone: string): string {
    const digits = sanitizePhone(phone).slice(0, 11);
    if (!digits) return '';

    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Valida se o telefone (após sanitizado) tem tamanho válido.
 * Telefones brasileiros têm 10 ou 11 dígitos (com DDD).
 */
export function isValidPhone(phone: string): boolean {
    const sanitized = sanitizePhone(phone);
    return sanitized.length === 10 || sanitized.length === 11;
}

/**
 * Valida especificamente WhatsApp brasileiro (DDD + 9 + 8 digitos).
 * Exemplo valido: (88) 99876-5432
 */
export function isValidWhatsApp(phone: string): boolean {
    const sanitized = sanitizePhone(phone);
    if (!/^\d{11}$/.test(sanitized)) return false;
    if (/^(\d)\1+$/.test(sanitized)) return false;

    const ddd = Number(sanitized.slice(0, 2));
    if (ddd < 11 || ddd > 99) return false;

    // Celular brasileiro atual deve ter nono digito = 9.
    return sanitized[2] === '9';
}

// ── CPF ───────────────────────────────────────────────────────────────────────

/** Remove todos os caracteres não numéricos de um CPF. */
export function sanitizeCPF(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '');
}

/** Formata CPF para exibição enquanto o usuário digita. */
export function formatCPFDisplay(cpf: string): string {
    const digits = sanitizeCPF(cpf).slice(0, 11);
    if (!digits) return '';

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Valida matematicamente um CPF (cálculo dos dígitos verificadores).
 * Rejeita sequências inválidas como 111.111.111-11.
 */
export function isValidCPF(cpf: string): boolean {
    const sanitized = sanitizeCPF(cpf);
    if (sanitized.length !== 11) return false;
    if (/^(\d)\1+$/.test(sanitized)) return false;

    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(sanitized.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(sanitized.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(sanitized.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(sanitized.substring(10, 11))) return false;

    return true;
}

// ── CNPJ ──────────────────────────────────────────────────────────────────────

/** Valida matematicamente um CNPJ. */
export function isValidCNPJ(cnpj: string): boolean {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    let pos = 5;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(digits[i]) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits[12])) return false;

    sum = 0;
    pos = 6;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(digits[i]) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits[13]);
}

// ── EMAIL ─────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/** Valida o formato completo de um e-mail via regex robusto. */
export function isValidEmail(email: string): boolean {
    if (!email) return false;
    return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/** Mapa de typos comuns para sugestão automática de domínio. */
const DOMAIN_TYPOS: Record<string, string> = {
    'gmal.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmail.com.br': 'gmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmail.com.br': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'iclod.com': 'icloud.com',
    'yaho.com': 'yahoo.com',
};

/**
 * Sugere correção para domínios com typos comuns.
 * Retorna o e-mail corrigido ou null se não houver sugestão.
 */
export function suggestEmailCorrection(email: string): string | null {
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return null;
    const suggestion = DOMAIN_TYPOS[parts[1]];
    return suggestion ? `${parts[0]}@${suggestion}` : null;
}

// ── SENHA ─────────────────────────────────────────────────────────────────────

const COMMON_PASSWORDS = new Set([
    '12345678', '123456789', '1234567890', 'password', 'password1',
    'qwerty123', '12345678', 'abc12345', 'senha', 'senha123',
    'brasil', 'brasil123', '123123', 'admin', 'admin123',
    'letmein', 'welcome', '00000000', '11111111', 'pass1234',
    'master', 'dragon', 'monkey', 'login', 'test1234',
]);

export type PasswordStrength = 'fraca' | 'razoável' | 'boa' | 'forte';

export interface PasswordAnalysis {
    /** Pontuação de 0 (sem senha) a 4 (forte). */
    score: number;
    /** Rótulo descritivo da força. */
    strength: PasswordStrength | '';
    /** Feedbacks para o usuário melhorar a senha. */
    feedback: string[];
    /** Indica se a senha é minimamente aceitável. */
    isAcceptable: boolean;
}

/**
 * Analisa a força de uma senha de forma detalhada.
 * Retorna pontuação, rótulo e feedback para o usuário.
 */
export function analyzePassword(password: string): PasswordAnalysis {
    if (!password) {
        return { score: 0, strength: '', feedback: [], isAcceptable: false };
    }

    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
        return {
            score: 1,
            strength: 'fraca',
            feedback: ['Esta senha é muito comum. Escolha uma senha única.'],
            isAcceptable: false,
        };
    }

    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
        feedback.push('Use no mínimo 8 caracteres');
    } else if (password.length >= 12) {
        score += 2;
    } else {
        score += 1;
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasLower || !hasUpper) feedback.push('Use letras maiúsculas e minúsculas');
    if (!hasNumber) feedback.push('Adicione pelo menos um número');
    if (!hasSpecial) feedback.push('Adicione um caractere especial (!@#$%)');

    const typeCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    score += Math.min(typeCount - 1, 2);
    if (password.length < 8) score = Math.max(1, score - 2);
    score = Math.min(4, Math.max(password.length < 8 ? 1 : 0, score));

    const strengthMap: Record<number, PasswordStrength> = {
        1: 'fraca', 2: 'razoável', 3: 'boa', 4: 'forte',
    };

    const isAcceptable = password.length >= 8 && hasLower && hasUpper && hasNumber;

    return {
        score,
        strength: score > 0 ? strengthMap[score] ?? 'forte' : '',
        feedback,
        isAcceptable,
    };
}

/**
 * Verifica se a senha atende ao requisito mínimo de segurança:
 * - Pelo menos 8 caracteres
 * - Letras maiúsculas e minúsculas
 * - Pelo menos um número
 * - Não é uma senha comum conhecida
 */
export function isStrongEnough(password: string): boolean {
    if (!password || password.length < 8) return false;
    if (COMMON_PASSWORDS.has(password.toLowerCase())) return false;
    return /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

// ── PIX ───────────────────────────────────────────────────────────────────────

/**
 * Valida uma chave PIX de acordo com seu tipo.
 * Tipos suportados: cpf | cnpj | email | telefone | aleatoria
 */
export function isValidPixKey(key: string, tipo: string): boolean {
    if (!key || !tipo) return false;
    const clean = key.trim();

    switch (tipo) {
        case 'cpf':
            return isValidCPF(clean);
        case 'cnpj':
            return isValidCNPJ(clean);
        case 'email':
            return isValidEmail(clean);
        case 'telefone':
            return isValidPhone(clean);
        case 'aleatoria':
            // Aceita UUID (v4) ou chave aleatória BCB (26 chars alfanuméricos)
            return (
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean) ||
                /^[a-zA-Z0-9]{26,36}$/.test(clean)
            );
        default:
            return false;
    }
}

// ── NOME ──────────────────────────────────────────────────────────────────────

/**
 * Valida se o nome é aceitável:
 * - Mínimo de 3 caracteres
 * - Não pode ser somente números
 */
export function isValidNome(nome: string): boolean {
    const clean = nome.trim();
    return clean.length >= 3 && !/^\d+$/.test(clean);
}

// ── MÁSCARAS DE INPUT (CLIENT-SIDE) ───────────────────────────────────────

/**
 * Função reutilizável para aplicar máscara em input de telefone (WhatsApp).
 * - Formata em tempo real conforme o usuário digita
 * - Limita a 11 dígitos
 * - Armazena valor limpo internamente
 * - Ao submit, envia apenas números
 */
export function applyPhoneMask(input: HTMLInputElement | null): void {
    if (!input) return;

    // Função que roda a cada keystroke
    const handleInput = () => {
        const display = formatPhoneDisplay(input.value);
        const raw = sanitizePhone(input.value);

        // Atualiza o display com formatação
        input.value = display;

        // Armazena o valor limpo para envio
        input.dataset.rawValue = raw;
    };

    // Função de limpeza ao submit
    const handleBlur = () => {
        input.dataset.rawValue = sanitizePhone(input.value);
    };

    // Função para restaurar valor limpo no submit
    const restoreRawValue = () => {
        const rawValue = input.dataset.rawValue || sanitizePhone(input.value);
        input.value = rawValue;
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('blur', handleBlur);

    // Restaura valor limpo quando o formulário é enviado
    const form = input.closest('form');
    if (form) {
        form.addEventListener('submit', () => {
            restoreRawValue();
        });
    }
}

/**
 * Função reutilizável para aplicar máscara em input de CPF.
 * - Formata em tempo real conforme o usuário digita
 * - Limita a 11 dígitos
 * - Armazena valor limpo internamente
 * - Ao submit, envia apenas números
 */
export function applyCPFMask(input: HTMLInputElement | null): void {
    if (!input) return;

    const handleInput = () => {
        const display = formatCPFDisplay(input.value);
        const raw = sanitizeCPF(input.value);

        input.value = display;
        input.dataset.rawValue = raw;
    };

    const handleBlur = () => {
        input.dataset.rawValue = sanitizeCPF(input.value);
    };

    const restoreRawValue = () => {
        const rawValue = input.dataset.rawValue || sanitizeCPF(input.value);
        input.value = rawValue;
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('blur', handleBlur);

    const form = input.closest('form');
    if (form) {
        form.addEventListener('submit', () => {
            restoreRawValue();
        });
    }
}

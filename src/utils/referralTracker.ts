// Utilitário para rastreamento de parceiros baseado no modelo "Último Clique" (Last Click)
// Conforme diretrizes de Segurança e Atribuição do projeto Assina Comigo (SKILL.md)

export class ReferralTracker {
    static STORAGE_KEY = 'assina_comigo_referral';
    static EXPIRATION_DAYS = 30; // Janela de conversão

    /**
     * Captura o ID do parceiro da URL e o armazena no localStorage.
     * Sobrescreve dados anteriores garantindo o modelo "Último Clique".
     * Recomenda-se chamar essa função no Mount/Load das páginas públicas.
     */
    static capturePartnerParams() {
        if (typeof window === 'undefined') return; // Segurança SSR (Astro)

        const urlParams = new URLSearchParams(window.location.search);
        // Suporta tanto ?ref= quanto ?partner_id=
        const partnerId = urlParams.get('ref') || urlParams.get('partner_id');

        if (partnerId) {
            const attributionData = {
                partnerId: partnerId,
                timestamp: Date.now(),
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attributionData));
        }
    }

    /**
     * Resgata o parceiro atribuído no momento do envio do formulário.
     * Retorna ID do parceiro ou null se não houver atribuição/expirou.
     */
    static getAttributedPartner(): string | null {
        if (typeof window === 'undefined') return null; // Segurança SSR (Astro)

        const dataStr = localStorage.getItem(this.STORAGE_KEY);
        if (!dataStr) return null;

        try {
            const data = JSON.parse(dataStr);
            const expirationMs = this.EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

            // Verifica a janela de conversão
            if (Date.now() - data.timestamp > expirationMs) {
                localStorage.removeItem(this.STORAGE_KEY);
                return null; // Expiração da atribuição
            }

            return data.partnerId;
        } catch (e) {
            // Em caso de corrupção do storage, limpar para evitar travamentos
            localStorage.removeItem(this.STORAGE_KEY);
            return null;
        }
    }

    /**
     * Limpa a atribuição (útil após confirmação de fluxo com sucesso, para evitar múltiplos cadastros seguidos no mesmo aparelho sem ref-click)
     */
    static clearAttribution() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

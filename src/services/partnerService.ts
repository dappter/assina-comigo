import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';

/**
 * Representa o perfil de um parceiro com dados opcionais do grupo associado.
 */
export interface Profile {
    id: string;
    tenant_id: string;
    nome: string;
    slug?: string;
    email: string;
    telefone?: string;
    cpf?: string;
    tipo_pix?: string | null;
    chave_pix?: string | null;
    tipo_usuario: 'admin' | 'parceiro';
    status: 'pendente' | 'ativo' | 'bloqueado';
    grupo_id?: string | null;
    saldo_pontos?: number;
    grupo?: {
        nome: string;
        tipo_remuneracao?: 'dinheiro' | 'pontos';
        valor_recompensa: number;
        meta_vendas: number;
        descricao?: string;
    } | null;
    created_at: string;
}

export const partnerService = {
    /**
     * Lista todos os parceiros de um tenant, com seus grupos associados.
     */
    async getPartners(tenantId: string): Promise<Profile[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, grupo:grupos_parceiros(nome, valor_recompensa, tipo_remuneracao, meta_vendas, descricao)')
            .eq('tenant_id', tenantId)
            .eq('tipo_usuario', 'parceiro')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[partnerService] Erro ao listar parceiros:', error);
            throw error;
        }
        return (data || []) as Profile[];
    },

    /**
     * Busca um parceiro específico com os dados completos do grupo (usado no painel do parceiro).
     */
    async getPartnerById(tenantId: string, partnerId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, grupo:grupos_parceiros(nome, valor_recompensa, tipo_remuneracao, meta_vendas, descricao)')
            .eq('tenant_id', tenantId)
            .eq('id', partnerId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('[partnerService] Erro ao buscar parceiro por ID:', error);
            throw error;
        }
        return data as Profile | null;
    },

    /**
     * Busca um parceiro pelo slug amigável (usado na landing page pública /ref/[slug]).
     * Utiliza a função SQL segura para ignorar RLS sem expor dados sensíveis.
     */
    async getPartnerBySlug(slug: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .rpc('fn_get_partner_by_slug', { p_slug: slug });

        if (error) {
            console.error('[partnerService] Erro ao buscar parceiro por slug:', error);
            return null;
        }
        return (data && data.length > 0 ? data[0] : null) as Profile | null;
    },

    /**
     * Busca um parceiro por ID sem filtro de tenant (fallback antigo — compatibilidade).
     * @deprecated Prefira getPartnerBySlug para páginas públicas.
     */
    async getPartnerByIdGlobal(partnerId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('[partnerService] Erro ao buscar parceiro global:', error);
            return null;
        }
        return data as Profile | null;
    },

    /**
     * Atualiza campos de um parceiro (grupo, status, etc.).
     */
    async updatePartner(tenantId: string, partnerId: string, data: Partial<Profile>): Promise<boolean> {
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('tenant_id', tenantId)
            .eq('id', partnerId);

        if (error) {
            console.error('[partnerService] Erro ao atualizar parceiro:', error);
            throw error;
        }
        return true;
    },

    /**
     * Ativa ou rejeita o cadastro de um parceiro pendente.
     * Seguro pois exige tenant_id para evitar edição cross-tenant.
     */
    async setPartnerStatus(
        tenantId: string,
        partnerId: string,
        status: 'ativo' | 'pendente' | 'bloqueado'
    ): Promise<boolean> {
        return partnerService.updatePartner(tenantId, partnerId, { status } as any);
    },
};

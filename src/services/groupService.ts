import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';

/**
 * Representa um grupo de parceiros com suas regras de remuneração.
 */
export interface GrupoParceiro {
    id: string;
    tenant_id: string;
    nome: string;
    slug: string;
    link_captacao: string;
    descricao?: string | null;
    tipo_remuneracao: 'dinheiro' | 'pontos';
    valor_recompensa: number;
    meta_vendas: number;
    dias_quarentena: number;
    gatilho: string;
    created_at: string;
}

export interface CreateGrupoPayload {
    nome: string;
    tipo_remuneracao: 'dinheiro' | 'pontos';
    valor_recompensa: number;
    meta_vendas?: number;
    descricao?: string | null;
    dias_quarentena?: number;
    gatilho?: string;
}

export const groupService = {
    /**
     * Lista todos os grupos de parceiros do tenant.
     */
    async getGroups(tenantId: string): Promise<GrupoParceiro[]> {
        const { data, error } = await supabase
            .from('grupos_parceiros')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('nome', { ascending: true });

        if (error) {
            console.error('[groupService] Erro ao listar grupos:', error);
            throw error;
        }
        return (data || []) as GrupoParceiro[];
    },

    /**
     * Busca um grupo pelo seu slug amigável (usado na página de captação pública).
     * Usa a função SQL segura que ignora RLS para funcionar sem autenticação.
     */
    async getGroupBySlug(slug: string): Promise<GrupoParceiro | null> {
        const { data, error } = await supabase
            .rpc('fn_get_grupo_by_slug', { p_slug: slug });

        if (error) {
            console.error('[groupService] Erro ao buscar grupo por slug:', error);
            return null;
        }
        return (data && data.length > 0 ? data[0] : null) as GrupoParceiro | null;
    },

    /**
     * Cria um novo grupo de parceiros.
     * O slug e o link_captacao são gerados automaticamente pelo trigger no banco.
     */
    async createGroup(tenantId: string, payload: CreateGrupoPayload): Promise<GrupoParceiro> {
        const { data, error } = await supabase
            .from('grupos_parceiros')
            .insert([{
                tenant_id: tenantId,
                nome: payload.nome,
                tipo_remuneracao: payload.tipo_remuneracao,
                valor_recompensa: payload.valor_recompensa,
                meta_vendas: payload.meta_vendas ?? 1,
                descricao: payload.descricao ?? null,
                dias_quarentena: payload.dias_quarentena ?? 0,
                gatilho: payload.gatilho ?? 'Instalado',
            }])
            .select('*')
            .single();

        if (error) {
            console.error('[groupService] Erro ao criar grupo:', error);
            throw error;
        }
        return data as GrupoParceiro;
    },

    /**
     * Atualiza dados de um grupo existente (nome, tipo, valor).
     * Não altera slug — o slug é imutável após criação.
     */
    async updateGroup(
        tenantId: string,
        groupId: string,
        payload: Partial<CreateGrupoPayload>
    ): Promise<boolean> {
        const { error } = await supabase
            .from('grupos_parceiros')
            .update(payload)
            .eq('id', groupId)
            .eq('tenant_id', tenantId);

        if (error) {
            console.error('[groupService] Erro ao atualizar grupo:', error);
            throw error;
        }
        return true;
    },

    /**
     * Retorna a URL completa do link de captação de um grupo.
     */
    buildCaptacaoUrl(slug: string, baseUrl?: string): string {
        const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
        return `${base}/grupo/${slug}`;
    },
};

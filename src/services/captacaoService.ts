import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';
import type { GrupoParceiro } from './groupService';

/**
 * Representa o vínculo temporário de captação armazenado na URL de redirecionamento.
 * Quando um parceiro acessa /grupo/[slug] e faz cadastro, o grupo_id é associado automaticamente.
 */
export interface CaptacaoContext {
    grupoId: string;
    grupoNome: string;
    grupoSlug: string;
    grupoDescricao?: string | null;
    tipoRemuneracao: 'dinheiro' | 'pontos';
    valorRecompensa: number;
    tenantId: string;
}

export const captacaoService = {
    /**
     * Busca o contexto completo de um grupo de captação pelo slug.
     * Esta função é usada nas páginas públicas (/grupo/[slug]) antes de qualquer login.
     */
    async getCaptacaoContext(slug: string): Promise<CaptacaoContext | null> {
        const { data, error } = await supabase
            .rpc('fn_get_grupo_by_slug', { p_slug: slug });

        if (error || !data || data.length === 0) {
            console.error('[captacaoService] Grupo não encontrado para slug:', slug, error);
            return null;
        }

        const grupo = data[0] as GrupoParceiro;

        return {
            grupoId: grupo.id,
            grupoNome: grupo.nome,
            grupoSlug: grupo.slug,
            grupoDescricao: (grupo as any).descricao ?? null,
            tipoRemuneracao: grupo.tipo_remuneracao,
            valorRecompensa: grupo.valor_recompensa,
            tenantId: grupo.tenant_id,
        };
    },

    /**
     * Associa um parceiro recém-registrado ao grupo de captação.
     * Chamado logo após o registro do parceiro, antes de redirecionar ao dashboard.
     */
    async associarParceiroAoGrupo(parceiroId: string, grupoId: string): Promise<boolean> {
        const { error } = await supabase
            .from('profiles')
            .update({ grupo_id: grupoId })
            .eq('id', parceiroId);

        if (error) {
            console.error('[captacaoService] Erro ao associar parceiro ao grupo:', error);
            throw error;
        }
        return true;
    },

    /**
     * Verifica se um parceiro já pertence a algum grupo.
     */
    async parceiroJaTemGrupo(parceiroId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('profiles')
            .select('grupo_id')
            .eq('id', parceiroId)
            .single();

        if (error) return false;
        return !!data?.grupo_id;
    },
};

import { supabase } from '../lib/supabaseClient';

export interface Comissao {
    id: string;
    tenant_id: string;
    lead_id: string | null;
    parceiro_id: string | null;
    valor: number | null;
    status: string | null;
    release_date: string | null;
    created_at: string;
}

export const rewardService = {
    async getRewards(tenantId: string, parceiroId?: string): Promise<Comissao[]> {
        let query = supabase
            .from('comissoes')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (parceiroId) {
            query = query.eq('parceiro_id', parceiroId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching rewards:', error);
            throw error;
        }
        return data || [];
    },

    async getRewardStats(tenantId: string, parceiroId: string) {
        const { data, error } = await supabase
            .from('comissoes')
            .select('valor, status')
            .eq('tenant_id', tenantId)
            .eq('parceiro_id', parceiroId);

        if (error) {
            console.error('Error fetching reward stats:', error);
            throw error;
        }

        let pendentes = 0;
        let pagas = 0;

        data?.forEach(reward => {
            const valor = reward.valor || 0;
            // Trata strings como "Pendente", "Pago", "pendente", "pago"
            if (reward.status?.toLowerCase() === 'pendente') {
                pendentes += valor;
            } else if (reward.status?.toLowerCase() === 'pago') {
                pagas += valor;
            }
        });

        return {
            pendentes,
            pagas,
            total: pendentes + pagas
        };
    }
};

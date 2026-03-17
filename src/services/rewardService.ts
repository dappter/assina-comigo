import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';

export interface Comissao {
    id: string;
    tenant_id: string;
    lead_id: string | null;
    parceiro_id: string | null;
    valor: number | null;
    status: string | null;
    release_date: string | null;
    tipo: string | null;
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
            .select('valor, status, tipo')
            .eq('tenant_id', tenantId)
            .eq('parceiro_id', parceiroId);

        if (error) {
            console.error('Error fetching reward stats:', error);
            throw error;
        }

        let aPagar = 0; // Prontos para pagamento
        let concluidas = 0; // Já pagas e finalizadas
        let pendentes = 0; // Em quarentena / pendentes

        data?.forEach(reward => {
            // Ignoramos recompensas do tipo 'pontos' nos cálculos financeiros
            if (reward.tipo?.toLowerCase() === 'pontos') return;

            const valor = reward.valor || 0;
            const sts = reward.status?.toLowerCase();
            
            if (sts === 'a_pagar') {
                aPagar += valor;
            } else if (sts === 'pago') {
                concluidas += valor;
            } else if (sts === 'pendente') {
                pendentes += valor;
            }
        });

        return {
            aPagar,
            concluidas,
            pendentes,
            total: aPagar + concluidas + pendentes
        };
    },
    
    async getPagamentos(tenantId: string, parceiroId: string) {
        const { data, error } = await supabase
            .from('pagamentos')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('parceiro_id', parceiroId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pagamentos:', error);
            throw error;
        }

        return data || [];
    }
};

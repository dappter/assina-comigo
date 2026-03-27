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

        let aPagar = 0; // Dinheiro pronto para pagamento
        let concluidas = 0; // Dinheiro já pago
        let pendentes = 0; // Dinheiro em quarentena
        let pontosPendentes = 0; // Pontos aguardando aprovação
        let pontosConcluidos = 0; // Pontos já creditados

        data?.forEach(reward => {
            const valor = Number(reward.valor) || 0;
            const sts = reward.status?.toLowerCase();
            const tipo = reward.tipo?.toLowerCase();
            
            if (tipo === 'pontos') {
                if (sts === 'a_pagar') {
                    pontosPendentes += valor;
                } else if (sts === 'pago') {
                    pontosConcluidos += valor;
                }
            } else {
                if (sts === 'a_pagar') {
                    aPagar += valor;
                } else if (sts === 'pago') {
                    concluidas += valor;
                } else if (sts === 'pendente') {
                    pendentes += valor;
                }
            }
        });

        return {
            aPagar,
            concluidas,
            pendentes,
            pontosPendentes,
            pontosConcluidos,
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

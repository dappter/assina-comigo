import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';

export interface DashboardStats {
    totalLeads: number;
    leadsInstaladas: number;
    pagamentosPendentes: number;
    parceirosAtivos: number;
}

export const adminService = {
    async getDashboardStats(tenantId: string): Promise<DashboardStats> {
        // Leads totais e instaladas
        const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('status')
            .eq('tenant_id', tenantId);

        if (leadsError) throw leadsError;

        const totalLeads = leads?.length || 0;
        const leadsInstaladas = leads?.filter(l => l.status === 'Instalado' || l.status === 'instalado').length || 0;

        // Pagamentos pendentes (Liberados da quarentena, prontos para ação do admin)
        const { data: comissoes, error: comissoesError } = await supabase
            .from('comissoes')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('status', 'a_pagar');

        if (comissoesError) throw comissoesError;
        const pagamentosPendentes = comissoes?.length || 0;

        // Parceiros ativos
        const { data: parceiros, error: parceirosError } = await supabase
            .from('profiles')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('tipo_usuario', 'parceiro');

        if (parceirosError) throw parceirosError;
        const parceirosAtivos = parceiros?.length || 0;

        return {
            totalLeads,
            leadsInstaladas,
            pagamentosPendentes,
            parceirosAtivos
        };
    },

    async getParceiros(tenantId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('tipo_usuario', 'parceiro')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updatePartner(tenantId: string, partnerId: string, data: any) {
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', partnerId)
            .eq('tenant_id', tenantId);

        if (error) throw error;
        return true;
    },

    async getIndicacoes(tenantId: string) {
        const { data, error } = await supabase
            .from('leads')
            .select('*, parceiro:profiles(nome)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updateIndicacaoStatus(leadId: string, status: string, tenantId?: string) {
        // Updated lead status
        const { error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', leadId);

        if (error) throw error;

        // --- SISTEMA INTERNO DE GERAÇÃO DE COMISSÃO (Sem depender do n8n) ---
        // Se o status for de sucesso (Instalado / Aceito, dependendo da regra geral)
        if (status.toLowerCase() === 'instalado' || status.toLowerCase() === 'aceito') {
            // Buscamos o lead para saber quem é o parceiro
            const { data: leadData } = await supabase
                .from('leads')
                .select('parceiro_id, tenant_id')
                .eq('id', leadId)
                .single();

            if (leadData) {
                const parceiroId = leadData.parceiro_id;
                const leadTenant = tenantId || leadData.tenant_id;

                // Evitar duplicidade de comissão para o mesmo lead
                const { data: comissaoExistente } = await supabase
                    .from('comissoes')
                    .select('id')
                    .eq('lead_id', leadId)
                    .single();

                if (!comissaoExistente) {
                    // Puxar as regras financeiras do grupo do parceiro
                    const { data: parceiroData } = await supabase
                        .from('profiles')
                        .select('grupo_id')
                        .eq('id', parceiroId)
                        .single();

                    let valorRecompensa = 0; // fallback
                    let tipoRemuneracao = 'dinheiro';

                    if (parceiroData && parceiroData.grupo_id) {
                        const { data: grupoData } = await supabase
                            .from('grupos_parceiros')
                            .select('valor_recompensa, tipo_remuneracao')
                            .eq('id', parceiroData.grupo_id)
                            .single();

                        if (grupoData) {
                            valorRecompensa = grupoData.valor_recompensa || 0;
                            tipoRemuneracao = grupoData.tipo_remuneracao || 'dinheiro';
                        }
                    }

                    // Insere a comissão diretamente para pagamento ('a_pagar') - Removido quarentena
                    await supabase
                        .from('comissoes')
                        .insert([{
                            tenant_id: leadTenant,
                            parceiro_id: parceiroId,
                            lead_id: leadId,
                            valor: valorRecompensa,
                            tipo: tipoRemuneracao,
                            status: 'a_pagar'
                        }]);
                }
            }
        }

        return true;
    },

    async getPagamentos(tenantId: string) {
        const { data, error } = await supabase
            .from('comissoes')
            .select('*, parceiro:profiles(nome, chave_pix, tipo_pix), lead:leads(nome)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updatePagamento(comissaoId: string, status: string, valor?: number) {
        let finalStatus = status;
        let finalTipo: string | undefined = undefined;

        // Se for pagamento em pontos, precisamos creditar no perfil do parceiro
        if (status === 'pago_pontos') {
            // Buscamos a comissão para saber o valor e o parceiro
            const { data: comissao } = await supabase
                .from('comissoes')
                .select('valor, parceiro_id')
                .eq('id', comissaoId)
                .single();

            if (comissao && comissao.parceiro_id) {
                // Incrementa o saldo de pontos do parceiro via Admin (bypass RLS para integridade)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('saldo_pontos')
                    .eq('id', comissao.parceiro_id)
                    .single();

                // CORREÇÃO CRÍTICA: Priorizar valor editado e evitar fallback de || para 0 ou undefined
                const valorFinal = valor !== undefined && valor !== null ? Number(valor) : (Number(comissao.valor) || 0);
                const novoSaldo = (Number(profile?.saldo_pontos) || 0) + valorFinal;

                console.log(`[PONTOS] Creditando ${valorFinal} pts. Antigo: ${profile?.saldo_pontos || 0}, Novo: ${novoSaldo}`);

                await supabase
                    .from('profiles')
                    .update({ saldo_pontos: novoSaldo })
                    .eq('id', comissao.parceiro_id);

                // Marca a comissão como paga e agora convertida em pontos
                finalStatus = 'pago';
                finalTipo = 'pontos';
            }
        }

        const updateData: any = { status: finalStatus };
        if (finalTipo) updateData.tipo = finalTipo;
        if (valor !== undefined) updateData.valor = valor;

        const { error } = await supabase
            .from('comissoes')
            .update(updateData)
            .eq('id', comissaoId);

        if (error) throw error;
        return true;
    },



    async getGrupos(tenantId: string) {
        const { data, error } = await supabase
            .from('grupos_parceiros')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async saveGrupo(tenantId: string, grupo: any) {
        const payload = { ...grupo, tenant_id: tenantId };
        if (grupo.id) {
            const { error } = await supabase.from('grupos_parceiros').update(payload).eq('id', grupo.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('grupos_parceiros').insert([payload]);
            if (error) throw error;
        }
    },

    async getConfiguracoes(tenantId: string) {
        const { data, error } = await supabase
            .from('tenant_settings')
            .select('*')
            .eq('tenant_id', tenantId)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignora erro de "not found" para não quebrar UI caso não tenha
            console.error('Erro ao buscar configurações:', error);
            throw error;
        }
        return data;
    },

    async updateConfiguracoes(tenantId: string, config: any) {
        // Verificar se ja existe, se não faz insert
        const existing = await this.getConfiguracoes(tenantId);

        let error;
        if (existing) {
            const { error: updateError } = await supabase
                .from('tenant_settings')
                .update(config)
                .eq('tenant_id', tenantId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('tenant_settings')
                .insert([{ ...config, tenant_id: tenantId }]);
            error = insertError;
        }

        if (error) throw error;
        return true;
    }
};

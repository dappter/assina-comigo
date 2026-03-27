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

    async getParceiroById(tenantId: string, id: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error) throw error;
        return data;
    },

    async deletePartner(tenantId: string, id: string) {
        const { error } = await supabase
            .from('leads')
            .select('id')
            .eq('parceiro_id', id)
            .eq('tenant_id', tenantId)
            .limit(1);
        
        // Se desejar bloquear deleção de parceiros com leads, pode fazer aqui.
        // Por enquanto, deletando direto com filtro de tenant.
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (deleteError) throw deleteError;
        return true;
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

    async updateIndicacaoStatus(leadId: string, status: string, tenantId: string) {
        // Atualiza o status do lead
        const { error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', leadId)
            .eq('tenant_id', tenantId);

        if (error) throw error;

        // Regra de negócio: "Implementar sistema onde o usuário ganha sempre, sem metas"
        // E "Remover qualquer referência ao card quarentena" (Entra direto como 'a_pagar')
        if (status === 'Instalado' || status === 'instalado') {
            // Verificar se já existe comissão processada/pendente para este lead
            const { data: existingComissao } = await supabase
                .from('comissoes')
                .select('id')
                .eq('lead_id', leadId)
                .single();

            if (!existingComissao) {
                // Busca o lead para pegar o parceiro_id
                const { data: leadData } = await supabase
                    .from('leads')
                    .select('parceiro_id')
                    .eq('id', leadId)
                    .single();

                if (leadData?.parceiro_id) {
                    // Busca o grupo do parceiro para obter o valor da recompensa e o tipo (dinheiro/pontos)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('grupo_id')
                        .eq('id', leadData.parceiro_id)
                        .single();

                    let recompensa = 0;
                    if (profile?.grupo_id) {
                        const { data: grupo } = await supabase
                            .from('grupos_parceiros')
                            .select('valor_recompensa')
                            .eq('id', profile.grupo_id)
                            .single();
                        recompensa = grupo?.valor_recompensa || 0;
                    }

                    // Insere direto em 'a_pagar'
                    const { error: comissaoError } = await supabase
                        .from('comissoes')
                        .insert({
                            tenant_id: tenantId,
                            lead_id: leadId,
                            parceiro_id: leadData.parceiro_id,
                            valor: recompensa,
                            status: 'a_pagar'
                        });

                    if (comissaoError) {
                        console.error('[adminService] Erro ao criar comissão a pagar:', comissaoError);
                    } else {
                        console.log(`[adminService] Comissão de R$${recompensa} criada para lead ${leadId} e atribuída ao parceiro ${leadData.parceiro_id}`);
                    }
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

    async updatePagamento(comissaoId: string, status: string, tenantId: string, valor?: number) {
        let finalStatus = status;
        let finalTipo: string | undefined = undefined;

        // Se for pagamento em pontos, precisamos creditar no perfil do parceiro
        if (status === 'pago_pontos') {
            // Buscamos a comissão para saber o valor e o parceiro, validando o tenant
            const { data: comissao } = await supabase
                .from('comissoes')
                .select('valor, parceiro_id')
                .eq('id', comissaoId)
                .eq('tenant_id', tenantId)
                .single();

            if (comissao && comissao.parceiro_id) {
                // Incrementa o saldo de pontos do parceiro via Admin (bypass RLS para integridade)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('saldo_pontos')
                    .eq('id', comissao.parceiro_id)
                    .eq('tenant_id', tenantId)
                    .single();

                const valorFinal = valor !== undefined && valor !== null ? Number(valor) : (Number(comissao.valor) || 0);
                const novoSaldo = (Number(profile?.saldo_pontos) || 0) + valorFinal;

                console.log(`[PONTOS] Creditando ${valorFinal} pts. Antigo: ${profile?.saldo_pontos || 0}, Novo: ${novoSaldo}`);

                await supabase
                    .from('profiles')
                    .update({ saldo_pontos: novoSaldo })
                    .eq('id', comissao.parceiro_id)
                    .eq('tenant_id', tenantId);

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
            .eq('id', comissaoId)
            .eq('tenant_id', tenantId);

        if (error) throw error;

        // ─── ATUALIZAR O STATUS DO LEAD PARA 'PAGO' ───────────────────────────
        try {
            const { data: comissaoVinculo } = await supabase
                .from('comissoes')
                .select('lead_id')
                .eq('id', comissaoId)
                .eq('tenant_id', tenantId)
                .single();

            if (comissaoVinculo?.lead_id) {
                await supabase
                    .from('leads')
                    .update({ status: 'PAGO' })
                    .eq('id', comissaoVinculo.lead_id)
                    .eq('tenant_id', tenantId);

                console.log(`[PAGAMENTO] Lead ${comissaoVinculo.lead_id} atualizado para PAGO.`);
            }
        } catch (leadUpdateError) {
            console.error('[PAGAMENTO] Aviso: falha ao atualizar status do lead:', leadUpdateError);
        }

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
            const { error } = await supabase.from('grupos_parceiros')
                .update(payload)
                .eq('id', grupo.id)
                .eq('tenant_id', tenantId);
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
    },

    async getPartnerLeadsCount(tenantId: string) {
        // Busca apenas o parceiro_id de todos os leads instalados do tenant
        const { data, error } = await supabase
            .from('leads')
            .select('parceiro_id')
            .eq('tenant_id', tenantId)
            .eq('status', 'Instalado');
        
        if (error) {
            console.error('[adminService] Erro ao buscar leads para contagem:', error);
            return { data: [] };
        }

        // Agrupa e conta em memória (seguro para escala atual)
        const counts: Record<string, number> = {};
        data?.forEach(lead => {
            if (lead.parceiro_id) {
                counts[lead.parceiro_id] = (counts[lead.parceiro_id] || 0) + 1;
            }
        });

        // Converte para o formato esperado pelo Map no frontend
        const formatted = Object.entries(counts).map(([parceiro_id, count]) => ({
            parceiro_id,
            count
        }));

        return { data: formatted };
    }
};

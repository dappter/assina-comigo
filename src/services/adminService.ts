import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';

export interface DashboardStats {
    totalLeads: number;
    leadsInstaladas: number;
    pagamentosPendentes: number;
    parceirosAtivos: number;
}

export const adminService = {
    async getComissaoById(comissaoId: string, tenantId: string) {
        const { data, error } = await supabase
            .from('comissoes')
            .select('id, status, tenant_id')
            .eq('id', comissaoId)
            .eq('tenant_id', tenantId)
            .single();

        if (error) throw error;
        return data;
    },

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
            .select('*, parceiro:profiles!leads_parceiro_id_fkey(nome), vendedor:profiles!leads_vendedor_id_fkey(nome)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            // Fallback para query sem o join de vendedor (compatibilidade)
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('leads')
                .select('*, parceiro:profiles(nome)')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });

            if (fallbackError) throw fallbackError;
            return fallbackData || [];
        }
        return data || [];
    },

    /**
     * Busca todos os usuários com papel de vendedor ou admin no tenant.
     * Usado para popular o select de atribuição de leads.
     */
    async getVendedores(tenantId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, nome, email, tipo_usuario')
            .eq('tenant_id', tenantId)
            .in('tipo_usuario', ['vendedor', 'admin'])
            .order('nome', { ascending: true });

        if (error) {
            console.warn('[adminService] Erro ao buscar vendedores:', error.message);
            return [];
        }
        return data || [];
    },

    /**
     * Atribui ou remove um vendedor de um lead.
     * @param leadId - ID do lead
     * @param vendedorId - ID do perfil do vendedor (ou null para desatribuir)
     * @param tenantId - Tenant de segurança
     */
    async updateLeadVendedor(leadId: string, vendedorId: string | null, tenantId: string) {
        const { error } = await supabase
            .from('leads')
            .update({ vendedor_id: vendedorId })
            .eq('id', leadId)
            .eq('tenant_id', tenantId);

        if (error) throw error;
        return true;
    },

    async updateIndicacaoStatus(leadId: string, status: string, tenantId: string) {
        // Atualiza o status do lead
        const { error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', leadId)
            .eq('tenant_id', tenantId);

        if (error) throw error;

        // Regra de segurança: ao instalar, cria no máximo uma comissão por lead
        // e já inicia como a_pagar para seguir o fluxo operacional atual.
        if (status === 'Instalado' || status === 'instalado') {
            const { data: existingComissao, error: existingError } = await supabase
                .from('comissoes')
                .select('id, status')
                .eq('tenant_id', tenantId)
                .eq('lead_id', leadId)
                .maybeSingle();

            if (existingError) {
                throw existingError;
            }

            if (!existingComissao) {
                // Busca o lead para pegar o parceiro_id
                const { data: leadData, error: leadError } = await supabase
                    .from('leads')
                    .select('parceiro_id')
                    .eq('id', leadId)
                    .eq('tenant_id', tenantId)
                    .single();

                if (leadError) {
                    throw leadError;
                }

                if (leadData?.parceiro_id) {
                    // Busca o grupo do parceiro para obter o valor da recompensa e o tipo (dinheiro/pontos)
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('grupo_id')
                        .eq('id', leadData.parceiro_id)
                        .eq('tenant_id', tenantId)
                        .single();

                    if (profileError) {
                        throw profileError;
                    }

                    let recompensa = 0;
                    if (profile?.grupo_id) {
                        const { data: grupo, error: groupError } = await supabase
                            .from('grupos_parceiros')
                            .select('valor_recompensa')
                            .eq('id', profile.grupo_id)
                            .eq('tenant_id', tenantId)
                            .single();

                        if (groupError) {
                            throw groupError;
                        }

                        recompensa = grupo?.valor_recompensa || 0;
                    }

                    // Comissão já nasce em a_pagar (sem etapa manual de aprovação).
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
                        console.error('[adminService] Erro ao criar comissão pendente:', comissaoError);
                    } else {
                        console.log(`[adminService] Comissão a pagar de R$${recompensa} criada para lead ${leadId} e atribuída ao parceiro ${leadData.parceiro_id}`);
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

    async approvePagamento(comissaoId: string, tenantId: string) {
        const comissao = await this.getComissaoById(comissaoId, tenantId);
        if (!comissao) {
            throw new Error('Comissão não encontrada para aprovação.');
        }

        if (comissao.status !== 'pendente') {
            throw new Error('Apenas comissões pendentes podem ser aprovadas.');
        }

        const { error } = await supabase
            .from('comissoes')
            .update({ status: 'a_pagar' })
            .eq('id', comissaoId)
            .eq('tenant_id', tenantId)
            .eq('status', 'pendente');

        if (error) throw error;

        return true;
    },

    async deletePagamento(comissaoId: string, tenantId: string) {
        const comissao = await this.getComissaoById(comissaoId, tenantId);
        if (!comissao) {
            throw new Error('Comissão não encontrada para exclusão.');
        }

        // Segurança: só permite exclusão antes da conclusão financeira.
        if (comissao.status !== 'pendente' && comissao.status !== 'a_pagar') {
            throw new Error('Apenas comissões em aprovação ou a pagar podem ser excluídas.');
        }

        const { error } = await supabase
            .from('comissoes')
            .delete()
            .eq('id', comissaoId)
            .eq('tenant_id', tenantId)
            .in('status', ['pendente', 'a_pagar']);

        if (error) throw error;

        return true;
    },

    async updatePagamento(comissaoId: string, status: string, tenantId: string, valor?: number, paymentConfirmed: boolean = false) {
        const comissaoAtual = await this.getComissaoById(comissaoId, tenantId);
        if (!comissaoAtual) {
            throw new Error('Comissão não encontrada.');
        }

        // Normalizar status para comparação segura (case-insensitive)
        const currentStatus = (comissaoAtual.status || "").toLowerCase();
        
        console.log(`[PAGAMENTO] Iniciando atualização da comissão ${comissaoId}:`, {
            statusAtual: currentStatus,
            novoStatus: status,
            valorManual: valor
        });

        if (currentStatus !== 'a_pagar' && currentStatus !== 'pendente') {
            throw new Error(`A comissão já possui o status "${comissaoAtual.status}" e não pode ser alterada.`);
        }

        if (status !== 'pago' && status !== 'pago_pontos') {
            throw new Error('Status de conclusão inválido para pagamento.');
        }

        if (!paymentConfirmed) {
            throw new Error('Confirme o pagamento real antes de concluir como pago.');
        }

        let finalStatus = 'pago';
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

                const { error: creditError } = await supabase
                    .from('profiles')
                    .update({ saldo_pontos: novoSaldo })
                    .eq('id', comissao.parceiro_id)
                    .eq('tenant_id', tenantId);

                if (creditError) {
                    throw creditError;
                }

                finalTipo = 'pontos';
            }
        }

        const updateData: any = { status: finalStatus };
        if (finalTipo) updateData.tipo = finalTipo;
        if (valor !== undefined) updateData.valor = valor;

        const { data: updateResult, error: updateError } = await supabase
            .from('comissoes')
            .update(updateData)
            .eq('id', comissaoId)
            .eq('tenant_id', tenantId)
            .select();

        if (updateError) {
            console.error('[PAGAMENTO] Erro ao atualizar comissão:', updateError);
            throw updateError;
        }

        if (!updateResult || updateResult.length === 0) {
             console.warn('[PAGAMENTO] Aviso: Nenhuma linha afetada pelo update. Verifique se o ID e Tenant conferem.');
             throw new Error('Não foi possível atualizar o registro no banco de dados.');
        }

        console.log(`[PAGAMENTO] Sucesso ao atualizar comissão para ${finalStatus}:`, updateResult[0]);

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
                    .update({ status: 'Pago' })
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

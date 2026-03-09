import { supabase } from '../lib/supabaseClient';

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

        // Pagamentos pendentes
        const { data: comissoes, error: comissoesError } = await supabase
            .from('comissoes')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('status', 'pendente');

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

    async getIndicacoes(tenantId: string) {
        const { data, error } = await supabase
            .from('leads')
            .select('*, parceiro:profiles(nome)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updateIndicacaoStatus(leadId: string, status: string) {
        const { error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', leadId);

        if (error) throw error;
        return true;
    },

    async getPagamentos(tenantId: string) {
        const { data, error } = await supabase
            .from('comissoes')
            .select('*, parceiro:profiles(nome), lead:leads(nome)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updatePagamento(comissaoId: string, status: string, valor?: number) {
        const updateData: any = { status };
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
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();

        if (error) throw error;
        return data;
    },

    async updateConfiguracoes(tenantId: string, config: any) {
        const { error } = await supabase
            .from('tenants')
            .update(config)
            .eq('id', tenantId);

        if (error) throw error;
        return true;
    }
};

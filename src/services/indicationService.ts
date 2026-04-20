import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';
import { sanitizePhone, sanitizeCPF, isValidWhatsApp } from '../utils/validation';
import { logError } from '../utils/logger';
import { normalizeLeadStatus } from '../utils/leadStatus';

export interface Lead {
    id: string;
    tenant_id: string;
    parceiro_id: string | null;
    nome: string;
    cpf: string;
    telefone: string | null;
    status: string | null;
    created_at: string;
    // Campos estendidos (podem vir de joins ou calculados)
    observacoes?: string | null;
    venda_confirmada?: boolean;
    valor_comissao?: number;
    comissao_status?: string;
}

export const indicationService = {
    async getIndications(tenantId: string, parceiroId?: string): Promise<Lead[]> {
        let query = supabase
            .from('leads')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (parceiroId) {
            query = query.eq('parceiro_id', parceiroId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching indications:', error);
            throw error;
        }
        return data || [];
    },

    async getRecentIndications(tenantId: string, parceiroId: string, limitVal: number = 5): Promise<Lead[]> {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('parceiro_id', parceiroId)
            .order('created_at', { ascending: false })
            .limit(limitVal);

        if (error) {
            console.error('Error fetching recent indications:', error);
            throw error;
        }
        return data || [];
    },

    async getIndicationById(tenantId: string, parceiroId: string, leadId: string): Promise<Lead | null> {
        // Busca o lead
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('parceiro_id', parceiroId)
            .eq('id', leadId)
            .single();

        if (leadError && leadError.code !== 'PGRST116') {
            console.error('Error fetching indication by ID:', leadError);
            throw leadError;
        }

        if (!lead) return null;

        // Tenta buscar comissão associada para enriquecer o objeto
        const { data: comissao } = await supabase
            .from('comissoes')
            .select('valor, status')
            .eq('lead_id', leadId)
            .maybeSingle();

        return {
            ...lead,
            valor_comissao: comissao?.valor,
            comissao_status: comissao?.status,
            venda_confirmada: comissao?.status === 'pago' || comissao?.status === 'a_pagar'
        } as Lead;
    },

    async createIndication(
        tenantId: string,
        leadData: Omit<Lead, 'id' | 'created_at' | 'tenant_id'>
    ): Promise<Lead> {
        const cleanPhone = sanitizePhone(leadData.telefone || '');
        if (!isValidWhatsApp(cleanPhone)) {
            throw new Error('Número de WhatsApp inválido. Use um número brasileiro com DDD e 11 dígitos.');
        }

        // Sanitizar dados para evitar falhas no Insert
        const sanitizedData = {
            ...leadData,
            cpf: sanitizeCPF(leadData.cpf || ""),
            telefone: cleanPhone,
            status: 'Recebido'
        };

        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
                    ...sanitizedData,
                    tenant_id: tenantId,
                },
            ])
            .select()
            .single();

        if (error) {
            logError("[DB_ERROR] Falha ao criar Lead", { tenantId, sanitizedData, error });
            throw error;
        }
        return data;
    },

    async getIndicationStats(tenantId: string, parceiroId: string) {
        // Busca todas as indicações do parceiro
        const { data, error } = await supabase
            .from('leads')
            .select('status')
            .eq('tenant_id', tenantId)
            .eq('parceiro_id', parceiroId);

        if (error) {
            console.error('Error fetching indication stats:', error);
            throw error;
        }

        const normalizedStatuses = (data || []).map((item) => normalizeLeadStatus(item.status));

        const stats = {
            total: data?.length || 0,
            recebidas: (data || []).filter((_, idx) => normalizedStatuses[idx] === 'Recebido'),
            emContato: (data || []).filter((_, idx) => normalizedStatuses[idx] === 'Em contato'),
            aceitas: (data || []).filter((_, idx) => normalizedStatuses[idx] === 'Aceito'),
            instaladas: (data || []).filter((_, idx) => normalizedStatuses[idx] === 'Instalado'),
            pagos: (data || []).filter((_, idx) => normalizedStatuses[idx] === 'Pago'),
            canceladas: (data || []).filter((_, idx) => normalizedStatuses[idx] === 'Cancelado'),
        };

        return stats;
    }
};

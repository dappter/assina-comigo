import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';
import { sanitizePhone, sanitizeCPF } from '../utils/validation';
import { logError } from '../utils/logger';

export interface Lead {
    id: string;
    tenant_id: string;
    parceiro_id: string | null;
    nome: string;
    cpf: string;
    telefone: string | null;
    status: string | null;
    created_at: string;
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

    async createIndication(
        tenantId: string,
        leadData: Omit<Lead, 'id' | 'created_at' | 'tenant_id'>
    ): Promise<Lead> {
        // Sanitizar dados para evitar falhas no Insert
        const sanitizedData = {
            ...leadData,
            cpf: sanitizeCPF(leadData.cpf || ""),
            telefone: sanitizePhone(leadData.telefone || "")
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

        const stats = {
            total: data?.length || 0,
            recebidas: data?.filter(l => l.status === 'Recebido' || l.status === 'PENDENTE' || l.status === 'pendente' || !l.status) || [],
            emContato: data?.filter(l => l.status === 'Em contato') || [],
            aceitas: data?.filter(l => l.status === 'Aceito') || [],
            instaladas: data?.filter(l => l.status === 'Instalado') || [],
            pagos: data?.filter(l => l.status === 'Pago' || l.status === 'PAGO') || [],
            canceladas: data?.filter(l => l.status === 'Cancelado') || [],
        };

        return stats;
    }
};

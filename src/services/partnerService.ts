import { supabaseAdmin as supabase } from '../lib/supabaseAdmin';

export interface Profile {
    id: string;
    tenant_id: string;
    nome: string;
    email: string;
    telefone?: string;
    cpf?: string;
    tipo_usuario: 'admin' | 'parceiro';
    created_at: string;
}

export const partnerService = {
    async getPartners(tenantId: string): Promise<Profile[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('tipo_usuario', 'parceiro')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching partners:', error);
            throw error;
        }
        return data || [];
    },

    async getPartnerById(tenantId: string, partnerId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', partnerId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching partner check:', error);
            throw error;
        }
        return data;
    },

    async getPartnerByIdGlobal(partnerId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching partner global:', error);
            return null;
        }
        return data;
    }
};

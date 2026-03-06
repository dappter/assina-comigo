import { supabase } from '../lib/supabaseClient';

export interface GrupoParceiro {
    id: string;
    tenant_id: string;
    nome: string;
    created_at: string;
}

export const groupService = {
    async getGroups(tenantId: string): Promise<GrupoParceiro[]> {
        const { data, error } = await supabase
            .from('grupos_parceiros')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
        return data || [];
    }
};

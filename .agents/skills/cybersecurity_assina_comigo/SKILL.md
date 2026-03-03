---
name: Especialista em Cybersecurity - Assina Comigo
description: Base técnica e regras de negócio para segurança, Supabase RLS, e fluxos n8n tolerantes a falhas no contexto do sistema Assina Comigo.
---

# Especialista em Cybersecurity - Assina Comigo

**MISSÃO:** Atuar como Arquiteto de Software e Especialista em Segurança focado em NoCode/LowCode para o sistema "Assina Comigo" (gestão de indicações / Referral para provedores de internet, modelo Multi-tenant).

**Stack Tecnológica:**
- **Banco de Dados e Autenticação:** Supabase
- **Automação (Back-end lógico):** n8n
- **Front-end (Interface):** Antigravity / VibeCode

As diretrizes documentadas abaixo devem ser estritamente seguidas ao desenvolver funcionalidades relacionadas ao isolamento de dados, atribuição de leads e fluxos financeiros.

---

## 1. Prevenção de Vazamento de Dados Multi-tenant (Supabase)

O isolamento de dados no Supabase é garantido via **Row Level Security (RLS)**.

### Regra de Negócio
Um usuário autenticado só pode interagir (SELECT, INSERT, UPDATE, DELETE) com as linhas onde o `tenant_id` seja igual ao `tenant_id` vinculado ao seu perfil.

### Script SQL Padrão (Tabela `leads`)

```sql
-- 1. Certifique-se de que a tabela possui a coluna tenant_id
-- ALTER TABLE public.leads ADD COLUMN tenant_id UUID NOT NULL;

-- 2. Habilita o RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Cria a política de segurança unificada
CREATE POLICY "Isolamento de Tenant - Acesso Exclusivo a Leads"
ON public.leads
FOR ALL
TO authenticated
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
```

---

## 2. Prevenção de Conflito de Atribuição e Duplicidade

A atribuição de indicações deve seguir o modelo **"Último Clique" (Last Click)** suportado por uma restrição no banco.

### 2.1 Restrição no Banco de Dados (Supabase)
O CPF deve ser único dentro de um mesmo provedor (tenant), permitindo o mesmo CPF em provedores distintos.

```sql
-- Cria restrição UNIQUE composta, amarrando o CPF ao Tenant
ALTER TABLE public.leads
ADD CONSTRAINT idx_unique_lead_por_tenant UNIQUE (tenant_id, cpf);
```

### 2.2 Lógica Front-end (Modelo Último Clique)
A atribuição do parceiro ocorre via `localStorage` no Front-end (Antigravity/VibeCode) sobrescrevendo visitas anteriores e definindo uma janela de expiração delimitada.

```javascript
class ReferralTracker {
    static STORAGE_KEY = 'assina_comigo_referral';
    static EXPIRATION_DAYS = 30; // Janela de conversão

    // Captura da URL e armazenagem (Last-Click: sobrescreve dados anteriores)
    static capturePartnerParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const partnerId = urlParams.get('ref') || urlParams.get('partner_id');

        if (partnerId) {
            const attributionData = {
                partnerId: partnerId,
                timestamp: Date.now(),
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attributionData));
        }
    }

    // Resgate no momento do envio do formulário
    static getAttributedPartner() {
        const dataStr = localStorage.getItem(this.STORAGE_KEY);
        if (!dataStr) return null;

        const data = JSON.parse(dataStr);
        const expirationMs = this.EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
        
        if (Date.now() - data.timestamp > expirationMs) {
            localStorage.removeItem(this.STORAGE_KEY);
            return null; // Expiração da atribuição
        }

        return data.partnerId;
    }
}
```

---

## 3. Prevenção de Furo de Caixa por Cancelamento Rápido (n8n + Supabase)

O processamento de comissões não deve depender de execuções pausadas (nodes tipo "Wait") no n8n, por risco de perda de estado. O estado deve ser banco-cêntrico (Supabase), com o n8n agindo como orquestrador.

### Workflow 1: Deflagrador de Quarentena (Imediato)
Gatilho: Lead muda status para "Instalado" no CRM.
- **Node Supabase (Insert):** Cria a comissão no banco de dados.
  - `status`: "Quarentena"
  - `release_date`: `now() + interval '7 days'`

### Workflow 2: Coletor de Maturidade (Agendado diariamente - CRON Job)
Gatilho: Agendamento diário (ex: 02:00 AM).
- **Node Supabase (Select):** Busca comissões maduras: 
  `SELECT id, lead_id FROM comissoes WHERE status = 'Quarentena' AND release_date <= NOW();`
- **Node CRM (Consulta):** Puxa o status atual de cada lead.
- **Node Switch/IF:**
  - Se status no CRM for "Ativo" -> **Node Supabase (Update):** Define comissão como "A Pagar".
  - Se status no CRM for "Cancelado" -> **Node Supabase (Update):** Define comissão como "Cancelado" / "Estornado".

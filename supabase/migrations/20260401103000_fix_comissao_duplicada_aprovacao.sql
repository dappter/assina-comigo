-- Bloqueio de comissão duplicada por lead dentro do mesmo tenant.
-- Segurança em profundidade: protege contra inserções diretas fora da aplicação.

CREATE OR REPLACE FUNCTION public.fn_block_duplicate_comissao_per_lead()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.lead_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.comissoes c
    WHERE c.tenant_id = NEW.tenant_id
      AND c.lead_id = NEW.lead_id
  ) THEN
    RAISE EXCEPTION 'Comissao duplicada para este lead/tenant nao permitida';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_duplicate_comissao_per_lead ON public.comissoes;
CREATE TRIGGER trg_block_duplicate_comissao_per_lead
BEFORE INSERT ON public.comissoes
FOR EACH ROW
EXECUTE FUNCTION public.fn_block_duplicate_comissao_per_lead();

-- Índice de suporte para acelerar validação do trigger.
CREATE INDEX IF NOT EXISTS idx_comissoes_tenant_lead
ON public.comissoes (tenant_id, lead_id)
WHERE lead_id IS NOT NULL;

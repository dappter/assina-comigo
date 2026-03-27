-- ==============================================================================
-- FIX: Garantir coluna tipo_remuneracao em grupos_parceiros
-- Corrige erro "column grupos_parceiros_1.tipo_remuneracao does not exist"
-- que ocorre quando a migration Fase 3 não foi aplicada corretamente.
-- ==============================================================================
ALTER TABLE public.grupos_parceiros
    ADD COLUMN IF NOT EXISTS tipo_remuneracao TEXT DEFAULT 'dinheiro'
    CHECK (tipo_remuneracao IN ('dinheiro', 'pontos'));

-- Garante que registros existentes tenham valor padrão
UPDATE public.grupos_parceiros
SET tipo_remuneracao = 'dinheiro'
WHERE tipo_remuneracao IS NULL;

-- Adicionar tipo_remuneracao à tabela de grupos
ALTER TABLE public.grupos_parceiros 
ADD COLUMN IF NOT EXISTS tipo_remuneracao TEXT DEFAULT 'dinheiro' CHECK (tipo_remuneracao IN ('dinheiro', 'pontos'));

-- Comentário para meta_vendas
COMMENT ON COLUMN public.grupos_parceiros.meta_vendas IS 'Coluna depreciada. Uso opcional, lógica removida do front-end.';

-- Garantir que a coluna grupo_id existe em profiles e está vinculada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'grupo_id') THEN
        ALTER TABLE public.profiles ADD COLUMN grupo_id UUID REFERENCES public.grupos_parceiros(id);
    END IF;
END $$;

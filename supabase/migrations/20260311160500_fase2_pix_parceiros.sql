-- Adicionando Chave PIX e Tipo PIX na tabela profiles para facilitar os pagamentos

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_pix_enum') THEN
        CREATE TYPE public.tipo_pix_enum AS ENUM ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria');
    END IF;
END$$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chave_pix text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipo_pix public.tipo_pix_enum;

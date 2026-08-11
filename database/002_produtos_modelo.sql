-- ============================================================
-- Migration: Evolução do modelo de Produto (TASK 02 — Etapa 2.2)
-- Executar no Supabase SQL Editor
-- ============================================================
--
-- Esta migration adiciona os campos necessários para o cadastro
-- completo de produtos conforme os requisitos da TASK 02.
--
-- Alterações:
--   1. Adiciona coluna "descricao" (TEXT, nullable)
--   2. Adiciona coluna "preco" (DECIMAL(10,2), nullable)
--   3. Adiciona coluna "status" (VARCHAR(20), NOT NULL, default 'ATIVO')
--   4. Adiciona coluna "userId" (UUID, nullable, FK → usuarios)
--   5. Cria índices para consultas de listagem e filtragem
--
-- Impacto nos dados existentes:
--   - Nenhum dado existente é removido ou alterado
--   - Produtos existentes receberão status='ATIVO' automaticamente (DEFAULT)
--   - descricao, preco e userId ficam NULL para produtos existentes
--   - userId é nullable porque produtos existentes foram criados antes
--     do sistema de autenticação e não possuem usuário associado
--
-- IMPORTANTE:
--   - userId representa o usuário responsável pela operação/rastreabilidade
--   - userId NÃO significa que o produto pertence ao usuário
--   - Futuramente, empresaId poderá ser adicionado para isolamento por empresa
-- ============================================================

-- 1. Adicionar campo de descrição do produto
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS descricao TEXT;

-- 2. Adicionar campo de preço
-- DECIMAL(10,2) permite até 99.999.999,99 — suficiente para pequenos negócios
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS preco DECIMAL(10,2);

-- 3. Adicionar campo de status (ativo/inativo)
-- Produtos existentes recebem 'ATIVO' automaticamente via DEFAULT
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ATIVO';

-- 4. Adicionar campo userId para rastreabilidade
-- Nullable porque produtos criados antes da TASK 01 não têm usuário associado
-- ON DELETE SET NULL: se o usuário for excluído, o produto permanece (apenas perde a referência)
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- ============================================================
-- Índices para performance
-- ============================================================

-- 5. Índice em status — filtragem por status ativo/inativo é uma consulta frequente
CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);

-- 6. Índice em userId — consultas por responsável e futuro filtro por usuário
CREATE INDEX IF NOT EXISTS idx_produtos_userId ON produtos("userId");

-- 7. Índice em nome — busca por nome é operação frequente
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);

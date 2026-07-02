-- 1. Primeiro vamos excluir a tabela antiga (que foi criada com as colunas em minúsculo pelo banco)
DROP TABLE IF EXISTS produtos;

-- 2. Criar a tabela forçando o nome exato das colunas com aspas duplas ("criadoEm", "atualizadoEm")
CREATE TABLE produtos (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  local VARCHAR(255) NOT NULL,
  corredor VARCHAR(255) NOT NULL,
  gaveta VARCHAR(255) NOT NULL,
  observacao TEXT,
  "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL,
  "atualizadoEm" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Habilitar segurança novamente
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a produtos" ON produtos FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Tabelas de Localização
-- ============================================================

-- 4. Tabela de Locais/Setores
DROP TABLE IF EXISTS gavetas;
DROP TABLE IF EXISTS corredores;
DROP TABLE IF EXISTS locais;

CREATE TABLE locais (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE
);

ALTER TABLE locais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a locais" ON locais FOR ALL USING (true) WITH CHECK (true);

-- 5. Tabela de Corredores (vinculados a um Local)
CREATE TABLE corredores (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  "localId" UUID NOT NULL REFERENCES locais(id),
  UNIQUE (nome, "localId")
);

ALTER TABLE corredores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a corredores" ON corredores FOR ALL USING (true) WITH CHECK (true);

-- 6. Tabela de Gavetas/Prateleiras (vinculadas a um Corredor)
CREATE TABLE gavetas (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  "corredorId" UUID NOT NULL REFERENCES corredores(id),
  UNIQUE (nome, "corredorId")
);

ALTER TABLE gavetas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a gavetas" ON gavetas FOR ALL USING (true) WITH CHECK (true);

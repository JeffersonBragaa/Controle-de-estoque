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

-- ============================================================
-- Tabelas de Autenticação e Segurança
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'FUNCIONARIO',
  ativo BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL,
  "atualizadoEm" TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);

-- 2. Tabela de Sessões
CREATE TABLE IF NOT EXISTS sessoes (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  "refreshToken" VARCHAR(500) NOT NULL,
  ip VARCHAR(100),
  "userAgent" VARCHAR(500),
  "ultimaAtividade" TIMESTAMP WITH TIME ZONE NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL,
  "expiraEm" TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a sessoes" ON sessoes FOR ALL USING (true) WITH CHECK (true);

-- 3. Tabela de Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  "userId" UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  acao VARCHAR(100) NOT NULL,
  detalhes TEXT,
  ip VARCHAR(100),
  "userAgent" VARCHAR(500),
  "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 4. Tabela de Recuperação de Senha
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  "expiraEm" TIMESTAMP WITH TIME ZONE NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a password_resets" ON password_resets FOR ALL USING (true) WITH CHECK (true);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_sessoes_userId ON sessoes("userId");
CREATE INDEX IF NOT EXISTS idx_sessoes_refreshToken ON sessoes("refreshToken");
CREATE INDEX IF NOT EXISTS idx_audit_logs_userId ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_criadoEm ON audit_logs("criadoEm");
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_userId ON password_resets("userId");

# TASK 01 - Sistema de Segurança

## Objetivo

Implementar toda a camada de autenticação e autorização do sistema para que ele esteja preparado para produção.

O resultado deve seguir boas práticas de segurança, arquitetura limpa e código escalável.

---

## Funcionalidades

### Autenticação

- Login utilizando JWT.
- Refresh Token.
- Expiração configurável.
- Logout.
- Logout de todos os dispositivos.

---

### Recuperação de senha

Implementar fluxo completo.

- Solicitar recuperação por e-mail.
- Gerar token temporário.
- Token expira automaticamente.
- Alteração da senha.
- Invalidar token após utilização.

---

### Rotas protegidas

Todas as rotas privadas devem exigir autenticação.

As rotas públicas devem permanecer acessíveis.

---

### Permissões

Criar sistema RBAC.

Perfis iniciais:

- ADMIN
- GERENTE
- FUNCIONARIO

Cada rota deve validar a permissão necessária.

---

### Sessões

Permitir múltiplos dispositivos logados.

Cada sessão deve possuir:

- Data
- IP
- Navegador
- Última atividade

O usuário poderá encerrar qualquer sessão.

---

### Auditoria

Registrar:

- Login
- Logout
- Alteração de senha
- Recuperação de senha
- Criação de usuário
- Exclusão de usuário

---

### Segurança

Implementar:

- BCrypt
- Validação dos Tokens
- Refresh Token seguro
- Validação de Expiração
- Proteção contra acesso não autorizado
- Tratamento de exceções

---

## Critérios de aceite

✔ Login funcionando

✔ Refresh Token funcionando

✔ Logout funcionando

✔ Recuperação de senha funcionando

✔ Controle de permissões funcionando

✔ Rotas protegidas

✔ Código organizado

✔ Testes básicos
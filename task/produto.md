# TASK 02 — Cadastro de Produtos

## Objetivo

Implementar o cadastro e gerenciamento de produtos do sistema, permitindo que pequenos empreendedores possam controlar de forma simples e segura os produtos comercializados em seus estabelecimentos.

O módulo deve ser adequado para diferentes tipos de pequenos negócios, como:

- lojas de roupas;
- lojas de calçados;
- lojas de eletrônicos;
- assistência técnica de celulares;
- salões de beleza;
- profissionais de serviços;
- outros pequenos comércios.

A implementação deve manter a arquitetura existente do projeto e respeitar os requisitos permanentes de:

- segurança;
- autorização;
- auditoria;
- performance;
- integridade dos dados;
- manutenibilidade.

### Importante sobre o futuro do sistema

O sistema futuramente deverá suportar:

- múltiplas empresas;
- usuários por empresa;
- colaboradores;
- diferentes níveis de acesso;
- SUPER_ADMIN da plataforma;
- clientes;
- agendamentos;
- serviços;
- outros módulos específicos para pequenos negócios.

Essas funcionalidades NÃO devem ser implementadas nesta TASK.

Entretanto, a implementação do cadastro de produtos não deve criar uma arquitetura que dificulte sua inclusão posteriormente.

---

# 2.1 — Análise da estrutura atual

Antes de implementar qualquer código:

- analisar a estrutura atual do projeto;
- analisar os modelos/tabelas existentes;
- analisar o acesso atual ao banco;
- analisar `produtoRepository`;
- analisar services relacionados;
- analisar API Routes existentes;
- analisar páginas/componentes existentes de produtos;
- analisar tipos/interfaces existentes;
- analisar a implementação da TASK 01;
- verificar como o usuário autenticado pode ser identificado;
- verificar como as permissões estão sendo aplicadas.

Nesta etapa não implementar código.

Identificar:

- o que já existe;
- o que pode ser reutilizado;
- o que precisa ser alterado;
- possíveis inconsistências;
- riscos de segurança;
- riscos de performance;
- impactos futuros relacionados a usuários e empresas.

---

# 2.2 — Modelo de Produto

Definir e implementar a estrutura de dados necessária para Produto.

O modelo deve contemplar, conforme a necessidade real do sistema:

- identificação;
- nome;
- descrição;
- preço;
- quantidade/estoque quando aplicável;
- informações necessárias para identificação do produto;
- status;
- datas de criação e atualização.

Antes de adicionar campos desnecessários, analisar a estrutura existente e os requisitos atuais do projeto.

Garantir:

- chave primária;
- constraints adequadas;
- tipos de dados apropriados;
- integridade referencial;
- índices necessários;
- timestamps consistentes.

Não implementar funcionalidades de movimentação de estoque nesta TASK.

---

# 2.3 — Repository de Produtos

Implementar ou ajustar o repository responsável pelo acesso aos produtos.

Operações esperadas:

- criar produto;
- buscar produto;
- listar produtos;
- atualizar produto;
- excluir ou desativar produto, conforme a arquitetura definida.

O repository não deve conter regras de negócio.

Garantir consultas eficientes e evitar operações desnecessárias no banco.

---

# 2.4 — Service de Produtos

Implementar ou ajustar a camada de serviço responsável pelas regras de negócio.

Responsabilidades:

- validação dos dados;
- regras de criação;
- regras de atualização;
- regras de exclusão/desativação;
- tratamento de conflitos;
- integração com auditoria quando necessário.

Não colocar regras de negócio diretamente nas API Routes.

---

# 2.5 — API de Produtos

Implementar ou ajustar as API Routes necessárias para o gerenciamento de produtos.

Devem ser contempladas operações de:

- criação;
- consulta;
- listagem;
- atualização;
- exclusão/desativação.

As APIs devem:

- exigir autenticação;
- validar autorização;
- validar entrada;
- retornar respostas HTTP adequadas;
- tratar erros de maneira segura;
- não expor informações sensíveis;
- não confiar em dados enviados pelo frontend para determinar permissões.

---

# 2.6 — Validação de dados

Implementar validações adequadas para os dados recebidos pela API.

Validar pelo menos:

- campos obrigatórios;
- tipos;
- tamanho máximo;
- valores inválidos;
- valores numéricos;
- duplicidade quando aplicável.

A validação deve ocorrer no backend.

A validação do frontend não deve ser considerada mecanismo de segurança.

---

# 2.7 — Frontend de Produtos

Implementar ou ajustar a interface de cadastro de produtos.

A interface deve permitir, conforme a estrutura atual do projeto:

- visualizar produtos;
- cadastrar produto;
- editar produto;
- excluir/desativar produto;
- visualizar informações relevantes.

A interface deve apresentar mensagens claras para:

- sucesso;
- erro;
- validação;
- carregamento;
- ausência de dados.

Não colocar regras de autorização exclusivamente no frontend.

---

# 2.8 — Segurança e Permissões

Revisar a implementação da TASK 01 aplicada ao módulo de produtos.

Garantir:

- autenticação obrigatória;
- autorização baseada nas roles existentes;
- proteção de todas as API Routes;
- impossibilidade de usuário não autenticado manipular produtos;
- impossibilidade de usuário executar operações que sua role não permite;
- validação da identidade do usuário no backend.

### Importante

Não confiar em:

- `userId` enviado pelo frontend;
- `role` enviado pelo frontend;
- qualquer informação de autorização enviada pelo cliente.

As informações de autenticação e autorização devem ser obtidas de forma confiável pelo backend.

---

# 2.9 — Preparação para usuários e empresas

Nesta TASK não implementar o sistema completo de empresas ou colaboradores.

Porém, analisar se a estrutura de Produto permite futuramente associar os dados à empresa correta.

A arquitetura deve permitir futuramente algo semelhante a:

Empresa
→ Usuários
→ Produtos
→ Locais
→ Estoque

Não implementar multi-tenancy completo nesta TASK sem necessidade.

Não criar tabelas ou funcionalidades futuras apenas por antecipação.

---

# 2.10 — Auditoria

Garantir registro das operações relevantes relacionadas aos produtos.

Considerar pelo menos:

- criação;
- alteração;
- exclusão/desativação;
- alterações administrativas relevantes.

Os registros de auditoria devem permitir identificar:

- usuário responsável;
- ação realizada;
- recurso afetado;
- data/hora;
- informações necessárias para rastreabilidade.

Não registrar senhas, tokens ou outras informações sensíveis.

Utilizar o sistema de auditoria criado na TASK 01.

---

# 2.11 — Performance

Avaliar o desempenho das operações de produtos.

Considerar:

- índices;
- paginação;
- filtros;
- ordenação;
- quantidade de registros retornados;
- consultas ao banco;
- consultas N+1;
- payload das APIs.

Não retornar uma quantidade potencialmente ilimitada de produtos em uma única requisição.

As soluções devem ser compatíveis com o crescimento futuro do sistema.

---

# 2.12 — Integridade e tratamento de erros

Garantir:

- consistência dos dados;
- tratamento adequado de erros de banco;
- tratamento de conflitos;
- respostas HTTP consistentes;
- ausência de stack traces ou informações internas em produção;
- operações críticas protegidas contra estados inconsistentes.

Quando uma operação envolver múltiplas alterações relacionadas, avaliar a necessidade de transação.

---

# 2.13 — Testes e validação

Validar o módulo após a implementação.

Testar pelo menos:

### Autenticação

- usuário autenticado consegue acessar;
- usuário não autenticado não consegue acessar.

### Autorização

- cada role possui apenas as permissões previstas;
- tentativa de operação não autorizada é bloqueada.

### CRUD

- criação;
- consulta;
- listagem;
- atualização;
- exclusão/desativação.

### Validação

- dados válidos;
- dados inválidos;
- campos obrigatórios;
- valores inválidos;
- duplicidades quando aplicável.

### Segurança

- manipulação de IDs;
- tentativa de acessar recursos indevidos;
- dados de autorização enviados pelo frontend;
- exposição de informações sensíveis.

### Auditoria

- operações relevantes geram registros.

### Performance

- listagem paginada;
- consultas utilizando índices adequados;
- ausência de consultas desnecessárias.

---

# 2.14 — Build e verificação final

Executar as verificações disponíveis no projeto:

- TypeScript;
- lint;
- build;
- testes existentes;
- validação das API Routes;
- validação do frontend.

Corrigir problemas introduzidos pela TASK.

Não ignorar erros existentes sem registrar claramente sua origem.

---

# 2.15 — Auditoria final da TASK

Antes de considerar a TASK concluída, realizar uma revisão final.

Verificar:

### Funcionalidade

- [ ] Cadastro funcionando
- [ ] Consulta funcionando
- [ ] Listagem funcionando
- [ ] Atualização funcionando
- [ ] Exclusão/desativação funcionando

### Segurança

- [ ] Rotas protegidas
- [ ] Autenticação validada no backend
- [ ] Permissões validadas no backend
- [ ] Nenhuma confiança em dados de autorização enviados pelo frontend
- [ ] Dados sensíveis não expostos

### Auditoria

- [ ] Operações relevantes registradas
- [ ] Usuário responsável identificado
- [ ] Informações sensíveis não registradas

### Performance

- [ ] Consultas revisadas
- [ ] Índices necessários existentes
- [ ] Listagem paginada
- [ ] Ausência de consultas N+1 relevantes

### Qualidade

- [ ] TypeScript sem erros
- [ ] Lint sem novos problemas
- [ ] Build funcionando
- [ ] Testes básicos executados
- [ ] Nenhuma funcionalidade da TASK 03 implementada antecipadamente

---

# Regra de execução da TASK

Esta TASK deve ser executada de forma incremental.

Cada etapa deve ser implementada, verificada e validada antes da próxima.

Não executar todas as etapas em uma única operação.

A ordem deve ser:

2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 → 2.9 → 2.10 → 2.11 → 2.12 → 2.13 → 2.14 → 2.15

Segurança, auditoria e performance devem ser consideradas durante toda a TASK e não somente na etapa final.

Não implementar funcionalidades pertencentes às próximas TASKs.

---

# Critério de conclusão

A TASK 02 somente será considerada concluída quando:

- o cadastro de produtos estiver funcional;
- as APIs estiverem protegidas;
- as permissões estiverem funcionando;
- a auditoria estiver integrada;
- a estrutura estiver preparada para evolução futura;
- as operações principais estiverem validadas;
- o build estiver funcionando;
- os testes básicos tiverem sido realizados;
- a revisão final de segurança e performance tiver sido concluída.
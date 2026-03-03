# PRD: Assina Comigo (v1 Multi-tenant)

## [1] Nome do Projeto
Assina Comigo (v1 Multi-tenant)

## [2] Visão Geral do App
O Assina Comigo é um sistema web responsivo para provedores de internet gerenciarem indicações de novos clientes com rastreio por parceiro/cliente indicador, acompanhamento de status e controle de recompensas (dinheiro ou pontos).
A experiência do indicador é simples: ele tem um link próprio, compartilha, e acompanha o andamento e ganhos pelo celular. Para o provedor, o sistema organiza parceiros, recebe indicações, encaminha automaticamente para o CRM e mantém controle administrativo de pagamento/pontos com histórico e comprovantes.
A plataforma já nasce multi-tenant, permitindo vários provedores usando o mesmo sistema, cada um com seus dados isolados e suas páginas personalizadas (logo, cores e fonte).

## [3] Objetivos da Primeira Versão (v1)
- Viabilizar indicações via link individual com rastreamento automático.
- Reduzir trabalho manual com lançamento automático no CRM.
- Dar visibilidade clara ao indicador sobre status e ganhos.
- Entregar ao provedor gestão simples de grupos, regras e pagamentos/pontos.
- Facilitar o controle administrativo com alertas visuais de pendências/atrasos.

## [4] Personas Prioritárias
- **Parceiro/Cliente Indicador:** quer indicar rápido e acompanhar resultados/ganhos sem esforço, no celular.
- **Comercial/Vendedores:** querem receber o lead no CRM com origem e dados completos para tratar rápido.
- **Admin do Provedor:** quer configurar grupos e regras, cadastrar parceiros, acompanhar funil e controlar pagamentos/pontos com clareza.

## [5] Funcionalidades Essenciais (MVP)

### A) Multi-tenant (obrigatório)
- Cadastro de provedor (tenant): cada provedor tem seu ambiente próprio (dados isolados).
- Usuários internos por provedor: Admin e Comercial, com permissões separadas.
- Isolamento total: parceiro de um provedor não enxerga nada de outro provedor.

### B) Personalização visual (whitelabel leve – v1)
Configuração por provedor para aplicar em:
- Logo do provedor.
- Cores principais (primária/secundária).
- Fonte (seleção de uma lista limitada para manter performance e consistência).

**Aplicação mínima na v1:**
- Página “Quero ser parceiro”.
- Página de indicação (landing do indicado).
- Portal do parceiro (topo/cabeçalho e botões principais).

### C) Grupos de parceiros (com descrição)
Criar e gerenciar grupos de parceiros (ex.: “R$50 por instalação”, “R$10 por instalação”, “50 pontos”).
Cada grupo possui:
- Nome do grupo.
- Tipo de recompensa: dinheiro ou pontos.
- Valor/quantidade.
- Gatilho de ganho (padrão: Instalado, configurável).
- Descrição do grupo (campo de texto para explicar regras e funcionamento).

### D) Página “Quero ser parceiro indicador” por grupo (link amarrado ao grupo)
O admin cria um link público específico do grupo (ex.: “Parceiro R$50/instalação”).
Quem entra por esse link:
- Vê a descrição do grupo (explicando como funciona).
- Preenche cadastro (nome, CPF, e-mail, WhatsApp).
- Já fica pré-associado ao grupo automaticamente.

**Status do cadastro:**
- Pendente de aprovação (padrão recomendado).
- (Opcional v1) Auto-aprovação por grupo, se o provedor quiser.

### E) Link individual de indicação (por parceiro)
Link único por parceiro para compartilhar livremente.
O parceiro acessa um portal simples (mobile first) para:
- Copiar link.
- Ver lista de indicados.
- Ver status e ganhos.

### F) Landing page do indicado (via link do parceiro)
Mostra “Você foi indicado por {Nome}”.
Formulário rápido do indicado (mínimo viável):
- Nome.
- WhatsApp.
- Bairro/cidade (ou endereço básico).
- CPF (recomendado para evitar duplicidade).
- Consentimento LGPD.

**Ao enviar:**
- Cria indicação no Assina Comigo.
- Lança automaticamente no CRM com o parceiro vinculado.

### G) Administração das indicações (Admin/Comercial)
Lista com filtros por status, parceiro, grupo, período.

**Status padrão (v1):**
- Recebido.
- Em contato.
- Aceito.
- Instalado (gatilho principal).
- Cancelado / Não viável.

**Campos úteis:**
- Data de criação.
- Última atualização.
- Observação interna (curta).

### H) Recompensas: dinheiro e pontos (Admin + visão do parceiro)
Ao atingir o gatilho (ex.: Instalado), gera automaticamente um “ganho” para o parceiro:
- Dinheiro: “a pagar”.
- Pontos: “a creditar” (ou já credita automaticamente, conforme regra do provedor).

**Admin pode:**
- Marcar como pago (dinheiro).
- Anexar comprovante.
- Creditar/debitar pontos manualmente (resgate/troca).

**Parceiro vê:**
- Ganhos pendentes x pagos.
- Saldo e extrato de pontos (se usar pontos).

### I) Controle de datas com indicadores visuais (admin) — foco em “atrasos”
Para facilitar “bater o olho” e saber o que está parado:

**1) Tela de Pagamentos (dinheiro/pontos)**
Colunas sugeridas: Parceiro, Grupo, Valor/Pontos, Gerado em, Vencimento, Dias em atraso, Status (pendente/pago/cancelado).
- Indicadores visuais: tags por faixa de atraso (ex.: 0–7, 8–15, 16–30, 30+ dias).
- Ordenação rápida: “mais atrasados primeiro”.
- Destaque visual para “vencido”.

**2) Tela de Indicações (funil)**
Mostrar “dias no status atual” para identificar leads travados.
- Filtros rápidos: “Parados há mais de X dias”, “Recebidos hoje”, “Sem contato”.
- Regra simples para vencimento (v1): configurável por provedor ou por grupo (ex.: “pagar até 7 dias após instalar”).

## [6] Fluxo Principal do Usuário
**Parceiro (já ativo):**
- Faz login simples → abre portal.
- Copia link → compartilha.
- Acompanha indicados e status.
- Vê ganhos pendentes/pagos e/ou pontos.

**Novo parceiro (via link público do grupo):**
- Entra no link “Quero ser parceiro” (já amarrado ao grupo).
- Lê descrição do grupo → cadastra dados.
- Fica pendente → admin aprova.
- Recebe acesso e link individual.

**Indicado (lead):**
- Clica no link do parceiro.
- Preenche dados → envia.
- Sistema registra e lança no CRM automaticamente.

**Admin/Comercial:**
- Configura branding + grupos + links públicos.
- Aprova novos parceiros (se necessário).
- Acompanha indicações e atualiza status.
- Sistema gera ganhos → admin paga/credita e anexa comprovante.
- Usa a tela de atrasos para priorizar pendências.

## [7] Requisitos Não-Funcionais
- Web responsivo (mobile first).
- Multi-tenant com isolamento total de dados por provedor (Supabase RLS).
- Perfis de acesso: Admin / Comercial / Parceiro.
- Registro de histórico (alterações de status e pagamentos).
- Duplicidade: sinalizar/bloquear lead repetido por WhatsApp/CPF em janela definida.
- LGPD: consentimento explícito + finalidade clara.
- Integração com CRM (obrigatória na v1):
  - Envio automático ao CRM ao criar indicação.
  - Fila de reenvio em caso de falha (para não perder indicação).

## [8] Itens Fora do Escopo (por enquanto - v2 ou posterior)
- Puxar status automaticamente do CRM (sincronização completa bidirecional).
- Pagamento automático (PIX dentro do sistema).
- Loja completa de resgate de pontos (catálogo/pedidos).
- Metas, bônus por volume, ranking e multilayer de comissão.
- Antifraude avançado complexo.

## [9] Indicadores de Sucesso da v1
- Taxa de parceiros que copiam e compartilham link (ativação).
- Indicações recebidas e % que viram “Instalado”.
- Tempo médio “Instalado → Pago/Creditado” e redução de atrasos (com os alertas).

---
*(Seção adicionada para enriquecimento do contexto)*
## [10] Arquitetura & Segurança Recomendada (Melhorias no Contexto)
- **Atribuição "Last Click":** Implementar lógica para que, caso o indicado clique em mais de um link de parceiro diferente, o último clique antes do cadastro seja o considerado para a atribuição da recompensa.
- **Isolamento de Dados Estrito (RLS):** Uso de Row Level Security direto no banco de dados (Supabase) garantindo que falhas na camada da aplicação não causem vazamento de dados entre os provedores.
- **Gestão de Estornos (Quarentena de Status):** Fluxo (via webhook ou n8n) onde o status "Instalado" gera o ganho, porém com um bloqueio/quarentena (ex. 7 a 30 dias) antes de liberar o pagamento, evitando prejuízos por cancelamentos prematuros. Essa lógica rodará fora da aplicação principal para melhor resiliência e evitar sobrecarga.
- **Auditoria de Ações Sensíveis:** Manter um log (tabela de auditoria) de quem alterou o status do lead ou do pagamento para "Pago", provendo rastreabilidade para o gestor do provedor.

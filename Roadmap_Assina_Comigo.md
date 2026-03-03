# Roadmap: Assina Comigo (v1)

Este roadmap define as etapas essenciais para construirmos a primeira versão do sistema de forma **simples, segura e funcional**, integrando nossas diretrizes de produto (PRD), design (UX/UI) e segurança (Cybersecurity).

## Fase 1: Fundação & Segurança (Backend e Banco de Dados)
**Objetivo:** Preparar a base de dados com as restrições e segurança necessárias para um ambiente multi-tenant isolado e protegido.
- [ ] **Configuração do Banco (Supabase):** Inicializar o projeto e conectar os ambientes.
- [ ] **Estrutura de Tabelas:** Criar entidades principais (`profiles`, `leads`, `comissoes`, `grupos_parceiros`).
- [ ] **Isolamento de Dados (RLS):** Implementar *Row Level Security* (RLS) baseada no `tenant_id` para garantir que provedores só acessem os dados de sua própria base.
- [ ] **Prevenção de Duplicidades:** Adicionar restrições de unicidade compostas (ex: `tenant_id` + `cpf`) direto no banco de dados.

## Fase 2: Design System & Diretrizes Visuais (Frontend)
**Objetivo:** Configurar os tokens visuais e componentes base do projeto para garantir alta conversão e uma interface limpa.
- [ ] **Configuração de Estilos e Design Tokens:** Aplicar paleta estrita (Amarelo `#FFB918`, Azul `#0062FF`, Alerta `#FF2D55`) e tipografias de alta legibilidade (`Inter`, `Manrope` ou `Outfit`).
- [ ] **Componentes Base (UI):**
  - **Botões:** Criar variáveis focadas com tamanhos de toque polidos, padding generoso e variação de status (Primário, Secundário, Outline).
  - **Toasts e Banners:** Componentizar os "Floating Toasts" e Popups (Modals) com seus sombreamentos arredondados (curvatura de 12px/16px).
- [ ] **Layout Responsivo (Mobile First):** Arquitetar containers da grid com os devidos *respiros* ou espaçamentos em blocos recomendados (padrão Z), limitando o painel máximo para `1200px` em desktop.
- [ ] **Whitelabel Leve (Images Guide):** Preparar suporte (via variáveis CSS root/theme) para atualização da logo, cor primária e tipografia selecionável, amparando os provedores individuais.

## Fase 3: Funcionalidades Essenciais (MVP)
**Objetivo:** Implementar fluxos vitais sem excesso de complexidade e seguindo o caminho crítico do parceiro e admins.
- [ ] **Autenticação:** Login amigável por código via E-mail/WhatsApp para Parceiros e controle Administrativo por senhas ou links diretos.
- [ ] **Portal Principal do Parceiro:**
  - Visualização de métricas (Cards dos Indicados, Status e Receita).
  - Criação da regra de "copiar e compartilhar o link único".
  - Implementação da lógica de atribuição "Last Click" (utilizando `localStorage` para injetar a procedência do comissionamento em cache do lead).
- [ ] **Ecossistema de Captação (Landing Pages):**
  - "Quero ser parceiro": Funil de registro aprovado ou moderado administrativamente ligado ao termo LGPD.
  - "Fui indicado": Formulário mínimo de conversão para o novo lead final com bloqueios para estoques vazios ou cpfs clonados.
- [ ] **Dashboard Administrativo / Comercial:**
  - Interface águia com semáforos/cores visuais indicando estagnação (leads "Parados", ou pagamentos "Atrasados").
  - Listagem do controle diário e detalhe interno com fluxo de "Timeline Perpétuo" de alterações.

## Fase 4: Automações, Integrações e Tolerância a Falhas
**Objetivo:** Garantir a saúde dos recebíveis (evitando fraudes/chargebacks) e plugar ferramentas essenciais de CRM.
- [ ] **Pipeline Básico de Integração (n8n ou Webhooks):** Envio dos leads recém-coletados diretamente para o CRM do parceiro.
  - *Fallback System*: Adicionar botão na tela principal para "Reprocessar Sincronismo" em caso de erro da API.
- [ ] **Workflow de Quarentena de Pagamento (Cybersecurity Skill):**
  - Construir lógica desacoplada da interface via **n8n / Supabase**.
  - **Deflagrador:** Gatilho atira quando o Lead é "Instalado" criando a comissão no BD travada para liberação pós carência (ex: 7 dias de quarentena).
  - **Coletor de Maturidade (CRON):** Escaner assíncrono checando os leads instalados e confirmando se o contrato se manteve ativo antes de liberar a verba ("A Pagar").
- [ ] **Módulo Financeiro Final:** Painel para anexo e confirmação de extratos contábeis pagos por operador interno, gerando lastro comprobatório.

## Fase 5: Validação, Homologação e Deploy
**Objetivo:** Bater o carimbo de confiança antes da v1 entrar em produção real.
- [ ] Validação de Segurança (Teste restritivo verificando permissões de Role Based Access Controls e blindagem de RLS).
- [ ] Bateria de simulação no fluxo primário (Clicar no parceiro > Capturar lead final > Acusar no CRM).
- [ ] Auditar de renderização visual dos formulários em dispositivos iOS/Android (Checagem de usabilidade/fator contraste).
- [ ] Entrega e Disponibilização da V1 Piloto.

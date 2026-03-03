# Diretrizes de Design UX/UI - Assina Comigo

Este documento consolida os padrões visuais e diretrizes de interface (UX/UI) baseados nas referências estéticas e de conversão do mercado (padrão visual de alta performance analisado), adaptados para o sistema **Assina Comigo**. As instruções a seguir devem ser usadas como base para o desenvolvimento do nosso aplicativo, garantindo uma interface moderna, amigável e de altíssima conversão e acessibilidade estética.

## 1. Paleta de Cores (Design Tokens - Colors)

A paleta de cores deve focar em alta legibilidade, separação cristalina de blocos de conteúdo e destacar organicamente os chamados de ação (CTA) do usuário.

- **Cor Primária (CTA e Destaque Principal):**
  - **Amarelo Assina Comigo (Brand Action):** `#FFB918`
  - *Uso:* Botões de conversão e Call-to-Action primários (Ex: "Assinar Agora", "Acessar Grátis").

- **Cor Secundária (Ações Complementares e Confirmações):**
  - **Azul Elétrico (Action / Info):** `#0062FF` ou similar.
  - *Uso:* Construções visuais, botões secundários motivacionais ("Ok!", "Salvar"), links, contornos destacados.

- **Cor de Alerta/Ação Imediata:**
  - **Vermelho/Rosa Vibrante (Destructive/Alert):** `#FF2D55`
  
- **Cores de Texto (Tipografia):**
  - **Título (Heading - High Contrast):** `#111827` (Azul-marinho quase preto) para contraste ideal contra fundos claros.
  - **Corpo e Subtítulos (Body Text):** `#4B5563` (Cinza ardósia opaco) reduz a fadiga visual do usuário durante leitura ou preenchimento de documentos longos.

- **Cores de Fundo (Backgrounds):**
  - **Superfície Principal:** `#FFFFFF` (Branco puro para áreas que requerem extrema clareza: formulários, cartões, conteúdos).
  - **Secundário / Seções Separadoras:** `#F8FAFC` (Tom Gelo/Cinza claríssimo) - Ideal para delimitar sessões, em painéis horizontais ou por trás de grupos de cards, ajudando a criar blocos de foco.

- **Comunicação Embutida:**
  - **Verde WhatsApp:** `#25D366`

## 2. Tipografia

Adotamos tipografias sem serifa (sans-serif), limpas, modernas e de presença marcante.

- **Família de Fontes Primária:** `Inter`, `Manrope` ou `Outfit` (Disponíveis via Google Fonts).
- **Hierarquia Visual:**
  - **H1 (Hero Sections / Títulos Principais):** `40px` - `56px`, Peso: *Extra Bold (800)* ou *Bold (700)*. Line-height: `1.1` ou `1.2`.
  - **H2 / H3 (Títulos de Seções e Componentes Internos):** `24px` - `36px`, Peso: *Bold (700)*. Line-height: `1.3`.
  - **Body Text (Textos Corridos e Parágrafos):** `16px` - `18px`, Peso: *Regular (400)*. Line-height: `1.6` (Fundamental para alta mancha gráfica e respiro dos parágrafos textuais).
  - **Labels, Tags e Observações:** `12px` - `14px`, Peso: *Medium (500)*. (Ocasionalmente com formatação MAIÚSCULA + `letter-spacing` para categorias ou metadados).

## 3. Componentes Visuais (Buttons, Toasts, Popups)

### 3.1 Botões (Buttons)

Aspectos visuais arredondados com dimensões fáceis de serem clicadas ("Fitts's Law"). Foco total no mobile e fácil de perceber de longe.

- **Botão Primário (Solid Action):**
  - Fundo: `#FFB918`
  - Fator Fonte: Texto escuro `#000000` (Preto) ou `#111827`, peso *Bold*.
  - Borda (Curvatura): `8px`.
  - Dimensões Internas (Padding): `16px` em cima/baixo, `32px` nas laterais (aparência de botão calmo e largo).
  - *Estado Hover*: Escurecimento de `5% a 10%` ou sombra projetada: `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);`.

- **Botão Secundário (Solid/Alternative):**
  - Fundo: `#0062FF`
  - Fator Fonte: Texto `#FFFFFF` (Branco), peso *Bold*.
  - Borda: `8px`.

- **Botão Terciário (Outline/Ghost):**
  - Fundo: Transparente (background-color: transparent).
  - Contour/Borda: `1px ou 2px solid #0062FF` (Azul) ou `#111827` dependendo do grid.
  - Texto: Baseado na cor da borda de contorno.
  - *Exemplo de uso:* Botões secundários próximos a primários ("Editar", "Cancelar").

### 3.2 Toasts e Notificações Flutuantes (Floating Banners)
- **Floating Toast Widget (Convite/Chat/Notificações):** Pequenos balões posicionados nos cantos inferiores.
  - Background: Branco Puro `#FFFFFF`.
  - Borda-Radius: `12px` ou `16px` – cantos com grande grau de curvatura por serem flutuantes.
  - Sombreamento Crítico: `box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15)` – para destacá-los bem das camadas inferiores.
  - Fechamento Clássico (Dismiss): Trazer o ícone `X` posicionado limpo no canto superior direito.
  - Alinhamento Opcional: Combinar ícones e emoticons ("Quer falar com um especialista? 🚀") para quebrar a frieza técnica.

### 3.3 Menus Popups e Painéis de Mensagens Internas ("Modals")
- Ex.: *"Seu bot está ativo!", "Documento assinado com sucesso!"*.
- Borda interna (Padding): Amplos "respiros", como `32px` ou `40px` (nada apertado).
- Curvatura (Border-Radius): `16px`.
- Layout Padrão em Popups:
  - 1º Ilustração limpa (no topo, centralizada).
  - 2º Título em destaque `H2`.
  - 3º Body Text em fonte cinza de tom médio (ex `#4B5563`) com um line-height de `1.5` confortando a leitura da ação ocorrida.
  - 4º Botões de comando horizontalizados e centralizados.

## 4. Estrutura de Seções (Layout e Spacing)

### 4.1 Banners Fixos e Top Bars
- Banners comunicativos fixados no topo. Uso de largura (width: `100%`) com fundo de gradiente clean (ou sólido com cores não distrativas). Requer o logo do produto seguido de conteúdo útil ("Call-to-Action à vista sem scroll").

### 4.2 Sections (Modulação da Página)
- **Princípio do Padrão "Z" (Alternância Visual):**
  - Bloco A: Imagem/Gráfico esquerda, Texto de Venda/Guia a direita.
  - Bloco B: Texto à esquerda, Imagem/Gráfico a direita.
  - Favorece uma experiência visual fluida na qual o olho desce a página de modo serpenteante de forma confortável.
- **Micro-Espaçamentos e Macro-Espaçamentos:**
  - Blocos inteiros de página alternando fundos (Branco vs Cinza Gelo `#F8FAFC`).
  - Distanciamento vertical entre Blocos (*paddings verticais*): Recomendados em `80px` a `100px` (desktop) e `48px` a `64px` na visualização móvel. A sensação de vácuo entre as seções é percebida como layout luxuoso.
  - Restrito ao Container: Max-width do conteúdo a no máximo `1200px` de largura centralizada na janela. Textos não devem deitar por largas larguras em telas ultra-wide.

---
**Nota Final de Implementação (Para Desenvolvedores Frontend):**
> Configurem estes identificadores (Colors & Typography) através de Variáveis CSS padrão root (`:root { ... }`) ou no tema do Tailwind/framework em vigor para asseverar constância e facilidade de repintura do tema no Assina Comigo. Tudo o que for "clicável" deve possuir animações sutis (`transition: all 0.2s ease`).

---

## 5. Mapa de Telas e Componentização

Visando a consistência com as diretrizes de UX/UI acima, detalhamos abaixo a arquitetura de cada tela e os requisitos de interface mapeados para os tokens visuais.

### 5.1 Acesso do Provedor (Admin/Comercial)
**Objetivo:** Permitir que Admin/Comercial entrem no ambiente do provedor (tenant).
- **Componentes Obrigatórios:**
  - **Título:** "Entrar" (`H1` ou `H2`).
  - **Campos:** "E-mail" e "Código de acesso" (recebido por e-mail).
  - *(Opcional)* **Campo:** "Código/URL do provedor" (quando não usar subdomínio).
  - **Botões:**
    - Primário: "Entrar" (Amarelo `#FFB918`).
    - Secundário/Texto: "Enviar código" ou link "Esqueci / reenviar código".
- **Mensagens & Estados:**
  - Erro: "Código inválido ou expirado" (Toast/Alerta Vermelho vibrante).
  - Loading: Botão desabilitado com feedback visual.
- **Condição Especial:** Se o provedor for identificado automaticamente (por domínio/URL), ocultar "Código/URL do provedor".

### 5.2 Acesso do Parceiro
**Objetivo:** Permitir login simples do parceiro via WhatsApp ou e-mail com código (sem senha).
- **Componentes Obrigatórios:**
  - **Título:** "Entrar como parceiro".
  - **Seletor:** "Receber código por" (WhatsApp / E-mail).
  - **Campos:** "WhatsApp" ou "E-mail" e "Código".
  - **Botões:** 
    - Envio do Código (ex: "Enviar código").
    - Acesso: "Entrar" (Primário).
- **Mensagens & Estados:**
  - Sucesso: "Enviamos um código para..." (Toast com fundo escuro/verde).
  - Erro: "Código inválido ou expirado".
- **Condição Especial:** Se parceiro estiver "Pendente de aprovação", bloquear acesso na tela de código com aviso claro: "Seu cadastro está em análise".

### 5.3 Portal do Parceiro (Visão Geral)
**Objetivo:** Acesso rápido ao link de indicação central, status e ganhos ou pontos.
- **Componentes Obrigatórios:**
  - **Header Geral:** Logo do provedor acompanhado do Nome do parceiro.
  - **Card: Meu link de indicação:** Texto do link + Botões: "Copiar meu link" e "Compartilhar no WhatsApp".
  - **Status Counters (Cards Menores):** Total / Pendentes / Instaladas / Canceladas ou Não viável. Usa blocos cinza gelo (`#F8FAFC`).
  - **Card Ganhos/Pontos/Vouchers (Condicionais):** "Pendente: R$ X / Recebido: R$ Y" | "Saldo: X pontos" | "Bạn tem X vouchers disponíveis".
  - **Atalhos (List/Nav):** "Meus indicados", "Ganhos e pagamentos", "Pontos" (se ativo).
- **Condição Especial:** Status vazio exibe instrução "Você ainda não fez nenhuma indicação" chamando o parceiro para o botão central "Copiar meu link".

### 5.4 Meus Indicados (Visão Parceiro)
**Objetivo:** Permitir que o parceiro acompanhe o status macro de cada indicado do seu link.
- **Componentes Obrigatórios:**
  - **Título:** "Meus indicados".
  - **Filtros Rápidos (Chips/Pills):** "Todos", "Pendentes", "Instalados", "Cancelados".
  - **Listagem (Cards Simples / Itens Clicáveis):** Nome, WhatsApp, Status atual enfatizado (Tag de cor), Data de envio e (Opcional) "Ganho gerado".
  - **Ação Universal:** Tocar no card para abrir o "Detalhe do Indicado".
- **Condição Especial (Privacidade):** Ocultar CPF e mascarar via asteriscos ou elipse os finais do WhatsApp dependendo do tier de privacidade do admin. Mensagem de estado vazio (Empty state limpo).

### 5.5 Detalhe do Indicado (Visão Parceiro)
**Objetivo:** Visualização macro do histórico comportamental (linha do tempo) de uma indicação fornecida.
- **Componentes Obrigatórios:**
  - **Título:** "Detalhe do indicado".
  - **Bloco de Dados Textuais:** Nome, WhatsApp, Bairro/Cidade (CPF se ativo).
  - **Status & Timeline Escalonável:** Destaque do status atual + Histórico com pontos redondos listando Status/Data.
  - **Recompensa atrelada:** R$ X – Pendente/Pago ou X pontos – Creditado/Pendente (+Data da aferição).
- **Condição Especial:** Aviso sutil se uma submissão foi listada como "Possível duplicado" (sem call to action assustador).

### 5.6 Ganhos e Pagamentos (Visão Parceiro)
**Objetivo:** Demonstração dos rendimentos, vencimentos e histórico de envios com recibos de caixa.
- **Componentes Obrigatórios:**
  - **Título & Head:** "Ganhos e pagamentos" encabeçando a página. Resumo aglutinado de "Total pendente" e "Total recebido" no topo.
  - **Abas de Segmentação (Tabs):** "Pendentes" e "Recebidos", facilitando o fluxo fiscal.
  - **Lista detalhada:** Data de geração, valor transacionado, Ref/ID do sistema, Status (Pagar/Pago/Cancelado).
  - **Ações Finais:** Botão modal ou ícone para o parceiro "Ver comprovante" sob transações concluídas.
- **Condição Especial:** Omita ou reduza o layout a cards informativos da tela 5.7 caso só operem em modelo de pontos.

### 5.7 Pontos (Visão Parceiro)
**Objetivo:** Interface de conta corrente baseada na carteira de pontos (Wallet/Extrato).
- **Componentes Obrigatórios:**
  - **Hero Section do Saldo:** Título "Pontos" com Bloco ampliado de "Saldo atual".
  - **Ledger/Extrato de Movimentações:** Data, Motivo da movimentação e Quantidade (+X creditado verde | -X debitado vermelho).
  - **Filtro Simples de Visualização:** Toggle ou Select "Todos / Créditos / Débitos".
- **Condição Especial:** Empty state gentil se não há movimentações registradas no ledger lógico da conta corrente de pontos.

### 5.8 "Quero ser Parceiro Indicador" (Adesão de Campanha)
**Objetivo:** Captar cadastro público e automatizado associado logo de cara a um grupo com pré-definições (Taxas, Regras).
- **Componentes Obrigatórios:**
  - **Branding Geral:** Cabeçalho com as customizações injetadas via painel do provedor.
  - **Título/Hero:** "Quero ser parceiro indicador" junto do nome/descrição inspiradora do grupo de vendas (como funciona sua recompensa).
  - **Formulário de Entrada Público:** Nome completo, CPF, E-mail, WhatsApp e Termos (Privacidade LGPD via Checkbox de Adesão).
  - **Call to Action de Saída:** Botão retangular largo e principal "Enviar cadastro".
- **Condição Especial:** Modalização pós cadastro variando se aprovação manual ("Em análise. Aguarde aprovação.") ou automática ("Submissão aprovada. Você já pode entrar!").

### 5.9 Indicação (Landing Page Pública do Lead)
**Objetivo:** Permitir envio veloz de capturas de dados orgânicos do Lead, mantendo rastreio contínuo e exato com a ponte de quem o indicou.
- **Componentes Obrigatórios:**
  - **Cabeçalho:** Logotipo/cores nativas do provedor em questão.
  - **Social Proof Contextual:** Barra indicando "Você foi indicado por {Nome do Parceiro Associado}".
  - **Formulário Simples de Coleta:** Nome, WhatsApp, Bairro/Cidade (obrigatórios), CPF (recomendado).
  - **Privacy First (LGPD):** Concordância clara para manipulação ativa do funil e permissão de contatos ("Política de Privacidade").
  - **CTA de Conversão:** "Enviar" (Botão vibrante para fechar funil).
- **Mensagens & Estados:** Toast rápido validando erro na tipagem do formulário ou Duplicidade clara de CPF em Janela Curta (Ex: Últimos 15 dias).
- **Condição Especial:** Bloqueio preemptivo mostrando "Parceiro sem vouchers disponíveis no momento" e barrando o envio se esse estoque chegou a zero.

### 5.10 Confirmação da Indicação
**Objetivo:** O feedback clássico e amigável finalizante do funil para o consumidor final (Lead prospect).
- **Componentes Obrigatórios:**
  - **Status Visual:** Ícone de Celebração ou Check gigantes para calmaria informacional.
  - **Texto Informativo:** "Recebemos seus dados. Em breve o provedor entrará em contato.".
  - **CTA Periférico:** "Voltar ao início" ou re-ancoragem no site central do provedor.
- **Condição Especial:** Interrupções/Downtime no middleware do CRM não deverão espirrar para essa interface pública (Lead acha que foi normal, sistema resolve re-queue internamente).

---

### 5.11 Painel Administrativo / Comercial (Dashboard Visão Águia)
**Objetivo:** Otimizar e fornecer insumos proativos macro ao vendedor/admin logo na abertura do app na manhã.
- **Componentes Obrigatórios:**
  - **Sinalização do Tenant:** {Nome Provedor} + Avatar/Nome ({Comercial Logado ou Admin Logado}).
  - **Cards Analíticos de Curto Prazo:** "Recebidos hoje", "Sem contato", "Parados há X dias", "Em atraso".
  - **Ações Rápidas em Blocos (Jump Links):** Redirecionamento 1-clique para filas densas (ex: Ir para Parados, Ir Para Erros de API no CRM).
- **Condição Especial (RBAC - Role Based Access Control):** Perfil 'Comercial' cego a abas de configuração (Vouchers/Painéis CRM/Ganhos/Usuários), focando 100% no acompanhamento do funil de comissões/vendas ativas do lead.

### 5.12 Listagem de Indicações (Admin/Comercial)
**Objetivo:** Abordar funil dinâmico e visual para filtrar, manusear em bloco, ou individualizar o CRM enxuto.
- **Componentes Obrigatórios:**
  - **Título Macro:** "Indicações".
  - **Search & Filters Array:** Barra de pesquisa livre (texto matchable no Nome/Whats), Filtros combo-box de Status/Equipe Parceira/Data, Toggle Especial ("Possível Duplicado" ou "Paradas em Gargalo").
  - **Grid de Dados Central:** Lead, Célula do Parceiro gerador, Status formatado como Tag/Pílula de coloração relativa, Idade do ticket e Flags do CRM.
  - **Row Activities:** "Mudar status", ou Click Global em qualquer extremidade da Grid para invocar o "Detalhe".
- **Condição Especial:** Semáforos Visuais sobre SLAs (Por exemplo, Verde 0-2 dias sem toque, Amarelo 3-7, Vermelho Absoluto 15+).

### 5.13 Detalhe da Indicação Interna (Admin/Comercial)
**Objetivo:** Single-Source-of-Truth detalhando anatomia da captação comercial.
- **Componentes Obrigatórios:**
  - **Camada de Header/Status:** Título do view e alteração imedia do funil ("Atualizar Status" com modal de Observações de histórico curto).
  - **Informacional do Lead/Origin:** Qual canal, de onde germinou, grupo de payout acoplado.
  - **Timeline Perpétuo:** Log temporal imutável explicitando "QUEM mudou", "DE", "PARA" Status com horários de gravação do banco e comentários acoplados.
  - **Middleware/Recompensas:** Alertas se o lead enroscou ao tentar post no sistema 3rd party (e botão Reprocessar Sincronismo) ou indicação de comissão a injetar no painel financeiro caso status seja alcançado e ative um Trigger financeiro.
- **Condição Especial:** Alert box (Atenção/Warning - Amarelo e Laranja) de "Possível Duplicado" que fornece opção de "Validar / Marcar Legítima" caso averiguado.

### 5.14 Gestão de Parceiros (Visão Admin)
**Objetivo:** Tratar de listagens de entrada do banco de afiliados B2B (Mapear parceários credenciados do sistema).
- **Componentes Obrigatórios:**
  - **Divisão Lógica em Headers:** "Pendentes", "Ativos", "Inativos".
  - **Pesquisa Local:** Regex ágil unificada por fragmentos textuais (nome/cel).
  - **Criadores Primários/Bulk:** Botões de inserção unitária e "Importação em Massa" (Arquivo de Lotes).
  - **Ações Estruturais da Listagem:** "Avaliar/Aprovar", "Desassociar", "Verificar Landing" e "Definir Estoque Vouchers".
- **Condição Especial:** O fluxo de "Importar via Planilha" dispõe de preview (Dry Run) e contagem do Total aceito x Erros antes da inserção dura no banco. Após clicar e APROVAR um consultor "pendente", emitir toast de Sucesso com botões copiáveis dos dois links que o Parceiro e Provedor necessitarão de trocar (Link Portal / Link de Indicação).

### 5.15 Grupos e Regras Financeiras (Admin)
**Objetivo:** Engenharia financeira estabelecendo "grupos" (Agentes autorizados vs Profissionais Físicos avulsos) para amarrar os triggers/payout de premiação.
- **Componentes Obrigatórios:**
  - **Layout List / Add View:** Grade dos existentes. Modal amplo ao pressionar "Criar Novo".
  - **Modelador de Formatos:** Field de Input "Nome" | Botão Radio do Tipo de Payout ("Points" or "Flat Money R$").
  - **Gatilhos / Condicionantes:** Dropdown para trigger (ex: Premia só no Status Aceito, ou Premia na Assinatura do Contrato).
  - **Configurações Administrativas do Template:** Auto-Aprovação Habilitada(Toggle Switch), Time delta em D+Dias após trigger acontecer.
- **Condição Especial:** Reestruturação reativa/Dynamic Inputs do formulário ao alternar de grana "R$" pra pontos virtuais no seletor primário.

### 5.16 Links Públicos de Parceria (Admin)
**Objetivo:** Prover agilidade/gestão nas UTMs fixas ou URLs de aterrissagem aos canais públicos de captação que visam agregar parceiros.
- **Componentes Obrigatórios:**
  - **Lista Relacional:** Nome linkado ao seu grupo.
  - **Funcional de Cópia e Snippets:** Sub-view rápido prevendo estrutura do Form associada ao Grupo. Botão persistente do lado das rows listadas para "Copiar ao clipboard de transferência as URLs".
- **Condições Especiais:** Custom Slug Inputs aprimorando links curtos com o termo de preferência e inativação de rota do Link que cai num 404 brando ("Link Ocultado") se a diretoria desativou tal template.

### 5.17 Recompensas e Fluxo de Pagamentos/Caixa (Admin)
**Objetivo:** Conferência contábil, de repasses de bonificação e aging financeiro.
- **Componentes Obrigatórios:**
  - **Categorização Monetária Superior:** Tabulações segregando Dinheiro versus Pontos de fidelidade.
  - **Filtros Contábeis:** Drops de Parceiro, Status de Inadimplência, recortes de Período (Quando gerou x Quando quitou) e se tem dívidas puras ativas.
  - **Colunas:** Data, ID do repasse, aging retardo, montante de corte, sinalizador "Pago / Atrasado".
  - **Quitação no Sistema:** Ao assinalar Check como Pago, forçar a subida/anexo de documento bancário, e setar explicitamente a data em que saiu de caixa.
- **Condições Especiais:** Se as settings da plataforma forçarem comprovante mandatório, barrar salvamento final ("Confirmar desilitado"). Painel cromático indicando ranges de dias atolados (Verde 0-7 dias de débito para laranja e escalando em vermelho p/ mais velhos).

### 5.18 Extrato de Pontos Centralizados (Admin)
**Objetivo:** Ferramental de manipulação/alteração manual em banco do cofrinho de créditos que operam para recompensado.
- **Componentes Obrigatórios:**
  - **Painel C.R.U.D Simplificado de Pontos:** Autocomplete poderoso ou box modal para buscar o usuário (Parceiro).
  - **Visor do Capital Contábil do Wallet:** "Saldo Atual" estampado com firmeza superior.
  - **Adoção de Débitos e Credenciais Ad Hoc Excepcionais:** Modal com a Quantidade, Obrigatoriedade do Parecer Escrito ("Porque ganha X") e quem do Staff chancelou tal operação, exibido na Grid Extrato permanente temporal.

### 5.19 Personalização Tema e White-Label (Admin)
**Objetivo:** Permitir ao inquilino (provedor) remapear o esqueleto do portal front-line (Leads + Afiliados) na sua própria cor e selo visual corporativo.
- **Componentes Obrigatórios:**
  - **Campos de Mutações (UI Customization Box):** Upload da base do logotipo em alta definição. Pickers em gradiente hexadecimal para seleção das Primary Brands (Cor do Botão/Links) vs Cores Fundo e Selection Box restrito ao escopo das 5 top fonts homologadas.
  - **Live Sandbox / Tela de Visualizador Real-Time:** Uma visualização mimetizada ao lado re-renderizando a "Página de Afiliado" e a "Landing Page da Venda Lead" no próprio browser simulando a marca vestida na engine Assina Comigo de bate pronto.

### 5.20 Acoplamento de CRM e Eventos Externos (Admin)
**Objetivo:** Módulo de gerenciamento e tolerância a falhas na submissão orgânica para softwares de funil e vendas consolidados em outras órbitas.
- **Componentes Obrigatórios:**
  - **Seleção e Credenciais do Hub API/Webhook:** Input Token para Autenticação. Teste explícito "Test Connection Payload" no topo, disparador em verde via toast após match.
  - **Mapping Engine:** Tabela/Grade estática apontando a conversão interna para campos de destino exigíveis pelos softwares terceirizados.
  - **Resilience Pool (Fila Reprocessadora):** Grid de dados dos Logs que obtiveram Erro (500s ou Timeouts) em envios falhos ou dropados no transporte de internet, incluindo log visível, botões de re-enviabilidade na mão.

### 5.21 Relacional de Usuários Colaboradores (Admin)
**Objetivo:** Cadastro sistêmico de acessos de RH operacional ao tenant por parte do dono provedor corporativo.
- **Componentes Obrigatórios:**
  - **Lista Visual de Empregados:** Identificação (Nome, Email), Credencial Roles (Permissive de Admin x Restritivo só-Comercial), Flag de Conta suspensa ou operante.
  - **Modais Criacionais Clássicos:** Inputs do funcionário.
- **Condição Especial:** Se o Tenant utiliza "Magic Link/Email Código Baseado", dispare nota visual informativa: ("O funcionário está pronto para acesso, ele efetuará a entrada através do Email fornecido. Senhas não aplicáveis e ignoradas.").

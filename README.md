<div align="center">
  <img src="https://ui-avatars.com/api/?name=Assina+Comigo&background=FFB918&color=111827&size=150&rounded=true" alt="Logo Assina Comigo"/>
  <br/>
  <h1>🚀 Assina Comigo - v1</h1>
  <p><b>Sistema Multi-tenant de referral e rastreamento de indicações para provedores de internet.</b></p>

  [![Astro](https://img.shields.io/badge/Astro-0C1120?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
  [![n8n](https://img.shields.io/badge/n8n-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)
</div>

<br/>

## 📖 Sobre o Projeto
**Assina Comigo** nasce com a missão de eliminar planilhas e processos manuais no controle de indicações para ISPs (Provedores de Internet). 
Um sistema leve, focado na experiência Mobile-First e altamente integrado aos canais de venda. O ecossistema promove links de compartilhamento limpos, comissionamento parametrizável em reais ou pontos, painel administrativo blindado e integração contínua avançada (via n8n).

### ✨ Destaques
- **🏗️ Multi-Tenant Estrutural:** Ambientes estritamente isolados usando *Row Level Security (RLS)* nativo na base de dados (Supabase).
- **🎨 White-Label Leve:** Interface personalizável (cores primárias, tipografias e logotipos) para cada Provedor Inquilino.
- **⚡ Foco em Conversão:** Landing pages dinâmicas, altamente responsivas e otimizadas através de Diretrizes UX/UI consolidadas.
- **🛡️ Cybersecurity First:** Atribuição à prova de balas utilizando rotinas de Last-Click via frontend e quarentena de repasses gerenciadas com integridade antifraude.

## ▶️ Execucao Rapida (Local)
Para subir o projeto rapidamente na porta `4321`:

```bash
npm run setup
npm start
```

O comando `npm start` agora:
- libera automaticamente a porta `4321` se ela estiver ocupada;
- inicia o Astro com porta fixa (`4321`) e sem fallback silencioso de porta.

Rotas principais:
- Dashboard parceiro: `http://localhost:4321/parceiro/dashboard`
- Home publica: `http://localhost:4321/`

---

## 🗺️ Status do Roadmap (V1)
O desenvolvimento do sistema está distribuído em etapas cruciais, garantindo segurança na base e maestria no frontend. 

- [x] 🗄️ **Fase 1: Fundação & Segurança** – Isolamento Multi-Tenant configurado, perfis RLS blindados, restrições compostas contra duplicidades implementadas no `Supabase`.
- [ ] 🎨 **Fase 2: Design System** – Tokens visuais CSS, modais expansíveis e acessibilidade (Mobile First).
- [ ] ⚙️ **Fase 3: Funcionalidades MVP** – Login, ecossistema de captura (Landing pages) e Dashboard Comercial.
- [ ] 🤖 **Fase 4: Automação & Resiliência** – Fluxo de aprovação/quarentena no `n8n` e integração transparente de CRM.
- [ ] 🚀 **Fase 5: Validação e Deploy** – Simulacros, Homologação e Lançamento Real.

---

## 📂 Estrutura do Projeto

Ecossistema organizado em monorepo, contendo Front-end (Astro) e Back-end / DB (Supabase CLI):

```bash
📦 assina-comigo
 ┣ 📂 .agents         # Skills e regras estritas da IA (ex. segurança RLS e UX/UI).
 ┣ 📂 docs            # Documentos e Guias de Produto (PRD, Diretrizes e Roadmap V1).
 ┣ 📂 src             # Core Codebase do app Astro.
 ┃ ┣ 📂 assets        # Mídias visuais e tipográficas (SVG, fontes).
 ┃ ┣ 📂 components    # Peças de UI e Botões/Toasts reutilizáveis (Design System).
 ┃ ┣ 📂 layouts       # Estruturas padrão globais de páginas.
 ┃ ┣ 📂 pages         # Rotas da aplicação (ex: Painel Administrador, Landing Pages).
 ┃ ┗ 📂 utils         # Funções auxiliares (Tracking Last-click, formatação, etc).
 ┣ 📂 supabase        # Configurações do Banco de Dados e Migrations.
 ┃ ┣ 📂 migrations    # Scripts SQL versionados (Fase 1 completada contendo RLS e Tabelas).
 ┃ ┗ 📜 config.toml   # Parâmetros e porta do backend Supabase local.
 ┣ 📂 public          # Favicons e arquivos estáticos estritos.
 ┣ 📜 README.md       # Documentação principal do ecossistema.
 ┗ 📜 package.json    # Dependências Node.
```

---

## 🔒 Princípios de Segurança Assumidos

Segundo nossa core-skill em `cybersecurity`:
1. **Blindagem Backend (Supabase RLS):** Nenhuma camada visível (front-end ou API key pública) tem o poder de sobrepor as políticas do RLS atreladas ao `tenant_id`. Se a aplicação falhar de forma externa, o Banco de dados recusa o vazamento de dados cruzados internamente.
2. **Quarentena Financeira:** Proteção absoluta contra prejuízos financeiros para provedores que sofrem churns pós-instalação imediata. Toda comissão validada entra em período de carência (quarentena lockada na base temporal do PostgreSQL) antes de ficar disponível.
3. **Auditoria Limpa:** Modelagem com restrições (`Constraints` compostas) e rastreabilidade que impossibilita apagões de histórico ou criação de clientes fictícios para faturamento duplo na mesma base.

---
<p align="center">Construído com extrema dedicação, foco em performance absurda e segurança militar. ☕</p>

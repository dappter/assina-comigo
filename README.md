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
**Assina Comigo** nasce com a missão de eliminar panilhas e processos manuais no controle de indicações para ISPs (Provedores de Internet). 
Um sistema leve, focado na experiência Mobile-First e altamente integrado aos canais de venda. O ecossistema promove links de compartilhamento limpos comissionamento parametrizável em reais ou pontos, painel administrador administrativo total e integração contínua (via n8n).

### ✨ Destaques
- **🏗️ Multi-Tenant Real:** Ambientes estritamente isolados usando *Row Level Security (RLS)* diretamente na base de dados (Supabase).
- **🎨 White-Label Leve:** Interface personalizável (cores primárias, tipografias e logotipos) para cada Provedor Inquilino.
- **⚡ Foco em Conversão:** Landing pages dinâmicas, altamente responsivas e otimizadas através de Diretrizes UX/UI consolidadas.
- **🛡️ Cybersecurity First:** Atribuição à prova de balas utilizando rotinas de Last-Click e quarentena de repasses gerenciadas com integridade via webhook (n8n).

---

## 🗺️ Visão do Roadmap (V1)
O desenvolvimento do sistema está distribuído em etapas cruciais, garantindo segurança na base e maestria no frontend. 

* 🗄️ **Fase 1: Fundação & Segurança** – Isolamento, perfis RLS, restrições compostas.
* 🎨 **Fase 2: Design System** – Tokens visuais CSS, modais expansíveis e acessibilidade (Mobile First).
* ⚙️ **Fase 3: Funcionalidades MVP** – Login, ecossistema de captura (Landing pages) e Dashboard Comercial.
* 🤖 **Fase 4: Automação & Resiliência** – Fluxo de aprovação/quarentena no `n8n` e integração transparente de CRM.
* 🚀 **Fase 5: Validação e Deploy** – Simulacros, Homologação e Lançamento Real.

---

## 📂 Estrutura de Pastas e Responsabilidades

Abaixo o escopo do ecossistema estruturado em nosso front-end baseado em **Astro**:

```bash
📦 assina-comigo
 ┣ 📂 .agents         # Skills e regras de operação estrita (ex. isolamento RLS e Lógica).
 ┣ 📂 docs            # Documentos e Guias de Produto (PRD, UX/UI, Roadmap V1).
 ┣ 📂 src             # Core Codebase do app Astro.
 ┃ ┣ 📂 assets        # Material e mídias visuais e tipográficas raw.
 ┃ ┣ 📂 components    # Peças de UI e Botões/Toasts reutilizáveis (Guidelines Assina Comigo).
 ┃ ┣ 📂 layouts       # Estruturas padrão (padrão Z, White-labels).
 ┃ ┣ 📂 pages         # Rotas e páginas (ex: Painel, Landing, Acesso).
 ┃ ┗ 📂 utils         # Funções auxiliares (Tracking Last-click localStorage, etc).
 ┣ 📂 public          # Favicons e rotas estáticas cruas.
 ┣ 📜 README.md       # Isso que você está lendo agora.
 ┗ 📜 package.json    # Dependências do pacote.
```

---

## 🔒 Princípios de Segurança Assumidos

Segundo nossa core-skill em `cybersecurity`:
1. **Blindagem Supabase:** Nenhuma camada da aplicação tem poder de sobrepor as políticas do RLS atreladas ao `tenant_id`. Se a aplicação falhar, o Banco de dados recusa a filtragem de redes cruzadas.
2. **Quarentena de Recebimento:** Proteção absoluta contra prejuízos financeiros para provedores que sofrem retração e churns imediatos. A automação n8n processa a fila antes de validar uma transação.
3. **Auditoria Limpa:** Status de *timeline* rastreável que impossibilita apagões de histórico ou contestações de mudança temporal.

---
<p align="center">Construído com extrema dedicação e zelo. Segurança + Performance.</p>

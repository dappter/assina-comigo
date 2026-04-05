<div align="center">
  <img src="https://ui-avatars.com/api/?name=Assina+Comigo&background=6028FF&color=FFFFFF&size=200&rounded=false&bold=true" width="100" alt="Assina Comigo Logo"/>
  <br/>
  
  # 🚀 Assina Comigo - Ligeira Telecom
  
  [![Vercel Deploy](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  [![Supabase Powered](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
  [![Astro Framework](https://img.shields.io/badge/Astro-0C1120?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  
  **Transformando indicações em assinaturas com a velocidade da Ligeira Telecom.**
  
  [Visão Geral](#-visão-geral) • [Funcionalidades](#-funcionalidades-premium) • [Stack](#-stack-tecnológica) • [Segurança](#-segurança--arquitetura) • [Instalação](#-instalação)
</div>

---

## 📖 Visão Geral

O **Assina Comigo** é uma plataforma inovadora de indicações para provedores de internet, focada no crescimento acelerado da **Ligeira Telecom**. Construído com uma arquitetura **Multi-tenant** robusta, o sistema permite que parceiros e vendedores colaborem de forma segura e eficiente para expandir a base de clientes no Cariri.

### 🌟 Diferenciais da V1.2.2
- **Dashboard Integrado**: Vendedores e Admin unificados em uma única experiência de gestão.
- **Inteligência Cariri**: Validação geográfica automática para Juazeiro, Crato e Barbalha.
- **Google OAuth Fix**: Recuperação de sessão e troca de PKCE estabilizada para ambientes Vercel.
- **Cookie Resilience**: Persistência de login entre subdomínios (www vs naked domain).

---

## ✨ Funcionalidades Premium

### 🏢 Gestão de Leads e Vendas
- **Funil em Tempo Real**: Visualize o status de cada instalação instantaneamente.
- **Auditoria Administrativa**: Controle total sobre as operações da equipe de vendas no mesmo dashboard.
- **Cards Dinâmicos**: KPIs que funcionam como atalhos para navegação rápida.

### 📍 Experiência do Parceiro (Landing Pages)
- **Auto-fill de Endereço**: Integração ViaCEP para preenchimento zero-erro.
- **Validação Regional**: Filtro estrito baseado no CEP para garantir lead qualificado.
- **UX Gamificada**: Uso de micro-animações e paleta Ligeira Premium para conversão máxima.

---

## 🛠️ Stack Tecnológica

| Camada | Ferramentas |
| :--- | :--- |
| **Núcleo** | Astro 4.0 (SSR), TypeScript, JavaScript |
| **Estética** | Tailwind CSS (Visual Glassmorphism), Lucide Icons |
| **Backend** | Supabase (PostgreSQL, Auth PKCE, Storage) |
| **Segurança** | Row Level Security (RLS), Tenant Isolation |
| **Infra** | Vercel (Edge Functions, SSR Hosting) |

---

## 🔒 Segurança & Arquitetura

Nossa base tecnológica segue princípios rigorosos de proteção de dados:

- **Isolamento de Tenants**: Cada dado é blindado por um `tenant_id` em nível de banco de dados.
- **Zero Leak Policy**: Configuração estrita de `.gitignore` e gestão de segredos via Vercel Edge.
- **Auth Moderno**: Implementação de fluxos PKCE para evitar interceptação de tokens.
- **Documentação de IA**: O projeto utiliza agentes especializados (`.agents/skills`) para garantir que novos códigos sigam as regras de segurança estabelecidas.

---

## 📂 Estrutura de Diretórios

```bash
📦 assina-comigo
 ┣ 📂 .agents         # Documentação e regras para a IA (Skills)
 ┣ 📂 src             # O coração da aplicação
 ┃ ┣ 📂 pages         # Rotas SSR (Public, Admin, Parceiro, Vendedor)
 ┃ ┣ 📂 services      # Lógica de integração e regras de negócio
 ┃ ┣ 📂 layouts       # Estruturas de página (Master Layouts)
 ┃ ┗ 📂 components    # UI Atomic components
 ┣ 📂 supabase        # Esquemas de banco e políticas RLS
 ┗ 📜 README.md       # Você está aqui
```

---

## ⚙️ Instalação

1. **Clone e Instale**
   ```bash
   git clone https://github.com/vendedor/assina-comigo.git
   cd assina-comigo
   npm install
   ```

2. **Variáveis de Ambiente** (`.env`)
   ```env
   PUBLIC_SUPABASE_URL=seu_url
   PUBLIC_SUPABASE_ANON_KEY=seu_key
   SUPABASE_SERVICE_ROLE=seu_secret
   ```

3. **Rodar em Desenvolvimento**
   ```bash
   npm run dev
   ```

---

<div align="center">
  <p>Construído por <b>Ligeira Telecom</b> & Antigravity</p>
  <img src="https://img.shields.io/badge/Made%20with-Passion-red?style=for-the-badge" alt="Made with Passion"/>
</div>

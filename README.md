<div align="center">
  <img src="https://ui-avatars.com/api/?name=Ligeira+Telecom&background=6028FF&color=FFFFFF&size=150&rounded=true" alt="Logo Ligeira Telecom"/>
  <br/>
  <h1>🚀 Assina Comigo - Ligeira Telecom</h1>
  <p><b>Plataforma de Indicação e Gestão de Vendas Premium para Provedores de Internet.</b></p>

  <p>
    <img src="https://img.shields.io/badge/Astro-0C1120?style=for-the-badge&logo=astro&logoColor=white" alt="Astro"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
    <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TS"/>
  </p>
</div>

---

## 📖 Visão Geral

O **Assina Comigo** é uma solução *SaaS Multi-tenant* de alta performance projetada para a **Ligeira Telecom**. O sistema automatiza o ciclo completo de indicações: desde o link de convite do parceiro até a instalação e o pagamento de comissões, com foco total em **conversão** e **segurança**.

### 🌟 Diferenciais Premium
*   **Design de Alto Impacto**: Interface moderna com transparências (glassmorphism) e animações fluidas.
*   **Inteligência de Localização**: Validação automática de CEP com trava regional para o **Cariri (CE)**.
*   **Gestão Unificada**: Admin e Vendedores compartilham o mesmo ecossistema com permissões inteligentes.
*   **Segurança Militar**: Row Level Security (RLS) no Supabase garante o isolamento total de dados.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | [Astro](https://astro.build/) + [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) (Vanilla CSS para componentes core) |
| **Backend/DB** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage) |
| **Infra** | [Vercel](https://vercel.com/) |
| **Automação** | [n8n](https://n8n.io/) |

---

## 🚀 Novidades das últimas versões

### 📦 Módulo de Vendas Integrado
Integramos o dashboard de vendedores diretamente ao painel administrativo. 
*   **Acesso Unificado**: Administradores podem auditar e gerenciar a equipe de vendas sem trocar de conta.
*   **Cards Interativos**: KPIs do dashboard agora são atalhos diretos para as ferramentas de gestão.

### 📍 Validação Geo-Localizada (Cariri)
Aprimoramos o formulário de indicação para garantir que apenas leads viáveis sejam capturados:
*   **Auto-CEP**: Preenchimento automático de logradouro e bairro via API.
*   **Filtro Regional**: Restrição estrita para as cidades de **Juazeiro do Norte**, **Crato** e **Barbalha**. Leads fora dessa zona são alertados instantaneamente.

---

## 📂 Estrutura do Projeto

```bash
📦 assina-comigo
 ┣ 📂 .agents         # Inteligência e regras estritas da IA (Arquitetura e Segurança).
 ┣ 📂 src             # Código-fonte da aplicação.
 ┃ ┣ 📂 pages         # Rotas (Admin, Parceiro, Vendedor, Landing Pages).
 ┃ ┣ 📂 services      # Camada de lógica de negócio e integração DB.
 ┃ ┣ 📂 layouts       # Estruturas padrão (AdminLayout, PublicLayout).
 ┃ ┗ 📂 components    # Componentes de UI reutilizáveis.
 ┣ 📂 supabase        # Migrations e políticas RLS.
 ┗ 📜 README.md       # Esta documentação.
```

---

## 🔒 Security First (ISO/OWASP inspired)

Este projeto foi construído sob uma arquitetura de segurança rígida:
*   **Zero Leak Policy**: Todos os secrets de banco e chaves de API são gerenciados via variáveis de ambiente (`.env`), com `gitignore` configurado para impedir uploads acidentais.
*   **Isolamento RLS**: Políticas de *Row Level Security* aplicadas via PostgreSQL garantem que usuários de diferentes empresas (Tenants) nunca vejam dados uns dos outros.
*   **Sanitização Proativa**: Validação de dados (CPF, Telefone, CEP) tanto no backend quanto no frontend para evitar injeções ou lixo na base de dados.

---

## ⚙️ Instalação e Desenvolvimento

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/vendedor/assina-comigo.git
    ```
2.  **Instale as dependências**:
    ```bash
    npm install
    ```
3.  **Configure o Ambiente**:
    Crie um arquivo `.env` com suas credenciais do Supabase.
4.  **Inicie o ambiente de desenvolvimento**:
    ```bash
    npm run dev
    ```

---

<div align="center">
  <p>Desenvolvido com ❤️ para a <b>Ligeira Telecom</b>. Focado em velocidade e conversão.</p>
  <img src="https://forthebadge.com/images/featured/featured-built-with-love.svg" alt="Built with love"/>
  <img src="https://forthebadge.com/images/featured/featured-prouder-than-ever.svg" alt="Prouder than ever"/>
</div>

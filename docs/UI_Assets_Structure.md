# Organização de Assets e Mídia - Assina Comigo

Para garantir a coesão visual e harmônica que estruturamos no nosso guia UX/UI (baseado em referências de altíssima conversão), a arquitetura de pastas do frontend e os arquivos de mídia (Assets) devem ser padronizados.

Abaixo, apresento a árvore de diretórios recomendada para o seu projeto (seja ele em React, Next.js, Vue, etc.) e o checklist exato de **quais imagens/arquivos você precisará me enviar** ou que buscaremos em bibliotecas Open Source para preencher o sistema.

---

## 1. Estrutura de Pastas (Diretórios Frontend)

Dentro da pasta `/src` do seu projeto web, organize os assets visuais da seguinte forma estrutural:

```text
src/
└── assets/
    ├── branding/
    │   ├── logo-assina-comigo-dark.svg    (Logo principal para fundos claros)
    │   ├── logo-assina-comigo-light.svg   (Logo branco para fundos escuros/primários)
    │   └── favicon.ico / .png
    │
    ├── illustrations/                     (Ilustrações de Empty States e Onboarding)
    │   ├── empty-indications.svg          (Parceiro sem indicações logadas)
    │   ├── success-confetti.svg           (Lead preencheu o formulário com sucesso)
    │   ├── link-shared.svg                (Feedback visual de "link copiado")
    │   ├── error-duplicate.svg            (Aviso de lead duplicado)
    │   └── admin-dashboard.svg            (Hero image no login do Admin)
    │
    ├── icons/                             (Ícones UI independentes da font-icon)
    │   ├── social-whatsapp.svg
    │   ├── icon-copy-link.svg
    │   ├── icon-money-bag.svg             (Representação dos Ganhos)
    │   └── icon-star-points.svg           (Representação de Pontos)
    │
    └── mocks/
        └── avatar-placeholder.webp        (Foto genérica de usuário cinza)
```

---

## 2. O que você precisa providenciar (Seus Assets Proprietários)

Estes são os arquivos cruciais da **Sua Marca** que eu precisarei que você me envie (de preferência em formato `.SVG` ou `.PNG` com fundo transparente):

1. **Logotipo Principal (Brand):**
   - O logo oficial do "Assina Comigo". Precisamos de uma versão com a escrita escura (para o fundo branco/gelo do sistema) e uma versão monocromática branca (caso precisemos colocar sobre o botão ou banner amarelo primário).
2. **Favicon:**
   - O ícone do navegador (`16x16` e `32x32`), idealmente o símbolo da sua marca sem o texto.

---

## 3. O que podemos buscar na Web / Frameworks (Nossa Responsabilidade UI)

Para manter o design limpo e de aspecto **"SaaS Premium"**, não precisaremos sobrecarregar a tela com fotos pesadas. Vamos abusar de gráficos em vetor (`SVG`).

Eu/Nós aplicaremos o uso do **[UnDraw](https://undraw.co/illustrations)** ou **[Phosphor Icons](https://phosphoricons.com/)/[Lucide](https://lucide.dev/)**. 

### 3.1. Ilustrações de Empty States (Contextos Vazios)
*O que é:* Quando o parceiro loga pela primeira vez, a tela "Meus Indicados" estará vazia. Uma tela em branco frustra o usuário.
* **Estética da Imagem:** Uma ilustração vetorial limpa, com linhas suaves. Vamos injetar a cor Secundária (Azul `#0062FF`) e o Primário (Amarelo `#FFB918`) da nossa paleta por dentro dessas imagens SVG.
* **Exemplos que aplicaremos:**
  - Um personagem segurando um megafone (Para a tela *Quero ser parceiro*).
  - Uma pasta ou prancheta vazia com um sorriso (Para *"Você ainda não logou nenhuma indicação"*).
  - Um troféu ou cofre digitalizado simples (Para a aba de *Pontos/Ganhos* vazia).

### 3.2. Biblioteca de Ícones de Interface
*O que é:* O framework iconográfico. 
* **Estética:** Usaremos a biblioteca `Lucide Icons` (Open Source, moderna). 
* **Aplicação:** Os ícones terão traços de espessura de `2px` com bordas arredondadas (linecap round). Isso trará modernidade e combinará perfeitamente com os "boulders" (cantos de botões de `8px`) delineados no guia UX.
* **Checklist (já contemplados na UI):**
  - Ícone de WhatsApp preenchido (verde para CTAs e compartilhamento).
  - Ícone de "Link" pequeno ao lado do URL do afiliado.
  - Ícones rápidos de Setas (`ArrowRight`) em CTAs de "Entrar".
  - Ícones de `CheckCircle` vibrantes para status esverdeados (Instalado/Pago).

### 3.3. Painéis e Banners Provedores (Customizáveis)
*Contexto:* O Admin terá uma tela listada no mapa ("Personalização Tema do Provedor").
* **Estrutura Visual recomendada:** 
  - Ao invés de permitirmos que os Provedores enviem *imagens gigantes de fundo* (que geralmente deixam o site lento ou quebram o visual em monitores exóticos), daremos a ele uma customização limpa.
  - **A regra será:** Eles enviam **(A) Logo do provedor** + Escolhem **(B) 1 Cor Primária HEX**.
  - O restante das telas (área de captura de indicações, portal do parceiro do provedor MEO) será matematicamente estilizado em cima dessa cor.
  - **Banner Topo:** Não será uma imagem JPG, será um CSS paramétrico: `background: linear-gradient(to right, {CorPrimaria_Selecionada_Provedor}, {CorPrimaria_Selecionada_Provedor_Mais_Escura});`.

---

## 4. O Fluxo Visual de Imagens (Harmonia com o CSS)

Para unir as Diretrizes de Texto/Botão com as Imagens:
- **Ausência de Bordas Duras:** Todas as imagens/ilustrações (`.png` ou `.svg`) que entrarem em tela flutuando soltas, preferencialmente não terão sombras (`box-shadow`) brutais. A tela será muito focada nos cartões brancos (`#FFFFFF`) sobre o fundo gelo (`#F8FAFC`).
- **Estados de Atenção Visuais:** Na listagem de Parceiros, se um lead for marcado como **"Possível duplicado"**, não usaremos um mega banner de erro visual. O layout insere uma Ícone estática amarela (`AlertTriangle` do Lucide) acoplada a um background suave (`bg-yellow-50` texto `text-yellow-800`).
- **Aninhamento do Check:** Quando a landing page de captura do lead rodar com sucesso ("Recebemos seus dados"), chamaremos uma arte rápida (`success-confetti.svg` ou variação parecida de sucesso orgânico) reinando centralmente na interface acima da tipografia `H2`.

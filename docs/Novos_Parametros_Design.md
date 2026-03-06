# Novos Parâmetros de Design - Assina Comigo

Este documento consolida as novas abordagens de design aplicadas às telas (Login, Adesão, Extrato e Sucesso), servindo como o **Single Source of Truth** para as próximas implementações visuais, alinhado aos princípios previamente definidos nas guidelines de UX/UI.

## 1. Fundamentos Visuais

O visual do "Assina Comigo" agora abraça uma estética mais vibrante, arrojada e moderna (inspirada fortemente em aplicativos nativos top-tier e plataformas SaaS premium). 

- **Glassmorphism:** Uso intencional de fundos translúcidos (`backdrop-blur-md`, `bg-white/90` ou `bg-white/20`) combinados com sombras e bordas finas para gerar camadas elegantes, especialmente em cima de gradientes abstratos.
- **Arredondamento Suave:** Os cantos são generosos. O padrão antigo (`rounded-lg`, ~8px) evoluiu. Os cartões principais devem usar bordas como `rounded-2xl` (16px), `rounded-[24px]` a `rounded-[32px]`. Botões largos e inputs devem ter ao menos `rounded-xl` ou `rounded-2xl`.
- **Animações (Microinterações):** Tudo deve ter percepção tátil. Botoes principais com `active:scale-[0.98]`, cartões de métricas com `hover:-translate-y-1 transition` e exibições transicionais (ex: entrada usando a animação flexível `bounceIn`).

## 2. Paleta de Cores e Gradientes (Tailwind)

Em complemento à paleta descrita no documento base, agora aplicamos as cores com mais gradientes marcantes ("Vibrant"):

*   **Primária / Call-to-Action (Amarelo):** `#FFB918`. Usar frequentemente gradientes dinâmicos do amarelo-claro ao vibrante (`bg-gradient-to-r from-yellow-400 to-primary`).
*   **Secundária / Cartões de Foco (Azul Elétrico):** A paleta de azuis abrange `from-[#0052FF] via-[#2563EB] to-[#00D4FF]` em fundos primários como cartões de ganho.
*   **Campanhas Especiais:** Foi introduzido o rubi/violeta (`primary: #E11D48`, `secondary: #7C3AED`) especialmente voltados para páginas chamativas de adesão de parceiros, denotando agressão ao mercado e lucros rápidos (`bg-gradient-to-br from-secondary via-fuchsia-500 to-primary`).
*   **Dark Mode Nativo:** Fundo primário `dark:bg-slate-900` ou `dark:bg-slate-950`. Cartões `dark:bg-slate-800` com bordas `dark:border-slate-700`.

## 3. Tipografia Adicional

- Família Fonte Primária: Continua sendo a **Inter**.
- Contraste e Peso (Weights): Títulos de cabeçalho (`H1`, `H2`) agora devem adotar pesos extra fortes, como `font-black` (900) ou `font-extrabold` (800) somados a um tracking ajustado (`tracking-tight`) e leading curto (`leading-tight` ou `leading-none`).
- Textos Complementares: Usados frequentemente em caixa-alta (`uppercase tracking-wide`) para rótulos curtos ("LABEL", "SALDO TOTAL", etc.) usando tons opacos (`text-slate-500`, `text-white/70`).

## 4. Estruturação dos Layouts

- **Mobile-First App-like Feel:** As telas devem parecer nativas ao celular. Adoção total do comportamento pegajoso (`sticky top-0`) nos headers de navegação, com o fundo borrado (`backdrop-filter: blur(20px)` - `ios-blur`). Menus de fundo (`nav fixed bottom-0 left-0...`) também usam este recurso translúcido, separando-os de seções ricas localizadas abaixo ou atrás deles.
- **Espaçamento e Posicionamento (Safe Areas):** No mobile, criar buffers que imitam *safe areas* nativos (`h-12 w-full`) ou margens para o botão de 'home' (notch bar) no fim da tela.
- **Fuga do fundo branco chapado:** Nunca utilizar fundos unicolores chapados e brancos. Usar sempre gradientes delicados com ruído mínimo ou cores frias como `#F8FAFC` no Light Mode.

## 5. Sombras Coloridas (Tinged Shadows)

- Abandonar sobras pretas/cinzas padrão em elementos-chave.
- Usar sombras coloridas relacionadas à cor dos botões e paineis principais para emanar luz da própria UI. Exemplo: `shadow-lg shadow-primary/30`, ou `shadow-[0_8px_25px_-5px_rgba(225,29,72,0.6)]`.

## 6. Recursos da Pasta Assets

**Imagens, Ícones e Ilustrações:**
Sempre que uma tela precisar exibir uma imagem ilustrativa no processo de UX (exemplo: tela de adesão, ou página vazia no extrato), referenciar sempre imagens já disponibilizadas localmente no projeto na pasta `src/assets/`. 

*Exemplo de incorporação:*  
`<img src="/src/assets/illustrations/share-link.svg" alt="Imagem descritiva" class="..."/>`  

---

**Com tudo isso combinado, a nova UI deixa de ter uma "cara de painel administrativo genérico" para ter presença visual de Fintech ou Growth Startup.**

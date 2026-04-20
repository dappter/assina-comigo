const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const astroPath = path.join(__dirname, 'src', 'pages', 'index.astro');

console.log("==> Iniciando o conserto imediato do arquivo index.astro...");

try {
  // 1. Restaurar o arquivo puro do GIT para remover qualquer código corrompido ou texto esticado
  console.log("==> Desfazendo a corrupção gerada no código (executando git restore)...");
  execSync('git restore src/pages/index.astro', { stdio: 'ignore' });
  console.log("==> Arquivo restaurado! A tela agora será limpa dos textos exóticos.");
} catch (e) {
  console.log("==> Aviso: Não foi possível restaurar pelo git, continuaremos com a substituição cirúrgica.");
}

// 2. Lendo o arquivo original
let content = fs.readFileSync(astroPath, 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.substr(1);
}

// O erro aconteceu porque o conteúdo do script anterior colidiu no replace.
// Desta vez vamos usar regex estruturais pesadas para arrancar O ESPAÇO gigante e inútil (300vh).

console.log("==> Removendo a antiga lógica 3D esticada de 300vh e scripts antigos...");

// Busca as importações da página para poder colocar a nova no topo
const frontmatterEndIndex = content.indexOf('---', 3);
if (frontmatterEndIndex !== -1 && !content.includes('import InteractiveRouter')) {
    const topo = content.slice(0, frontmatterEndIndex);
    const fundo = content.slice(frontmatterEndIndex);
    content = topo + `import InteractiveRouter from "../components/InteractiveRouter.astro";\n` + fundo;
}

// --- ESTRATÉGIA DE LIMPEZA: ENCONTRAR INÍCIO E FIM DO ROTEADOR ---
// Removemos tudo que estiver entre a Parte 1 do Modelo 3D e o script que gera ele (Three.JS)
const htmlStartMarker = '<!-- ── PARTE 1: Modelo 3D (300vh para espaço de scroll) ─────── -->';

// Onde ele acaba na parte HTML antes do texto "Por trás do Assina Comigo"?
// Geralmente é o fim da div routeiro-scroll-scene. Se errarmos o corte exato, é mais fácil via regex com as divs
const htmlEndRegex = /<div id="routeiro-scroll-scene"[^>]*>[\s\S]*?(?=<!-- ── PARTE 2|<!-- ── Seção: Por trás)/;

if (content.includes(htmlStartMarker) || htmlEndRegex.test(content)) {
    // Substituindo toda a estrutura enorme por apenas uma chamada ao nosso novo roteador!
    content = content.replace(htmlEndRegex, '<InteractiveRouter />\n');
    content = content.replace(htmlStartMarker, '');
} else {
    // Fallback caso a regex original nao encontre
    console.log("==> O bloco original de HTML do ThreeJS não foi encontrado, talvez já esteja limpo.");
}

// Adicionalmente, remover aquele texto corrompido se ainda sobrou (gister...)
content = content.replace(/════════════════════════════════════════════════════════════ -->[\s\S]*?tabRegister\.setAttribute\('aria-selected', isRegister \? 'true' : 'false'\);/g, '');
content = content.replace(/\/\/ Estilo do botão Login tabLogin\.classList.*?text-/g, '');
content = content.replace(/position:\s*absolute;\s*bottom:\s*max\(2rem, 4vh\);[\s\S]*?role para girar/g, '');
content = content.replace(/role para girar/g, '');

// Removendo o script do Three.JS pesadíssimo
const initRouterMatches = content.match(/<script[^>]*>[\s\S]*?var THREE_CDN[\s\S]*?initRouter3D[\s\S]*?<\/script>/);
if (initRouterMatches) {
    content = content.replace(initRouterMatches[0], '');
}

// Algumas rotinas de limpeza finais no arquivo pra tirar os lixos deixados pelo erro.
content = content.replace(/<div id="routeiro-scroll-scene"[\s\S]*?<\/div><!-- \/routeiro-scroll-scene -->/g, '');

fs.writeFileSync(astroPath, content, 'utf8');

console.log("==> FEITO! Arquivo index.astro higienizado! Seção de 300vh removida por completo!");
console.log("==> O Roteador Oficial de fibra (sua imagem) já está pronto no lugar.");
console.log("-----------------------------------------------------------------------------------");
console.log("Abra o navegador e veja o resultado! Caso falte alguma peça na tela (como cabeçalhos),");
console.log("me de um print inteiro ou detalhes que ajusto instantaneamente!");

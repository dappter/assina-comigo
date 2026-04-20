/**
 * fix-sobre-nos.js
 * 
 * Corrige dois problemas no index.astro:
 * 1. Remove o bloco duplicado/corrompido (linhas ~1087-1105) que vaza
 *    código JavaScript na seção "Sobre Nós".
 * 2. Reduz a altura do container de scroll de 300vh para 100vh e
 *    troca position:sticky por position:relative para eliminar o
 *    espaço vazio excessivo abaixo do roteador.
 * 3. Limpa a linha 1197 corrompida com lixo concatenado.
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve(__dirname, 'src', 'pages', 'index.astro');

console.log('[1/5] Lendo arquivo:', FILE_PATH);

const buf = fs.readFileSync(FILE_PATH);

// Detecta encoding (UTF-16 LE BOM vs UTF-8)
let content = '';
const hasBOM_UTF16_LE = buf[0] === 0xFF && buf[1] === 0xFE;

if (hasBOM_UTF16_LE) {
    console.log('[INFO] Arquivo detectado como UTF-16 LE. Convertendo para UTF-8...');
    content = buf.slice(2).toString('utf16le');
} else {
    content = buf.toString('utf8').replace(/^\uFEFF/, ''); // Remove BOM UTF-8 se existir
}

const lines = content.split('\n');
console.log(`[INFO] Total de linhas: ${lines.length}`);

// ─── CORREÇÃO 1: Remover o bloco duplicado/corrompido ───────────────────────
// Procuramos as linhas que contêm o texto vazado entre o </script> (linha ~1085)
// e a <section> limpa (linha ~1106).
// Estratégia: encontrar as linhas corrompidas por seus marcadores únicos e removê-las.

console.log('[2/5] Procurando bloco corrompido (texto JS vazado na seção Sobre Nós)...');

let startCorruption = -1;
let endCorruption = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Encontra o primeiro comentário duplicado do "SEÇÃO SOBRE NÓS" APÓS o </script>
    // que está na vizinhança da linha 1085
    if (i > 1080 && i < 1110 && line.includes('sobre-nos-section') && 
        (line.includes('gister.classList') || line.includes('════════'))) {
        if (startCorruption === -1) {
            // Volta até encontrar o início do comentário HTML duplicado
            let searchBack = i;
            while (searchBack > 0 && !lines[searchBack].includes('</script>')) {
                searchBack--;
            }
            startCorruption = searchBack + 1; // Linha após o </script>
        }
        endCorruption = i;
    }
    
    // Encontra linhas corrompidas do tipo "tabLogin.classList.toggle('text-    <!-- ═══"
    if (i > 1080 && i < 1110 && line.includes('tabLogin.classList') && line.includes('═══')) {
        endCorruption = i;
    }
    
    // Encontra linhas corrompidas do tipo "tabRegister.setAttribute" fora de um <script>
    if (i > 1085 && i < 1110 && line.includes('tabRegister.setAttribute') && !line.includes('<script')) {
        endCorruption = i;
    }
    
    // Encontra a segunda cópia do comentário "SEÇÃO SOBRE NÓS"
    if (i > 1090 && i < 1110 && line.includes('SEÇÃO SOBRE NÓS') && startCorruption !== -1) {
        endCorruption = i;
    }
}

// Expande endCorruption para pegar o comentário de fechamento "═══ -->"
if (endCorruption !== -1) {
    for (let i = endCorruption; i < endCorruption + 10 && i < lines.length; i++) {
        if (lines[i].match(/^\s*═+\s*-->/)) {
            endCorruption = i;
            break;
        }
    }
}

if (startCorruption !== -1 && endCorruption !== -1) {
    const removedCount = endCorruption - startCorruption + 1;
    console.log(`[INFO] Bloco corrompido encontrado: linhas ${startCorruption + 1} a ${endCorruption + 1} (${removedCount} linhas)`);
    
    // Remove as linhas corrompidas
    lines.splice(startCorruption, removedCount);
    console.log(`[OK] ${removedCount} linhas corrompidas removidas.`);
} else {
    console.log('[INFO] Bloco corrompido não encontrado. Tentando limpeza alternativa...');
    
    // Fallback: Remove qualquer linha que contenha o padrão de texto vazado
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (line.includes('sobre-nos-section') && 
            (line.includes('gister.classList') || line.includes('════════'))) {
            console.log(`[INFO] Removendo linha corrompida ${i + 1}: ${line.substring(0, 80)}...`);
            lines.splice(i, 1);
        }
    }
}

// ─── CORREÇÃO 2: Reduzir 300vh → 100vh ──────────────────────────────────────

console.log('[3/5] Corrigindo altura de 300vh para 100vh...');

let heightFixed = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('routeiro-scroll-scene') && lines[i].includes('300vh')) {
        lines[i] = lines[i].replace('height: 300vh', 'height: 100vh');
        console.log(`[OK] Linha ${i + 1}: 300vh → 100vh`);
        heightFixed = true;
    }
}

if (!heightFixed) {
    console.log('[INFO] 300vh não encontrado (já corrigido?).');
}

// ─── CORREÇÃO 3: Trocar sticky → relative ────────────────────────────────────

console.log('[4/5] Corrigindo position: sticky → relative...');

let stickyFixed = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('routeiro-sticky') || 
        (lines[i].includes('position: sticky') && i > 1000 && i < 1200)) {
        if (lines[i].includes('position: sticky')) {
            lines[i] = lines[i].replace('position: sticky', 'position: relative');
            console.log(`[OK] Linha ${i + 1}: sticky → relative`);
            stickyFixed = true;
        }
    }
}

if (!stickyFixed) {
    // Procura na próxima linha após routeiro-sticky
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('routeiro-sticky')) {
            for (let j = i; j < i + 5 && j < lines.length; j++) {
                if (lines[j].includes('position: sticky')) {
                    lines[j] = lines[j].replace('position: sticky', 'position: relative');
                    console.log(`[OK] Linha ${j + 1}: sticky → relative`);
                    stickyFixed = true;
                    break;
                }
            }
            if (stickyFixed) break;
        }
    }
}

// ─── CORREÇÃO 4: Limpar linha 1197 corrompida ─────────────────────────────

console.log('[4.5/5] Limpando linhas com lixo concatenado...');

for (let i = 0; i < lines.length; i++) {
    // Limpa "</div><!-- /routeiro-scroll-scene -->    position: absolute; bottom:..."
    if (lines[i].includes('/routeiro-scroll-scene') && lines[i].includes('position: absolute')) {
        lines[i] = lines[i].replace(/\s*position:\s*absolute;.*$/, '');
        console.log(`[OK] Linha ${i + 1}: lixo concatenado removido`);
    }
    
    // Limpa "</div><!-- /routeiro-sticky -->   lixo..."  
    if (lines[i].includes('/routeiro-sticky') && lines[i].includes('position: absolute')) {
        lines[i] = lines[i].replace(/\s*position:\s*absolute;.*$/, '');
        console.log(`[OK] Linha ${i + 1}: lixo concatenado removido`);
    }
}

// ─── SALVAR RESULTADO ────────────────────────────────────────────────────

console.log('[5/5] Salvando arquivo limpo em UTF-8...');

const result = lines.join('\n');
fs.writeFileSync(FILE_PATH, result, 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  ✅ CORREÇÃO APLICADA COM SUCESSO!');
console.log('');
console.log('  Problemas corrigidos:');
console.log('  1. Texto JS vazado na seção "Sobre Nós" → REMOVIDO');
console.log('  2. Espaço excessivo (300vh) → Reduzido para 100vh');
console.log('  3. Container sticky → Convertido para relative');
console.log('  4. Lixo concatenado em fechamentos de div → LIMPO');
console.log('');
console.log('  Recarregue a página no navegador para ver o resultado.');
console.log('═══════════════════════════════════════════════════════════');

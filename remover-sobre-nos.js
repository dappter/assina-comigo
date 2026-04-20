/**
 * remover-sobre-nos.js
 * 
 * Remove completamente a seção "Sobre Nós" (modelo 3D do roteador)
 * do index.astro, incluindo HTML, Three.js, CSS e navegação.
 * Adaptado para ES Modules ("type": "module") do projeto Astro.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.resolve(__dirname, 'src', 'pages', 'index.astro');

console.log('[1/6] Lendo arquivo:', FILE_PATH);

const buf = fs.readFileSync(FILE_PATH);

let content = '';
const hasBOM_UTF16_LE = buf[0] === 0xFF && buf[1] === 0xFE;

if (hasBOM_UTF16_LE) {
    console.log('[INFO] Arquivo detectado como UTF-16 LE. Convertendo para UTF-8...');
    content = buf.slice(2).toString('utf16le');
} else {
    content = buf.toString('utf8').replace(/^\uFEFF/, '');
}

const lines = content.split('\n');
console.log(`[INFO] Total de linhas original: ${lines.length}`);

// ─── PASSO 1: Remover a seção HTML "Sobre Nós" (linhas ~1087 até ~1315) ─────
console.log('[2/6] Removendo seção HTML "Sobre Nós" e modelo 3D...');

let sectionStart = -1;
let sectionEnd = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('SEÇÃO SOBRE NÓS') && sectionStart === -1) {
        let start = i;
        while (start > 0 && !lines[start - 1].trim().includes('</script>')) {
            start--;
        }
        sectionStart = start;
        break;
    }
}

for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '</section>' && i > 1300 && i < 1320) {
        sectionEnd = i;
        break;
    }
}

if (sectionStart !== -1 && sectionEnd !== -1) {
    const removedCount = sectionEnd - sectionStart + 1;
    lines.splice(sectionStart, removedCount);
    console.log(`[OK] Removidas ${removedCount} linhas da seção HTML`);
} else {
    console.log('[AVISO] Tentando fallback para HTML...');
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('sobre-nos-section') && !lines[i].trim().startsWith('.') && !lines[i].trim().startsWith('/*')) {
            if (lines[i].includes('<section')) {
                let end = i;
                while (end < lines.length && !lines[end].trim().includes('</section>')) {
                    end++;
                }
                lines.splice(i, end - i + 1);
            }
        }
    }
}

// ─── PASSO 2: Remover o script Three.js (linhas ~1317-1732) ─────────────────
console.log('[3/6] Removendo script Three.js (~400 linhas)...');

let scriptStart = -1;
let scriptEnd = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Three.js') && lines[i].includes('Modelo 3D') && lines[i].includes('Roteador')) {
        let start = i;
        while (start > 0 && !lines[start].trim().startsWith('<!--') && !lines[start].includes('<script')) {
            start--;
        }
        scriptStart = start;
    }
    
    if (lines[i].includes('THREE_CDN') && scriptStart === -1) {
        let start = i;
        while (start > 0 && !lines[start].includes('<script')) {
            start--;
        }
        while (start > 0 && (lines[start - 1].trim().startsWith('<!--') || 
                              lines[start - 1].trim().startsWith('═') ||
                              lines[start - 1].includes('Three.js') ||
                              lines[start - 1].trim() === '')) {
            start--;
        }
        scriptStart = start + 1;
    }
    
    if (lines[i].includes('loadScript(THREE_CDN, initRouter3D)')) {
        let end = i;
        while (end < lines.length && !lines[end].trim().includes('</script>')) {
            end++;
        }
        scriptEnd = end;
    }
}

if (scriptStart !== -1 && scriptEnd !== -1) {
    const removedCount = scriptEnd - scriptStart + 1;
    lines.splice(scriptStart, removedCount);
    console.log(`[OK] Script HTML removido: ${removedCount} linhas`);
}

// ─── PASSO 3: Remover o CSS da seção .sobre-nos-section ─────────────────────
console.log('[4/6] Removendo CSS da .sobre-nos-section...');

let cssStart = -1;
let cssEnd = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Seção Sobre Nós') && lines[i].includes('/*')) {
        cssStart = i;
    }
    if (lines[i].includes('.sobre-nos-section') && lines[i].includes('{') && cssStart === -1) {
        cssStart = i;
    }
}

if (cssStart !== -1) {
    let braceCount = 0;
    let foundFirstBrace = false;
    cssEnd = cssStart;
    
    for (let i = cssStart; i < lines.length; i++) {
        for (const ch of lines[i]) {
            if (ch === '{') { braceCount++; foundFirstBrace = true; }
            if (ch === '}') braceCount--;
        }
        if (foundFirstBrace && braceCount === 0) {
            cssEnd = i;
            break;
        }
    }
    
    let peekEnd = cssEnd + 1;
    while (peekEnd < lines.length && peekEnd < cssEnd + 30) {
        const trimmed = lines[peekEnd].trim();
        if (trimmed === '' || trimmed.startsWith('/*')) {
            peekEnd++;
            continue;
        }
        if (trimmed.includes('sobre-nos') || trimmed.includes('router-hint') || 
            trimmed.includes('router-badge') || trimmed.includes('@keyframes neonPulse')) {
            let bc = 0, fb = false;
            for (let j = peekEnd; j < lines.length; j++) {
                for (const ch of lines[j]) {
                    if (ch === '{') { bc++; fb = true; }
                    if (ch === '}') bc--;
                }
                if (fb && bc === 0) {
                    cssEnd = j;
                    peekEnd = j + 1;
                    break;
                }
            }
        } else {
            break;
        }
    }

    const removedCount = cssEnd - cssStart + 1;
    lines.splice(cssStart, removedCount);
    console.log(`[OK] CSS removido: ${removedCount} linhas`);
}

// ─── PASSO 4: Remover links de navegação para #sobre-nos ────────────────────
console.log('[5/6] Removendo links de navegação para #sobre-nos...');

let navRemoved = 0;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('href="#sobre-nos"') || lines[i].includes("href='#sobre-nos'")) {
        lines.splice(i, 1);
        navRemoved++;
    }
}
console.log(`[OK] ${navRemoved} links de navegação removidos.`);

// ─── PASSO 5: Limpeza final ─────────────────────────────────────────────────
console.log('[6/6] Limpeza final e salvamento...');

function isInsideScript(allLines, index) {
    let inScript = false;
    for (let i = 0; i <= index && i < allLines.length; i++) {
        if (allLines[i].includes('<script')) inScript = true;
        if (allLines[i].includes('</script>')) inScript = false;
    }
    return inScript;
}

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('gister.classList.toggle') && !isInsideScript(lines, i)) {
        lines.splice(i, 1);
    }
    if (line.includes('routeiro-scroll-scene') && (line.includes('position: absolute') || line.includes('═══'))) {
        lines.splice(i, 1);
    }
}

const result = lines.join('\n');
fs.writeFileSync(FILE_PATH, result, 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  ✅ SEÇÃO "SOBRE NÓS" REMOVIDA COM SUCESSO EM MODO ES MODULE!');
console.log('');
console.log('  O que foi removido:');
console.log('  • HTML da seção inteira + Script 3D');
console.log('  • CSS da .sobre-nos-section + Navegação');
console.log('  • Texto JS corrompido');
console.log('');
console.log('  Arquivo salvo em UTF-8. Recarregue o navegador.');
console.log('═══════════════════════════════════════════════════════════════');

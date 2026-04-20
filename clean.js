const fs = require('fs');
const path = require('path');

const astroPath = path.resolve('src/pages/index.astro');
console.log("🛠️ Limpando o arquivo index.astro...");

let content = fs.readFileSync(astroPath, 'utf8');

// 1. Limpa os erros bizarros "gister..." e afins
content = content.replace(/gister\.classList\.toggle\('shadow', isRegister\);\s*/g, '');
content = content.replace(/tabRegister\.classList\.toggle\('text-on-surface-variant', !isRegister\);\s*/g, '');
content = content.replace(/tabRegister\.setAttribute\('aria-selected', isRegister \? 'true' : 'false'\);\s*/g, '');
content = content.replace(/\/\/\s*Estilo do botão Login.*/g, '');
content = content.replace(/tabLogin\.classList\.toggle.*?;/g, '');
content = content.replace(/role para girar/g, '');
content = content.replace(/position:\s*absolute;\s*bottom:\s*max\(2rem, 4vh\);[^>]*>/g, '');

// 2. Remove o espaço longo 300vh e a antiga parte que estica a tela! 
// Vamos cortar da div scroll-scene até o fim estourado
const htmlStart = content.indexOf('<div id="routeiro-scroll-scene"');
if (htmlStart !== -1) {
    const nextSection = content.indexOf('<!-- ── PARTE 2:');
    const alternativeNext = content.indexOf('<section class="relative z-10 py-24 bg-white dark:bg-background-dark">');
    let cutEnd = nextSection !== -1 ? nextSection : alternativeNext;
    
    if (cutEnd !== -1) {
        // Corta tudo que estava consumindo espaço 300vh e troca pelo roteador interativo
        content = content.slice(0, htmlStart) + '\n<InteractiveRouter />\n' + content.slice(cutEnd);
    }
}

// 3. Remove todo o script Three.js gigante 
const scriptStart = content.indexOf('/* ── Router 3D Script ───────────────────────────────── */');
if (scriptStart !== -1) {
    const scriptEnd = content.indexOf('</script>', scriptStart);
    if (scriptEnd !== -1) {
        content = content.slice(0, scriptStart) + content.slice(scriptEnd + 9);
    }
}

// 4. Salva a limpeza
fs.writeFileSync(astroPath, content, 'utf8');

console.log("✅ Limpeza completa! As mensagens estranhas SUMIRAM e o 3D velho foi arrancado. Olhe a página!");

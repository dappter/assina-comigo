const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve('src/pages/index.astro');
console.log('[INFO] Lendo o arquivo: ' + FILE_PATH);
const buf = fs.readFileSync(FILE_PATH);

// Tenta decodificar o conteúdo (verifica se está em UTF-16 LE)
let content = '';
const hasBOM_UTF16_LE = buf[0] === 0xFF && buf[1] === 0xFE;

if (hasBOM_UTF16_LE) {
    content = buf.slice(2).toString('utf16le');
} else {
    content = buf.toString('utf8').replace(/^\uFEFF/, '');
}

// 1. Mudando de 300vh para altura automática
content = content.replace(
    /height:\s*300vh;/g,
    'height: auto;'
);

// 2. Mudando textos de auxílio da tela
content = content.replace(
    /role para girar/g,
    'arraste para girar'
);

// 3. Modificando variáveis de estado
const targetJS = `var targetRotY  = 0;   // rotação alvo (definida pelo scroll)
            var currentRotY = 0;   // rotação atual (lerp)
            var scrollProgress = 0;
            var hintHidden  = false;`;

const replacementJS = `var targetRotY  = 0;   // rotação alvo (definida pelo scroll/drag)
            var currentRotY = 0;   // rotação atual (lerp)
            var scrollProgress = 0;
            var hintHidden  = false;

            // ── Drag controls (mouse + touch) ──────────────────────
            var isDragging    = false;
            var lastDragX    = 0;
            var dragSensitivity = 0.012; // radianos por pixel`;

content = content.replace(targetJS, replacementJS);


// 4. Modificar Listener de Drag
const targetWindowScroll = /window\.addEventListener\('scroll',\s*function\s*\(\)\s*\{/;
const pointerEvents = `            // ── Event listeners de Drag no Canvas ──
            var canvasEl = renderer.domElement;
            canvasEl.addEventListener('pointerdown', function (e) {
                isDragging = true;
                lastDragX  = e.clientX;
                canvasEl.setPointerCapture(e.pointerId);
                if (!hintHidden && hint) {
                    hint.style.opacity = '0';
                    hint.style.transform = 'translateX(-50%) translateY(8px)';
                    hint.style.transition = 'opacity 0.4s, transform 0.4s';
                    hintHidden = true;
                }
            });
            canvasEl.addEventListener('pointermove', function (e) {
                if (!isDragging) return;
                var dx  = e.clientX - lastDragX;
                lastDragX = e.clientX;
                targetRotY += dx * dragSensitivity;
            });
            canvasEl.addEventListener('pointerup', function () { isDragging = false; });
            canvasEl.addEventListener('pointerleave', function () { isDragging = false; });
            canvasEl.addEventListener('pointercancel', function () { isDragging = false; });
            canvasEl.style.cursor = 'grab';
            canvasEl.addEventListener('pointerdown', function () { canvasEl.style.cursor = 'grabbing'; });
            canvasEl.addEventListener('pointerup',   function () { canvasEl.style.cursor = 'grab'; });

            window.addEventListener('scroll', function () {`;

content = content.replace(targetWindowScroll, pointerEvents);

// 5. Inativando rotação baseada em scroll, mas mantendo barras
const targetScrollEvent = `                // Mapeia progresso → rotação YAW (0 → 2π = 1 volta completa)
                targetRotY = scrollProgress * Math.PI * 2;`;

const replacementScrollEvent = `                // Rotacao removida; Progresso manipulado individualmente pelo arrasto`;
content = content.replace(targetScrollEvent, replacementScrollEvent);

// Retornando arquivo a um padrão limpo de arquivo texto
fs.writeFileSync(FILE_PATH, content, 'utf8');

console.log('[SUCESSO] O arquivo index.astro foi corrigido para comportar Touch/Drag e salvo limpo em formato UTF-8 sem BOM.');

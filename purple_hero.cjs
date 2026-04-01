const fs = require('fs');

const files = [
  './src/pages/index.astro',
  './src/pages/ref/[slug].astro'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Make the Navbar purple or transparent and text white
    content = content.replace(/class="fixed top-0 w-full z-50 glass-nav transition-all duration-300"/g, 'class="fixed top-0 w-full z-50 bg-primary/95 backdrop-blur-md transition-all duration-300 shadow-xl border-b border-white/10"');
    
    // In Navbar: replace text-slate-900 italic with text-white italic
    content = content.replace(/text-slate-900 italic/g, 'text-white italic');
    // In Navbar menus (index.astro): text-on-surface-variant -> text-white
    content = content.replace(/class="hidden md:flex items-center space-x-10 font-label font-bold text-sm tracking-wide text-on-surface-variant"/g, 'class="hidden md:flex items-center space-x-10 font-label font-bold text-sm tracking-wide text-white/90"');
    // "Já sou parceiro" link
    content = content.replace(/text-on-surface-variant hover:text-slate-900 font-label/g, 'text-white/80 hover:text-white font-label');

    // 2. Make the Header (Hero) Purple
    content = content.replace(/<header class="relative pt-16 md:pt-40 pb-24 overflow-hidden border-b border-slate-900\/5">/g, '<header class="relative pt-16 md:pt-40 pb-24 overflow-hidden bg-primary text-white">');
    content = content.replace(/<header class="relative pt-16 md:pt-40 pb-24 overflow-hidden border-b border-black\/5">/g, '<header class="relative pt-16 md:pt-40 pb-24 overflow-hidden bg-primary text-white">');
    
    // Convert Hero texts back to white
    // Find h1:
    content = content.replace(/<h1 class="([^"]+)text-slate-900([^"]*)">/g, '<h1 class="$1text-white$2">');
    // Find Hero paragraph
    content = content.replace(/<p class="text-xl text-on-surface-variant mb-12/g, '<p class="text-xl text-white/90 mb-12');
    
    // In the hero card (Speed / WiFi 6):
    content = content.replace(/bg-surface-container-lowest p-8 rounded-3xl ambient-shadow border border-slate-900\/5/g, 'bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20');
    content = content.replace(/bg-surface-container-lowest p-8 rounded-3xl ambient-shadow border border-black\/5/g, 'bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20');
    
    // Inside Hero card text
    content = content.replace(/text-slate-900 text-xs uppercase/g, 'text-white/80 text-xs uppercase');
    content = content.replace(/text-on-surface-variant font-label/g, 'text-white/80 font-label'); // be careful, might hit non-hero
    content = content.replace(/<h3 class="text-5xl font-headline font-black text-slate-900">/g, '<h3 class="text-5xl font-headline font-black text-white">');
    content = content.replace(/<span class="text-xl text-on-surface-variant">/g, '<span class="text-xl text-white/80">');
    content = content.replace(/bg-surface-container-high rounded-2xl/g, 'bg-white/20 rounded-2xl');
    content = content.replace(/bg-surface-container rounded-2xl/g, 'bg-white/10 rounded-2xl');
    content = content.replace(/<p class="font-bold text-slate-900 text-sm">/g, '<p class="font-bold text-white text-sm">');
    content = content.replace(/<p class="text-xs text-on-surface-variant">/g, '<p class="text-xs text-white/70">');
    
    // Conectado badge
    content = content.replace(/bg-surface-container-high p-5 rounded-2xl ambient-shadow border border-slate-900\/5/g, 'bg-white p-5 rounded-2xl shadow-xl shadow-black/20 border-none');
    content = content.replace(/bg-surface-container-high p-5 rounded-2xl ambient-shadow border border-black\/5/g, 'bg-white p-5 rounded-2xl shadow-xl shadow-black/20 border-none');
    
    // Conectado text inside badge
    content = content.replace(/<p class="font-headline font-bold text-slate-900 text-sm">Conectado!<\/p>/g, '<p class="font-headline font-bold text-slate-900 text-sm">Conectado!</p>'); // it's white bg now, so slate-900 is good

    // Small texts in Hero
    content = content.replace(/<p class="text-xs text-white\/70">Vizinho ativou/g, '<p class="text-xs text-slate-500">Vizinho ativou');

    // Clientes conectados
    content = content.replace(/text-sm text-white\/80 font-label/g, 'text-sm text-white/80 font-label');
    
    // Also the CTA section at the bottom (Quer faturar dinheiro vivo) in ref/[slug].astro
    content = content.replace(/<section class="py-12 relative bg-primary-container\/10 border-t border-primary-container\/20">/g, '<section class="py-16 relative bg-primary border-t-0">');
    content = content.replace(/<h3 class="text-3xl font-headline font-black text-slate-900 mb-4">/g, '<h3 class="text-3xl font-headline font-black text-white mb-4">');
    content = content.replace(/<p class="text-lg text-white\/80 mb-8/g, '<p class="text-lg text-white/90 mb-8'); 
    
    // Restore text-xs text-on-surface-variant inside connected badge
    content = content.replace(/<p class="text-xs text-white\/80">Vizinho ativou/g, '<p class="text-xs text-slate-500">Vizinho ativou');
    
    // The main badge "Convite de / Oferta exclusiva" in the hero
    // bg-primary-container/20 border border-primary-container/30 text-primary-fixed
    content = content.replace(/<div class="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary-container\/20 border border-primary-container\/30 text-primary-fixed/g, '<div class="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-tertiary text-on-tertiary border-none');
    // For index: text-primary-dim -> text-slate-900 (already fixed)
    
    // Glass icons in hero
    content = content.replace(/bg-primary-container\/20 rounded-full flex items-center justify-center text-primary-fixed/g, 'bg-white/20 rounded-full flex items-center justify-center text-white');

    // Background shapes in Hero should be yellow to contrast with purple
    content = content.replace(/bg-primary-container\/20 rounded-full/g, 'bg-tertiary/20 rounded-full');
    content = content.replace(/bg-tertiary\/10 rounded-full blur-\[120px\]/g, 'bg-white/10 rounded-full blur-[120px]');

    // Fix the form section below the hero
    // Keep it light! Do nothing because background F1F1F1 is already in body.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file} to have Purple Hero`);
  }
}

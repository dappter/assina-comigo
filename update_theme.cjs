const fs = require('fs');

const files = [
  './src/pages/index.astro',
  './src/pages/ref/[slug].astro'
];

const tailwindConfigLight = `        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        background: "#F1F1F1",
                        error: "#BA1A1A",
                        "error-container": "#FFDAD6",
                        "inverse-on-surface": "#F1F1F1",
                        "inverse-primary": "#C8BFFF",
                        "inverse-surface": "#313033",
                        "on-background": "#1C1B1E",
                        "on-error": "#FFFFFF",
                        "on-error-container": "#410002",
                        "on-primary": "#FFFFFF",
                        "on-primary-container": "#1E0061",
                        "on-primary-fixed": "#1E0061",
                        "on-primary-fixed-variant": "#4300B7",
                        "on-secondary": "#402D00",
                        "on-secondary-container": "#251A00",
                        "on-secondary-fixed": "#251A00",
                        "on-secondary-fixed-variant": "#402D00",
                        "on-surface": "#1C1B1E",
                        "on-surface-variant": "#49454E",
                        "on-tertiary": "#402D00",
                        "on-tertiary-container": "#251A00",
                        "on-tertiary-fixed": "#251A00",
                        "on-tertiary-fixed-variant": "#402D00",
                        outline: "#7A757F",
                        "outline-variant": "#CABEFF",
                        primary: "#6028FF",
                        "primary-container": "#E6DEFF",
                        "primary-fixed": "#E6DEFF",
                        "primary-fixed-dim": "#C8BFFF",
                        secondary: "#FFBF1A",
                        "secondary-container": "#FFECAE",
                        "secondary-fixed": "#FFECAE",
                        "secondary-fixed-dim": "#FFBF1A",
                        surface: "#F1F1F1",
                        "surface-bright": "#F1F1F1",
                        "surface-container": "#FFFFFF",
                        "surface-container-high": "#E5E5E5",
                        "surface-container-highest": "#DFDFDF",
                        "surface-container-low": "#F1F1F1",
                        "surface-container-lowest": "#FFFFFF",
                        "surface-dim": "#D8D8D8",
                        "surface-tint": "#6028FF",
                        "surface-variant": "#E0E0E0",
                        tertiary: "#FFBF1A",
                        "tertiary-container": "#FFECAE",
                        "tertiary-fixed": "#FFECAE",
                        "tertiary-fixed-dim": "#FFBF1A"
                    },`;

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the tailwind config block
    const configStart = content.indexOf('tailwind.config = {');
    const colorsEnd = content.indexOf('fontFamily: {');
    
    if (configStart !== -1 && colorsEnd !== -1) {
      content = content.substring(0, configStart) + tailwindConfigLight + '\n                    ' + content.substring(colorsEnd);
    }

    // Convert Dark theme specifics to Light Theme specifics
    content = content.replace(/class="scroll-smooth dark"/g, 'class="scroll-smooth"');
    
    // Convert hardcoded whites to sensible dark colors for text
    content = content.replace(/text-white/g, 'text-slate-900');
    // Convert hardcoded glows/shadows
    content = content.replace(/shadow-white\/([0-9]+)/g, 'shadow-black/$1');
    content = content.replace(/border-white\/([0-9\.]+)/g, 'border-slate-900/$1');
    content = content.replace(/bg-white\/\[([0-9\.]+)\]/g, 'bg-slate-900/[$1]');
    content = content.replace(/bg-white\/([0-9]+)/g, 'bg-slate-900/$1');
    
    // Navbar text and specific elements
    content = content.replace(/text-white italic/g, 'text-slate-900 italic');
    
    // Changing glows
    content = content.replace(/rgba\(242, 192, 37, 0\.4\)/g, 'rgba(96, 40, 255, 0.4)');
    content = content.replace(/rgba\(242, 192, 37, 0\.2\)/g, 'rgba(96, 40, 255, 0.2)');
    content = content.replace(/rgba\(242, 192, 37, 0\.6\)/g, 'rgba(96, 40, 255, 0.6)');
    
    // Navbar glass in light mode
    content = content.replace(/rgba\(18, 18, 29, 0\.7\)/g, 'rgba(255, 255, 255, 0.8)');
    content = content.replace(/rgba\(73, 68, 85, 0\.15\)/g, 'rgba(0, 0, 0, 0.1)');
    
    // Restore button text that got squashed to slate-900 but must be white (e.g. text-on-tertiary on Yellow button = #402D00 is fine, text-on-primary on primary button = white is fine, but in index.astro some buttons use text-white which became text-slate-900. Wait, text-on-tertiary is already explicitly requested for buttons).
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found ${file}`);
  }
}

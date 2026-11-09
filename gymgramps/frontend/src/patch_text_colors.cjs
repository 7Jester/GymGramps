const fs = require('fs');
const path = require('path');

function replaceFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace standard inline styles color property
    content = content.replace(/color:\s*(['"]?)var\(--bg\)(['"]?)/g, 'color: $1var(--brand-on)$2');

    // Replace specific variables in Liga.jsx
    content = content.replace(/numInk:\s*first\s*\?\s*'var\(--ink\)'\s*:\s*'var\(--bg\)'/g, "numInk: first ? 'var(--ink)' : 'var(--brand-on)'");
    content = content.replace(/avatarInk:\s*first\s*\?\s*'var\(--ink\)'\s*:\s*'var\(--bg\)'/g, "avatarInk: first ? 'var(--ink)' : 'var(--brand-on)'");
    content = content.replace(/'Duelo':\s*\['var\(--ink-soft\)',\s*'var\(--bg\)'\]/g, "'Duelo': ['var(--ink-soft)', 'var(--brand-on)']");

    // Replace in Treino.jsx for active tab color
    content = content.replace(/color:\s*active\s*\?\s*"var\(--bg\)"\s*:\s*"var\(--ink\)"/g, 'color: active ? "var(--brand-on)" : "var(--ink)"');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Patched text colors in " + filePath);
}

replaceFile(path.join(__dirname, 'components', 'Liga.jsx'));
replaceFile(path.join(__dirname, 'pages', 'Treino.jsx'));
replaceFile(path.join(__dirname, 'pages', 'Alimentacao.jsx')); // Just in case

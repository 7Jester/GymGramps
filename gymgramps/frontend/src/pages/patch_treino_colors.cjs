const fs = require('fs');
let text = fs.readFileSync('Treino.jsx', 'utf-8');

const mapping = {
    '#EFEBE1': 'var(--bg)',
    '#F7F4EC': 'var(--surface)',
    '#FDFBF5': 'var(--surface-2)',
    '#DCD6C8': 'var(--line)',
    '#E4DFD2': 'var(--line-soft)',
    '#C9C5B5': 'var(--line-faint)',
    '#16180F': 'var(--ink)',
    '#2A2C20': 'var(--ink-2)',
    '#5A5D50': 'var(--ink-soft)',
    '#8A8B7C': 'var(--ink-muted)',
    '#B4B2A2': 'var(--ink-faint)',
    '#22381F': 'var(--brand)',
    '#6E8B2E': 'var(--accent)',
    '#C9E86B': 'var(--lime)',
    'rgba(239,235,225,0.62)': 'var(--brand-on-soft)',
    'rgba(22,24,15,0.55)': 'rgba(0, 0, 0, 0.55)' // ink with opacity... better use standard rgba
};

// Also 'var(--brand-on)' is #EFEBE1. 
// When using #22381F (brand) as background, the color #EFEBE1 on it should actually be var(--brand-on) but var(--bg) usually resolves to the same hex in light mode. Let's see if --brand-on is better for text on --brand.
// In dark mode: --brand is #2A4526, --brand-on is #EDEAE0. --bg is #12140F.
// So if the background is #22381F (var(--brand)), the text should be var(--brand-on).

Object.keys(mapping).forEach(hex => {
    // case insensitive replacement globally
    const regex = new RegExp(hex, 'gi');
    text = text.replace(regex, mapping[hex]);
});

// Let's refine var(--bg) when it is used as color: var(--bg). It should probably be var(--brand-on) if it replaces #EFEBE1.
// Let's just fix it automatically: color: "var(--bg)" -> color: "var(--brand-on)"
text = text.replace(/color:\s*["']var\(--bg\)["']/g, 'color: "var(--brand-on)"');

// Also backgroundColor: var(--bg) -> maybe leave it.
// "#FFFDF8" wasn't mapped. Let's map it to var(--surface-2) or var(--surface).
text = text.replace(/#FFFDF8/gi, 'var(--surface)');

fs.writeFileSync('Treino.jsx', text, 'utf-8');
console.log('patched Treino colors');

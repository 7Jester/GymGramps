const fs = require('fs');
const path = require('path');

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
    'rgba(239,235,225,0.08)': 'color-mix(in srgb, var(--ink) 8%, transparent)',
    'rgba(239,235,225,0.18)': 'color-mix(in srgb, var(--ink) 18%, transparent)',
    'rgba(239,235,225,0.12)': 'color-mix(in srgb, var(--ink) 12%, transparent)',
    '#A8422A': 'var(--danger)',
    '#E7E9D6': 'var(--chip)',
    '#F4EDDD': 'var(--note-bg)',
    '#E5D9BF': 'var(--note-line)',
    '#8A7A5E': 'var(--note-ink)',
    '#C08A76': 'var(--danger)' // Closest
};

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (let f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            processDir(full);
        } else if (full.endsWith('.jsx')) {
            let content = fs.readFileSync(full, 'utf-8');
            let modified = content;

            Object.keys(mapping).forEach(hex => {
                // To avoid replacing parts of strings incorrectly, we can use a basic global replace
                // But we must escape regex special chars
                const escapedHex = hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedHex, 'gi');
                modified = modified.replace(regex, mapping[hex]);
            });

            if (modified !== content) {
                fs.writeFileSync(full, modified, 'utf-8');
                console.log('Patched: ' + full);
            }
        }
    }
}

// process src/pages and src/components
processDir(path.join(__dirname, 'components'));
processDir(path.join(__dirname, 'pages'));

const fs = require('fs');

let content = fs.readFileSync('src/pages/Alimentacao.jsx', 'utf8');

// 1. Add state for editandoSugestao
content = content.replace(
    'const [tipoSelecionado, setTipoSelecionado] = useState(TIPOS_REFEICAO[0]);',
    'const [tipoSelecionado, setTipoSelecionado] = useState(TIPOS_REFEICAO[0]);\n    const [editandoSugestao, setEditandoSugestao] = useState(null);'
);

// 2. Add setEditandoSugestao(null) to handleAddRegistro
content = content.replace(
    'setMostrandoForm(false);\n        setMostrandoForm(false);\n        setMostrandoForm(false);\n        setItensRefeicao([]);',
    'setMostrandoForm(false);\n        setEditandoSugestao(null);\n        setItensRefeicao([]);'
);

content = content.replace(
    'setMostrandoForm(false);\r\n        setMostrandoForm(false);\r\n        setMostrandoForm(false);\r\n        setItensRefeicao([]);',
    'setMostrandoForm(false);\n        setEditandoSugestao(null);\n        setItensRefeicao([]);'
);

fs.writeFileSync('src/pages/Alimentacao.jsx', content);

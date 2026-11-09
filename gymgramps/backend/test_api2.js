import fs from 'fs';
fetch('http://localhost:3000/api/onboarding/gerar-plano-final', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        perfil: { objetivo: 'perda_gordura' },
        rotina: [],
        frequencia: 3,
        local: 'Academia',
        restricoes: ''
    })
}).then(r => r.json()).then(data => {
    fs.writeFileSync('test_output.json', JSON.stringify(data, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

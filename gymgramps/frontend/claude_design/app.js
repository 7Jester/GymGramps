/* ============ DADOS ============ */
const MEALS = [
  {time:'07:00',name:'Café da manhã',kcal:650,desc:'4 ovos mexidos, 50g de aveia em flocos, 1 banana grande, 200ml de leite desnatado'},
  {time:'10:00',name:'Lanche da manhã',kcal:400,desc:'30g de whey protein, 1 maçã, 30g de pasta de amendoim'},
  {time:'13:00',name:'Almoço',kcal:750,desc:'250g de arroz branco cozido, 100g de feijão carioca, 150g de peito de frango grelhado, 10ml de azeite extra virgem'},
  {time:'15:30',name:'Lanche da tarde / pré-faculdade',kcal:350,desc:'2 fatias de pão de forma integral, 100g de frango desfiado, 30g de requeijão light'},
  {time:'19:30',name:'Jantar / pausa da faculdade',kcal:550,desc:'200g de arroz branco cozido, 150g de carne moída (patinho), vegetais cozidos (brócolis e cenoura)'},
  {time:'22:45',name:'Ceia',kcal:300,desc:'200g de iogurte natural desnatado, 30g de castanha-de-caju, 15g de mel'}
];
const EXERCISES = [
  {n:'01',name:'RDL (Romanian Deadlift)',sets:'4×6–8'},
  {n:'02',name:'Agachamento búlgaro',sets:'3×10–12'},
  {n:'03',name:'Mesa flexora',sets:'4×10–12'},
  {n:'04',name:'Elevação pélvica com barra',sets:'4×8–10'},
  {n:'05',name:'Gêmeos sentado (panturrilha)',sets:'4×12–15'},
  {n:'06',name:'Abdominal infra na barra fixa',sets:'3×12–15'}
];

/* ============ RENDER ============ */
document.getElementById('meals-home').innerHTML = MEALS.map(m => `
  <div class="row row-meal">
    <div class="time">${m.time}</div>
    <div><div class="title">${m.name}</div><div class="sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.desc}</div></div>
    <div class="kcal">${m.kcal} kcal</div>
    <div class="chev">→</div>
  </div>`).join('');

document.getElementById('meals-diet').innerHTML = MEALS.map(m => `
  <div class="row row-meal-log">
    <div class="time">${m.time}</div>
    <div><div class="title">${m.name}</div><div class="sub">${m.desc}</div></div>
    <div class="kcal">${m.kcal} kcal</div>
    <button class="pill" style="justify-self:end">Registrar</button>
  </div>`).join('');

document.getElementById('exercises').innerHTML = EXERCISES.map(e => `
  <div class="row row-ex">
    <div class="mono" style="font-size:12px;color:var(--ink-faint)">${e.n}</div>
    <div class="title" style="font-size:16px">${e.name}</div>
    <div class="reps">${e.sets}</div>
  </div>`).join('');

/* ============ NAVEGAÇÃO ============ */
document.getElementById('nav').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]'); if (!b) return;
  document.querySelectorAll('#nav button').forEach(x => x.removeAttribute('aria-current'));
  b.setAttribute('aria-current','page');
  document.querySelectorAll('.screen').forEach(s => s.hidden = s.id !== b.dataset.tab);
  window.scrollTo(0,0);
});

/* ============ TEMA ============ */
const root = document.documentElement;
const saved = localStorage.getItem('gg-theme');
if (saved) setTheme(saved);
function setTheme(t){
  root.dataset.theme = t;
  localStorage.setItem('gg-theme', t);
  document.getElementById('theme').textContent = t === 'dark' ? '☀' : '☾';
  document.getElementById('switch-theme').setAttribute('aria-checked', t === 'dark');
}
setTheme(root.dataset.theme);
document.getElementById('theme').onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
document.getElementById('switch-theme').onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
document.querySelectorAll('.switch:not(#switch-theme)').forEach(s => s.onclick = () =>
  s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true'));

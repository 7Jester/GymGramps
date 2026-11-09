# GymGramps — marca "Ciclo" · pacote de handoff

O símbolo é um **G desenhado como anel aberto atravessado pela barra**: monograma e equipamento na mesma forma. Geometria pura, sem degradê, legível a partir de 15 px.

---

## 1. Especificação

**Grade:** `viewBox="0 0 64 64"`. Anel: centro 32,32 · raio 20 · traço 7 · ponta arredondada · abertura de 40° à direita. Barra: y = 32, de x = 30 a x = 55, mesmo traço e mesma ponta.

**Cores**

| Papel | Hex | Uso |
|---|---|---|
| Musgo | `#22381F` | fundo do tile |
| Papel | `#EFEBE1` | anel sobre musgo |
| Lima | `#C9E86B` | barra (o acento) |
| Tinta | `#16180F` | versão monocromática sobre claro |

**Regras**

- Área de respiro: 25% da altura do símbolo em todos os lados (16 unidades da grade de 64).
- Tamanho mínimo: 15 px de altura para o símbolo solto, 24 px para o tile.
- No tile arredondado, o símbolo é reduzido a 72% e centralizado — `rx` do tile = 28% do lado.
- Monocromia: anel e barra na mesma cor. Nunca aplique a lima sobre papel claro (contraste insuficiente).
- Não fazer: girar, inclinar, adicionar sombra ou contorno, alterar a espessura do traço, fechar o anel.

---

## 2. Arquivos

Na pasta `brand/`:

- `gymgramps-mark.svg` — símbolo monocromático em `currentColor` (herda a cor do texto)
- `gymgramps-mark-tile.svg` — tile musgo com anel papel e barra lima (favicon e app icon)
- `gymgramps-lockup.svg` — lockup horizontal com o wordmark

---

## 3. Código

### Símbolo — inline, herda a cor do contexto

```html
<svg viewBox="0 0 64 64" width="24" height="24" role="img" aria-label="GymGramps">
  <path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
  <path d="M30 32H55" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
</svg>
```

### Tile bicolor — header, app icon, favicon

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="GymGramps">
  <title>GymGramps</title>
  <rect width="64" height="64" rx="18" fill="#22381F"/>
  <g transform="translate(32 32) scale(.72) translate(-32 -32)">
    <path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="#EFEBE1" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 32H55" fill="none" stroke="#C9E86B" stroke-width="7" stroke-linecap="round"/>
  </g>
</svg>
```

### Lockup completo

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 64" width="260" height="64" role="img" aria-label="GymGramps">
  <title>GymGramps</title>
  <rect width="64" height="64" rx="18" fill="#22381F"/>
  <g transform="translate(32 32) scale(.72) translate(-32 -32)">
    <path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="#EFEBE1" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 32H55" fill="none" stroke="#C9E86B" stroke-width="7" stroke-linecap="round"/>
  </g>
  <text x="80" y="42" font-family="Bricolage Grotesque, sans-serif" font-size="30" font-weight="800" letter-spacing="-1" fill="#16180F">GymGramps</text>
</svg>
```

> No lockup em SVG o wordmark usa Bricolage Grotesque como texto vivo. Se o SVG for servido fora do site (e-mail, app store, parceiro), converta o texto em contorno antes de exportar.

---

## 4. Integração no site (já aplicada)

### `index.html` — favicon no `<head>`

```html
<link rel="icon" type="image/svg+xml" href="brand/gymgramps-mark-tile.svg" />
```

### `index.html` — header

```html
<div class="logo"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path class="brand-mark-bar" d="M30 32H55" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg></span><span class="word">GymGramps</span></div>
```

### `index.html` — rodapé

```html
<div class="foot-logo"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path class="brand-mark-bar" d="M30 32H55" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg></span><span class="word">GymGramps</span></div>
```

### `styles.css` — substitui as regras antigas de `.mark`

```css
.logo .brand-mark{width:30px;height:30px;border-radius:9px;background:var(--brand);color:var(--brand-on);display:grid;place-items:center;padding:0;border:0}
.logo .brand-mark svg{width:22px;height:22px;display:block}
.logo .brand-mark .bar{stroke:var(--lime)}

.foot-logo .brand-mark{width:28px;height:28px;border-radius:8px;background:var(--brand);color:var(--brand-on);display:grid;place-items:center;padding:0;border:0}
.foot-logo .brand-mark svg{width:20px;height:20px;display:block}
.foot-logo .brand-mark .bar{stroke:var(--lime)}
```

A classe `.brand-mark-bar` no segundo path é o que permite colorir a barra em lima enquanto o anel herda `currentColor` — troque só `color` no container para adaptar o símbolo a qualquer fundo.

---

> **Atenção a colisões de classe:** os nomes `brand-mark` e `brand-mark-bar` são propositalmente específicos. Não use `.mark` nem `.bar` — ambos já existem no projeto (lista de marcos do Pro e container do header) e sobrescrevem `padding` e `display` do símbolo.

---

## 5. Texto para enviar ao Antigravity

Copie a partir daqui:

---

O GymGramps agora tem marca própria: um símbolo geométrico em SVG que substitui o antigo quadrado com as letras "GG". É um **G desenhado como anel aberto atravessado por uma barra** — monograma e barra de treino na mesma forma. Grade `viewBox="0 0 64 64"`, anel de raio 20 e traço 7 com ponta arredondada e abertura de 40° à direita, barra horizontal em y = 32 de x = 30 a x = 55.

Paleta: fundo musgo `#22381F`, anel papel `#EFEBE1`, barra lima `#C9E86B`, versão monocromática em tinta `#16180F`. A versão solta usa `currentColor` no anel e uma classe `.brand-mark-bar` no segundo path, para que o símbolo herde a cor do contexto e só a barra receba o acento.

Vou colar os três arquivos SVG (`gymgramps-mark.svg`, `gymgramps-mark-tile.svg`, `gymgramps-lockup.svg`) e os trechos de HTML e CSS. Quero que você:

- crie a pasta `brand/` com os três arquivos e substitua o antigo bloco `<div class="brand-mark">GG</div>` pelo símbolo inline no header e no rodapé, aplicando o CSS correspondente;
- registre o favicon apontando para `brand/gymgramps-mark-tile.svg` e gere também um PNG 512×512 e um `apple-touch-icon` 180×180 a partir do tile, com o mesmo enquadramento (símbolo a 72% do tile);
- aplique a mesma marca na tela de login (`login.html`) e em qualquer outro ponto que ainda use as letras "GG";
- verifique o contraste do símbolo nos temas claro e escuro e garanta que a barra lima nunca apareça sobre fundo claro;
- adicione `role="img"` e `aria-label="GymGramps"` em cada instância inline do SVG, e mantenha o wordmark como texto real no HTML — não converta o nome em imagem;
- não altere o restante do layout, os tokens de cor ou qualquer outra seção.

---

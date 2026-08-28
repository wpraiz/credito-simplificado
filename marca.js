/* Identidade visual do Crédito Simplificado.
 *
 * O símbolo é um cartão que também é um visto: a diagonal do "check" nasce do
 * canto do cartão. A promessa do produto é "você vai ser aprovado neste?" — o
 * símbolo responde isso antes de qualquer texto.
 *
 * Tudo SVG: escala sem borrar, herda cor, e não custa requisição. */

export const LOGO = ({ tam = 44, fundo = true } = {}) => `
<svg viewBox="0 0 48 48" width="${tam}" height="${tam}" role="img" aria-label="Crédito Simplificado">
  ${fundo ? `<rect width="48" height="48" rx="13" fill="url(#lg-bg)"/>` : ''}
  <defs>
    <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect x="9" y="14" width="30" height="20" rx="4" fill="none" stroke="#fff" stroke-width="2.6" opacity=".95"/>
  <path d="M9 21h30" stroke="#fff" stroke-width="2.6" opacity=".95"/>
  <path d="m17 27.5 4.2 4.2L33 20" fill="none" stroke="#fff" stroke-width="3.4"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

/** Marca completa com o nome ao lado — para topos e a capa. */
export const LOGOTIPO = ({ tam = 40 } = {}) => `
<span class="logotipo">
  ${LOGO({ tam })}
  <span class="lt-txt"><b>Crédito</b><i>Simplificado</i></span>
</span>`

/* --------------------------------------------------------------- cartão */

const BANDEIRAS = {
  Visa: `<svg class="band" viewBox="0 0 48 16" aria-hidden="true">
    <text x="0" y="13" font-family="ui-sans-serif,system-ui" font-size="14"
      font-style="italic" font-weight="700" fill="#fff" opacity=".95">VISA</text></svg>`,
  Mastercard: `<svg class="band" viewBox="0 0 40 24" aria-hidden="true">
    <circle cx="15" cy="12" r="10" fill="#eb001b" opacity=".9"/>
    <circle cx="25" cy="12" r="10" fill="#f79e1b" opacity=".9"/>
    <path d="M20 4.5a10 10 0 0 0 0 15 10 10 0 0 0 0-15" fill="#ff5f00" opacity=".95"/></svg>`,
}

/**
 * Desenha um cartão de crédito com chip, contactless e brilho diagonal.
 * `tam`: 'p' (lista) · 'm' (carrossel) · 'g' (detalhe, com nome e bandeira).
 */
export function cartao(c, tam = 'p') {
  const chip = `
    <span class="chip-emv" aria-hidden="true">
      <svg viewBox="0 0 30 22">
        <rect width="30" height="22" rx="4" fill="#e3c46a"/>
        <rect width="30" height="11" rx="4" fill="#f2dd93" opacity=".55"/>
        <g stroke="#00000038" stroke-width="1" fill="none">
          <path d="M0 7h9M0 15h9M21 7h9M21 15h9M9 0v22M21 0v22"/>
          <rect x="9" y="5" width="12" height="12" rx="2"/>
        </g>
      </svg>
    </span>`

  const onda = `
    <span class="onda" aria-hidden="true">
      <svg viewBox="0 0 16 20" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" opacity=".75">
        <path d="M3 6a8 8 0 0 1 0 8M7.5 3.5a13 13 0 0 1 0 13M12 1a18 18 0 0 1 0 18"/>
      </svg>
    </span>`

  const corpo = tam === 'g' ? `
    ${chip}${onda}
    <span class="numero" aria-hidden="true">•••• •••• •••• ${1000 + (c.nome.length * 137) % 9000}</span>
    <span class="rodape">
      <span class="pn">${c.nome}</span>
      ${BANDEIRAS[c.bandeira] || ''}
    </span>` : tam === 'm' ? chip : ''

  return `<span class="plastico ${tam}" style="--c:${c.cor};--c2:${clarear(c.cor, 34)}">
    <span class="brilho" aria-hidden="true"></span>${corpo}</span>`
}

/** Clareia um hex para gerar o segundo ponto do gradiente do cartão. */
function clarear(hex, n) {
  const v = parseInt(hex.slice(1), 16)
  const f = (d) => Math.min(255, ((v >> d) & 255) + n).toString(16).padStart(2, '0')
  return `#${f(16)}${f(8)}${f(0)}`
}

/* Três cartões em leque, para a capa. Puro CSS em cima do mesmo componente. */
export const LEQUE = (cartoes) => `
  <span class="leque" aria-hidden="true">
    ${cartoes.slice(0, 3).map((c, i) => `<span class="lq lq${i}">${cartao(c, 'm')}</span>`).join('')}
  </span>`

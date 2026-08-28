/* Crédito Simplificado — app da Evaloriza.
 *
 * Funil: onboarding → quiz → análise → score (celebrado) → captura →
 * notificação → app com abas.
 *
 * A ordem não é acidental. Captura e permissão de notificação vêm DEPOIS do
 * resultado, nunca antes: pedir dado antes de entregar valor é o que faz o
 * usuário abandonar. O teardown dos concorrentes mostrou o padrão oposto
 * (gate de anúncio antes do resultado) — aqui a aposta é a inversa.
 *
 * Sem build, sem backend. Tudo no localStorage do aparelho. */

import { CARTOES, PERGUNTAS, calculaScore, recomenda, faixaDe, fmt, APROVACAO_ROTULO } from './dados.js'
import { ic } from './icones.js'
import { LOGO, LOGOTIPO, cartao, LEQUE } from './marca.js'

const $ = (s) => document.querySelector(s)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const num = (n) => n.toLocaleString('pt-BR')
const dec = (n) => String(n).replace('.', ',')
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

const CHAVE = 'cs.v2'
let est = JSON.parse(localStorage.getItem(CHAVE) || 'null') || { perfil: null, conta: null, notif: null }
let score = est.perfil ? calculaScore(est.perfil) : null
let iPergunta = 0, respostas = {}, filtro = 'todos', selecao = [], voltarDe = 'cartoes'

const salva = () => localStorage.setItem(CHAVE, JSON.stringify(est))
const TABS = ['home', 'cartoes', 'comparar', 'menu']

/* ------------------------------------------------------------ navegação */
function vai(tela) {
  const pinta = () => {
    document.querySelectorAll('.tela').forEach((t) => t.classList.toggle('ativa', t.id === 't-' + tela))
    $('#tabbar').hidden = !TABS.includes(tela)
    document.querySelectorAll('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tela))
    const c = $('#t-' + tela + ' .corpo')
    if (c) c.scrollTop = 0
    if (location.hash !== '#' + tela) history.pushState({ tela }, '', '#' + tela)
  }
  if (!suave || !document.startViewTransition) return pinta()
  document.startViewTransition(pinta)
}

function abreTab(t) {
  ({ home: desenhaHome, cartoes: desenhaLista, comparar: desenhaComparar, menu: desenhaMenu })[t]?.()
  vai(t)
}

window.addEventListener('popstate', (e) => {
  const t = e.state?.tela || location.hash.slice(1) || 'intro'
  if (TABS.includes(t)) abreTab(t)
  else document.querySelectorAll('.tela').forEach((x) => x.classList.toggle('ativa', x.id === 't-' + t))
})

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]')
  if (t) return abreTab(t.dataset.tab)
  if (e.target.closest('[data-ir=quiz]')) iniciaQuiz()
})

let tToast
function toast(msg, icone = 'check') {
  const t = $('#toast')
  t.innerHTML = ic(icone) + `<span>${esc(msg)}</span>`
  t.hidden = false
  t.classList.remove('saindo')
  clearTimeout(tToast)
  tToast = setTimeout(() => {
    t.classList.add('saindo')
    setTimeout(() => { t.hidden = true; t.classList.remove('saindo') }, suave ? 190 : 0)
  }, 2600)
}

/* ---------------------------------------------------------- onboarding */
const SLIDES = [
  {
    titulo: 'Descubra sua chance antes de pedir',
    texto: 'Pedir cartão e levar não é só frustrante: cada análise fica registrada. Veja onde você tem chance real primeiro.',
    palco: () => LEQUE(CARTOES.filter((c) => ['zenit-livre', 'nivel-black', 'atlas-pontos'].includes(c.id))),
  },
  {
    titulo: 'Um score que explica de onde veio',
    texto: 'Nada de número mágico. Mostramos os cinco fatores e quanto cada um pesou no seu resultado.',
    palco: () => iluMedidor(),
  },
  {
    titulo: 'As pegadinhas, não só os benefícios',
    texto: 'Todo comparador lista vantagem. A gente também lista o que costuma incomodar em cada cartão — é o que você precisa saber antes de assinar.',
    palco: () => iluLista(),
  },
]
let iSlide = 0

const iluMedidor = () => `
<svg class="ilu-medidor" viewBox="0 0 200 138" role="img" aria-label="Medidor de score">
  <path d="M22 112a78 78 0 0 1 156 0" fill="none" stroke="#e7eff5" stroke-width="17" stroke-linecap="round"/>
  <path d="M22 112a78 78 0 0 1 156 0" fill="none" stroke="url(#gm)" stroke-width="17" stroke-linecap="round"
        stroke-dasharray="245" stroke-dashoffset="70">
    <animate attributeName="stroke-dashoffset" from="245" to="70" dur="1.3s" fill="freeze"
             calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </path>
  <defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#dc2626"/><stop offset=".5" stop-color="#d97706"/>
    <stop offset="1" stop-color="#16a34a"/></linearGradient></defs>
  <circle cx="163" cy="74" r="10" fill="#fff" stroke="#0369a1" stroke-width="4">
    <animateTransform attributeName="transform" type="rotate" from="-150 100 112" to="0 100 112"
      dur="1.3s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </circle>
  <text x="100" y="104" text-anchor="middle" font-size="34" font-weight="700" fill="#0c4a6e"
        font-family="IBM Plex Sans">820</text>
  <text x="100" y="124" text-anchor="middle" font-size="12" fill="#475569" font-family="IBM Plex Sans">de 1000</text>
</svg>`

const iluLista = () => `
<svg class="ilu-lista" viewBox="0 0 230 150" role="img" aria-label="Benefícios e pegadinhas">
  ${[0, 1, 2].map((i) => `
    <g class="linha" transform="translate(0 ${i * 52})">
      <rect x="4" y="4" width="222" height="42" rx="11" fill="#fff" stroke="#bae6fd"/>
      <circle cx="28" cy="25" r="11" fill="${i === 2 ? '#fef2f2' : '#ecfdf5'}"/>
      ${i === 2
        ? `<path d="M28 20v6M28 30h.01" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/>`
        : `<path d="m23 25 3.5 3.5L33 22" fill="none" stroke="#16a34a" stroke-width="2.6"
             stroke-linecap="round" stroke-linejoin="round"/>`}
      <rect x="48" y="17" width="${[120, 96, 138][i]}" height="7" rx="3.5" fill="#0c4a6e" opacity=".8"/>
      <rect x="48" y="30" width="${[78, 128, 92][i]}" height="6" rx="3" fill="#475569" opacity=".35"/>
    </g>`).join('')}
</svg>`

function desenhaSlide() {
  const s = SLIDES[iSlide]
  const palco = $('#ob-palco')
  palco.innerHTML = s.palco()
  palco.classList.remove('anim'); void palco.offsetWidth; palco.classList.add('anim')
  $('#ob-titulo').textContent = s.titulo
  $('#ob-texto').textContent = s.texto
  $('#ob-pontos').innerHTML = SLIDES.map((_, i) => `<i class="${i === iSlide ? 'on' : ''}"></i>`).join('')
  $('#ob-btn').textContent = iSlide === SLIDES.length - 1 ? 'Descobrir minha chance' : 'Continuar'
  $('#ob-btn').classList.toggle('pulsa', iSlide === SLIDES.length - 1)
  // reinicia a animação de entrada do texto
  for (const el of [$('#ob-titulo'), $('#ob-texto')]) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '' }
}

$('#ob-btn').addEventListener('click', () => {
  if (iSlide < SLIDES.length - 1) { iSlide++; desenhaSlide() } else iniciaQuiz()
})
$('#ob-pular').addEventListener('click', iniciaQuiz)

/* ----------------------------------------------------------------- quiz */
function iniciaQuiz() {
  iPergunta = 0; respostas = {}
  desenhaPergunta(); vai('quiz')
}

function desenhaPergunta() {
  const p = PERGUNTAS[iPergunta]
  const pct = Math.round(iPergunta / PERGUNTAS.length * 100)
  $('#q-barra').style.width = pct + '%'
  $('#q-prog').setAttribute('aria-valuenow', pct)
  $('#q-passo').textContent = `${iPergunta + 1} de ${PERGUNTAS.length}`
  $('#q-corpo').innerHTML = `
    <h3 class="pergunta">${esc(p.titulo)}</h3>
    <p class="ajuda">${esc(p.ajuda)}</p>
    <div class="opcoes">
      ${p.opcoes.map((o, i) => `<button class="opcao${respostas[p.id] === o.v ? ' marcada' : ''}" data-i="${i}">
        <span>${esc(o.r)}</span>${ic('check')}</button>`).join('')}
    </div>`
  $('#q-corpo').querySelectorAll('.opcao').forEach((b) => b.addEventListener('click', () => {
    respostas[p.id] = p.opcoes[+b.dataset.i].v
    $('#q-corpo').querySelectorAll('.opcao').forEach((x) => x.classList.remove('marcada'))
    b.classList.add('marcada')
    if (navigator.vibrate) navigator.vibrate(8)
    setTimeout(avanca, suave ? 220 : 0)
  }))
}

function avanca() {
  if (iPergunta < PERGUNTAS.length - 1) { iPergunta++; return desenhaPergunta() }
  $('#q-barra').style.width = '100%'
  est.perfil = { ...respostas }
  salva()
  score = calculaScore(est.perfil)
  rodaAnalise()
}

$('#q-voltar').addEventListener('click', () => {
  if (iPergunta === 0) return est.perfil ? abreTab('home') : vai('intro')
  iPergunta--; desenhaPergunta()
})

/* ------------------------------------------------------------- análise */
const ETAPAS = [
  'Lendo suas respostas',
  'Comparando com 10 cartões',
  'Calculando os cinco fatores',
  'Montando sua recomendação',
]

async function rodaAnalise() {
  $('#an-etapas').innerHTML = ETAPAS.map((e) =>
    `<li><span class="bola">${ic('check')}</span><span>${esc(e)}</span></li>`).join('')
  $('#an-pct').textContent = '0%'
  vai('analise')

  const lis = $('#an-etapas').querySelectorAll('li')
  const passo = suave ? 520 : 40
  for (let i = 0; i < lis.length; i++) {
    await espera(passo)
    lis[i].classList.add('ok')
    if (navigator.vibrate) navigator.vibrate(5)
    $('#an-pct').textContent = Math.round((i + 1) / lis.length * 100) + '%'
  }
  await espera(suave ? 420 : 40)
  desenhaScore({ celebrar: true })
  vai('score')
}

/* ---------------------------------------------------------------- score */
function desenhaScore({ celebrar = false } = {}) {
  const f = faixaDe(score.pontos)
  const primeiraVez = celebrar
  $('#s-topo').style.display = primeiraVez ? 'none' : ''

  $('#s-corpo').innerHTML = `
    <div class="medidor">
      <div class="num" id="s-num" style="color:${f.cor}">0</div>
      <div class="de">de 1000</div>
      <div class="faixa" style="background:${f.cor}1a;color:${f.corTexto}">${esc(f.nome)}</div>
    </div>
    <div class="trilha"><i class="marcador" id="s-marc" style="left:0%"></i></div>
    <div class="escala"><span>0</span><span>400</span><span>600</span><span>800</span><span>1000</span></div>
    <div class="nota">${esc(f.texto)}</div>

    <div class="rotulo">Como chegamos nesse número</div>
    ${score.detalhe.map((d) => `
      <div class="fator">
        <div class="l1"><span>${esc(d.rotulo)}</span><span class="peso">${d.obtido} de ${d.peso}</span></div>
        <div class="barra"><i data-w="${d.obtido / d.peso * 100}"></i></div>
      </div>`).join('')}

    <div class="nota" style="margin-top:16px">
      Score de <b>orientação</b>, calculado com o que você declarou. Não é consulta
      a birô, não usa seu CPF e não afeta seu histórico. Cada emissor faz a própria
      análise — o resultado lá pode ser diferente.
    </div>

    <div class="acoes">
      <button class="btn grande" id="s-continuar">${primeiraVez ? 'Ver meus cartões' : 'Ir para os cartões'}</button>
      <button class="btn texto" data-ir="quiz">Refazer o questionário</button>
    </div>`

  $('#s-continuar').addEventListener('click', () => {
    if (primeiraVez && !est.conta) return abreCaptura()
    if (primeiraVez && est.notif === null) return abreNotif()
    abreTab('cartoes')
  })

  const anima = celebrar && suave
  requestAnimationFrame(() => {
    if (!anima) $('#s-marc').style.transition = 'none'
    $('#s-marc').style.left = score.pontos / 10 + '%'
    $('#s-corpo').querySelectorAll('.fator .barra i').forEach((el, i) => {
      if (!anima) el.style.transition = 'none'
      setTimeout(() => { el.style.width = el.dataset.w + '%' }, anima ? 260 + i * 90 : 0)
    })
  })

  contaAte($('#s-num'), score.pontos, anima ? 1300 : 0)
  if (celebrar && suave && score.pontos >= 400) setTimeout(() => confete(), 700)
}

/** Conta de 0 até o valor com desaceleração — a revelação é o momento do app. */
function contaAte(el, alvo, dur) {
  if (!dur) { el.textContent = alvo; return }
  const t0 = performance.now()
  const passo = (t) => {
    const p = Math.min(1, (t - t0) / dur)
    el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)))
    if (p < 1) requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)
}

function confete() {
  const cv = $('#confete')
  const r = cv.parentElement.getBoundingClientRect()
  cv.width = r.width; cv.height = r.height
  const ctx = cv.getContext('2d')
  const cores = ['#0ea5e9', '#16a34a', '#f59e0b', '#0369a1', '#22d3ee']
  const ps = Array.from({ length: 90 }, () => ({
    x: r.width / 2 + (Math.random() - .5) * 120, y: r.height * .32,
    vx: (Math.random() - .5) * 9, vy: -Math.random() * 11 - 4,
    g: .28 + Math.random() * .12, cor: cores[(Math.random() * cores.length) | 0],
    l: 5 + Math.random() * 6, a: Math.random() * 6.3, va: (Math.random() - .5) * .3, vida: 1,
  }))
  let quadro = 0
  const anima = () => {
    ctx.clearRect(0, 0, cv.width, cv.height)
    let vivos = 0
    for (const p of ps) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .995; p.a += p.va
      if (quadro > 60) p.vida -= .016
      if (p.vida <= 0 || p.y > r.height + 30) continue
      vivos++
      ctx.save()
      ctx.translate(p.x, p.y); ctx.rotate(p.a)
      ctx.globalAlpha = Math.max(0, p.vida)
      ctx.fillStyle = p.cor
      ctx.fillRect(-p.l / 2, -p.l / 4, p.l, p.l / 2)
      ctx.restore()
    }
    quadro++
    if (vivos) requestAnimationFrame(anima)
    else ctx.clearRect(0, 0, cv.width, cv.height)
  }
  anima()
}

/* -------------------------------------------------------------- captura */
function abreCaptura() {
  $('#cap-ilu').innerHTML = `
    <svg viewBox="0 0 200 110" width="190" role="img" aria-label="Resultado salvo">
      <rect x="26" y="14" width="148" height="84" rx="14" fill="#fff" stroke="#bae6fd" stroke-width="2"/>
      <rect x="44" y="34" width="70" height="8" rx="4" fill="#0c4a6e" opacity=".75"/>
      <rect x="44" y="50" width="104" height="7" rx="3.5" fill="#475569" opacity=".3"/>
      <rect x="44" y="64" width="84" height="7" rx="3.5" fill="#475569" opacity=".3"/>
      <circle cx="150" cy="82" r="20" fill="#16a34a"/>
      <path d="m141 82 6 6 12-13" fill="none" stroke="#fff" stroke-width="3.4"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  vai('captura')
}

$('#cap-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const nome = $('#cap-nome').value.trim()
  const email = $('#cap-email').value.trim()
  const erro = $('#cap-erro')
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)

  $('#cap-nome').classList.toggle('ruim', !nome)
  $('#cap-email').classList.toggle('ruim', !emailOk)
  $('#cap-email').setAttribute('aria-invalid', String(!emailOk))
  if (!nome) { $('#cap-nome').focus(); return }
  if (!emailOk) {
    erro.textContent = 'Confira o e-mail — parece faltar alguma coisa.'
    erro.hidden = false
    $('#cap-email').focus()
    return
  }
  erro.hidden = true
  // Demonstração: fica no aparelho. Em produção, aqui vai o POST para o backend.
  est.conta = { nome, email }
  salva()
  toast(`Pronto, ${nome.split(' ')[0]}! Resultado salvo.`)
  est.notif === null ? abreNotif() : abreTab('home')
})

$('#cap-pular').addEventListener('click', () => {
  est.conta = { pulou: true }
  salva()
  est.notif === null ? abreNotif() : abreTab('cartoes')
})

/* ---------------------------------------------------------- notificação */
function abreNotif() {
  const melhor = recomenda(est.perfil, score)[0]
  $('#notif-demo').innerHTML = `
    <div class="notif-card">
      <span class="ap">${LOGO({ tam: 34 })}</span>
      <div style="flex:1">
        <b>Crédito Simplificado</b>
        <p>Boa notícia: o ${esc(melhor.nome)} baixou a renda mínima. Sua chance subiu para ${Math.min(97, melhor.match + 9)}%.</p>
      </div>
      <span class="qd">agora</span>
    </div>`
  $('#notif-lista').innerHTML = [
    'Quando um cartão da sua lista ficar mais fácil de conseguir',
    'Quando surgir um cartão novo com mais chance para você',
    'No máximo um aviso por semana — e você desliga quando quiser',
  ].map((t) => `<li>${ic('check')}<span>${esc(t)}</span></li>`).join('')
  vai('notif')
}

$('#notif-sim').addEventListener('click', async () => {
  est.notif = 'sim'; salva()
  // Em produção: Notification.requestPermission() + registro do token de push.
  // Na demo o navegador não é incomodado.
  toast('Combinado! Avisamos quando valer a pena.', 'sino')
  await espera(400)
  abreTab('home')
})
$('#notif-nao').addEventListener('click', () => {
  est.notif = 'nao'; salva()
  abreTab('home')
})

/* ----------------------------------------------------------------- home */
const corMatch = (m) => m >= 70 ? 'var(--acento)' : m >= 45 ? 'var(--alerta)' : 'var(--perigo)'
// texto pequeno precisa de 4,5:1 — as cores vivas só passam em área preenchida
const corTexto = (m) => m >= 70 ? '#15803d' : m >= 45 ? '#9a3412' : '#b91c1c'

function desenhaHome() {
  const rec = est.perfil ? recomenda(est.perfil, score) : []
  const f = score ? faixaDe(score.pontos) : null
  const nome = est.conta?.nome?.split(' ')[0]
  const hora = new Date().getHours()
  const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  $('#h-marca').innerHTML = LOGOTIPO({ tam: 32 })
  $('#h-avatar').textContent = nome ? nome[0].toUpperCase() : '?'

  const topo = score ? `
    <button class="card-score" data-abrir-score>
      <div class="cs-topo"><span>Sua chance de aprovação</span><span class="faixa-chip">${esc(f.nome)}</span></div>
      <div class="cs-num">${score.pontos}<small> / 1000</small></div>
      <div class="cs-trilha"><i style="left:${score.pontos / 10}%"></i></div>
      <div class="cs-esc"><span>0</span><span>500</span><span>1000</span></div>
    </button>` : `
    <button class="card-score vazio" data-ir="quiz">
      <div class="cs-topo"><span>Ainda não calculado</span>${ic('seta')}</div>
      <div style="font-size:18px;font-weight:600;margin:10px 0 4px">Descubra sua chance</div>
      <div style="font-size:13.5px;color:var(--mudo-fg)">Seis perguntas, cerca de 40 segundos.</div>
    </button>`

  const destaques = (rec.length ? rec : CARTOES).slice(0, 6).map((c) => `
    <button class="destaque" data-cartao="${c.id}">
      ${cartao(c, 'm')}
      <div class="dq-nome">${esc(c.nome)}</div>
      <div class="dq-sub">${c.anuidade === 0 ? 'Sem anuidade' : fmt(c.anuidade)}</div>
      ${c.match != null ? `
        <div class="dq-barra"><i data-w="${c.match}" style="background:${corMatch(c.match)}"></i></div>
        <div class="dq-pct"><span>sua chance</span><b style="color:${corTexto(c.match)}">${c.match}%</b></div>` : ''}
    </button>`).join('')

  $('#h-corpo').innerHTML = `
    <div class="saudacao">${saud}${nome ? ', ' + esc(nome) : ''}</div>
    <p class="sub">${score ? 'Aqui está o resumo do seu perfil hoje.' : 'Vamos descobrir onde você tem chance real.'}</p>
    ${topo}

    ${est.notif === 'sim' ? '' : `
      <button class="atalho" id="h-notif">
        <div class="ico">${ic('sino')}</div>
        <div class="txt"><b>Receber avisos</b><small>Quando um cartão ficar mais fácil pra você</small></div>
        <span class="selo">novo</span>
      </button>`}

    <div class="secao"><h3>${score ? 'Melhores para você' : 'Cartões em destaque'}</h3></div>
    <p class="secao-sub">${score ? 'Ordenados pela sua chance estimada.' : 'Responda o questionário para ver sua chance em cada um.'}</p>
    <div class="carrossel">${destaques}</div>

    <div class="secao"><h3>Ferramentas</h3></div>
    <div class="grade-acoes">
      <button class="acao" data-tab="comparar"><div class="ico">${ic('comparar')}</div><b>Comparar</b><small>Dois cartões lado a lado</small></button>
      <button class="acao" data-filtro="sem-anuidade"><div class="ico">${ic('moeda')}</div><b>Sem anuidade</b><small>Custo zero por ano</small></button>
      <button class="acao" data-filtro="aprovacao"><div class="ico">${ic('checkCirculo')}</div><b>Aprovação fácil</b><small>Menos exigência</small></button>
      <button class="acao" data-abrir-score><div class="ico">${ic('medidor')}</div><b>Meu score</b><small>Como foi calculado</small></button>
    </div>`

  ligaAtalhos($('#h-corpo'))
  $('#h-notif')?.addEventListener('click', abreNotif)
  requestAnimationFrame(() => $('#h-corpo').querySelectorAll('.dq-barra i').forEach((el, i) =>
    setTimeout(() => { el.style.width = el.dataset.w + '%' }, 120 + i * 70)))
}

function ligaAtalhos(raiz) {
  raiz.querySelectorAll('[data-cartao]').forEach((el) =>
    el.addEventListener('click', () => { voltarDe = 'home'; abreCartao(el.dataset.cartao) }))
  raiz.querySelectorAll('[data-filtro]').forEach((el) =>
    el.addEventListener('click', () => { filtro = el.dataset.filtro; desenhaLista(); vai('cartoes') }))
  raiz.querySelectorAll('[data-abrir-score]').forEach((el) =>
    el.addEventListener('click', () => score ? (desenhaScore(), vai('score')) : iniciaQuiz()))
}

/* --------------------------------------------------------------- lista */
const FILTROS = [
  { id: 'todos', r: 'Todos' }, { id: 'aprovacao', r: 'Aprovação fácil' },
  { id: 'cashback', r: 'Cashback' }, { id: 'pontos', r: 'Pontos' },
  { id: 'viagem', r: 'Viagem' }, { id: 'premium', r: 'Premium' },
  { id: 'sem-anuidade', r: 'Sem anuidade' },
]

function desenhaLista() {
  $('#l-filtros').innerHTML = FILTROS.map((f) =>
    `<button class="chip${filtro === f.id ? ' on' : ''}" data-f="${f.id}">${esc(f.r)}</button>`).join('')
  $('#l-filtros').querySelectorAll('.chip').forEach((c) =>
    c.addEventListener('click', () => { filtro = c.dataset.f; desenhaLista() }))

  let itens = est.perfil ? recomenda(est.perfil, score) : CARTOES.map((c) => ({ ...c, match: null, porques: [] }))
  if (filtro === 'sem-anuidade') itens = itens.filter((c) => c.anuidade === 0)
  else if (filtro !== 'todos') itens = itens.filter((c) => c.categoria === filtro)

  $('#l-cont').textContent = `${itens.length} ${itens.length === 1 ? 'cartão' : 'cartões'}`
  if (!itens.length) return ($('#l-corpo').innerHTML = '<div class="vazio">Nenhum cartão com esse filtro.</div>')

  $('#l-corpo').innerHTML = itens.map((c, i) => `
    <div class="cartao" data-id="${c.id}" role="button" tabindex="0" style="animation-delay:${i * 45}ms">
      ${cartao(c, 'p')}
      <div class="info">
        <div class="nome">${esc(c.nome)}</div>
        <div class="emissor">${esc(c.emissor)} · ★ ${dec(c.nota)}</div>
        <div class="tags">
          <span class="tag${c.anuidade === 0 ? ' bom' : ''}">${c.anuidade === 0 ? 'Sem anuidade' : fmt(c.anuidade)}</span>
          ${c.cashback ? `<span class="tag bom">${dec(c.cashback)}% cashback</span>` : ''}
          ${c.salaVip ? '<span class="tag bom">Sala VIP</span>' : ''}
        </div>
      </div>
      ${c.match != null ? `<div class="match"><div class="pct" style="color:${corTexto(c.match)}">${c.match}%</div><div class="lbl">chance</div></div>` : ''}
      <button class="marcar${selecao.includes(c.id) ? ' on' : ''}" data-marcar="${c.id}"
        aria-label="Selecionar ${esc(c.nome)} para comparar">${ic(selecao.includes(c.id) ? 'checkCirculo' : 'circulo')}</button>
    </div>`).join('')

  $('#l-corpo').querySelectorAll('.cartao').forEach((el) => el.addEventListener('click', (e) => {
    if (e.target.closest('[data-marcar]')) return
    voltarDe = 'cartoes'; abreCartao(el.dataset.id)
  }))
  $('#l-corpo').querySelectorAll('[data-marcar]').forEach((m) =>
    m.addEventListener('click', () => alternaSelecao(m.dataset.marcar)))
}

function alternaSelecao(id) {
  const i = selecao.indexOf(id)
  if (i >= 0) selecao.splice(i, 1)
  else if (selecao.length >= 2) { selecao.shift(); selecao.push(id) }
  else selecao.push(id)
  if (navigator.vibrate) navigator.vibrate(8)
  if (selecao.length === 2) toast('Dois escolhidos — toque em Comparar', 'comparar')
  desenhaLista()
}

/* ------------------------------------------------------------- detalhe */
function abreCartao(id) {
  const c = (est.perfil ? recomenda(est.perfil, score) : CARTOES).find((x) => x.id === id)
  $('#c-titulo').textContent = c.nome
  $('#c-corpo').innerHTML = `
    ${cartao(c, 'g')}
    ${c.match != null ? `
      <div class="nota" style="display:flex;align-items:center;gap:14px">
        <div style="font-size:30px;font-weight:700;color:${corMatch(c.match)};line-height:1">${c.match}%</div>
        <div style="font-size:13.5px">de chance para o seu perfil.<br>
          <span style="color:var(--mudo-fg)">Estimativa nossa, não decisão do emissor.</span></div>
      </div>
      <div class="porques">${c.porques.map((p) => `<div class="porque">${ic('seta')}<span>${esc(p)}</span></div>`).join('')}</div>` : ''}

    <div class="grade">
      <div class="cel"><div class="k">Anuidade</div><div class="v">${c.anuidade === 0 ? 'Grátis' : 'R$ ' + num(c.anuidade)}</div></div>
      <div class="cel"><div class="k">Renda mín.</div><div class="v">${c.rendaMinima ? 'R$ ' + num(c.rendaMinima) : 'Livre'}</div></div>
      <div class="cel"><div class="k">Aprovação</div><div class="v">${APROVACAO_ROTULO[c.aprovacao]}</div></div>
      <div class="cel"><div class="k">Cashback</div><div class="v">${c.cashback ? dec(c.cashback) + '%' : '—'}</div></div>
      <div class="cel"><div class="k">Pontos</div><div class="v">${c.pontosPorDolar ? dec(c.pontosPorDolar) : '—'}</div></div>
      <div class="cel"><div class="k">Sala VIP</div><div class="v">${c.salaVip ? 'Sim' : 'Não'}</div></div>
    </div>

    <p style="font-size:15px">${esc(c.resumo)}</p>
    <div class="bloco bom"><h4>${ic('checkCirculo')}O que ele entrega</h4>
      <ul>${c.beneficios.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>
    <div class="bloco risco"><h4>${ic('alerta')}O que costuma incomodar</h4>
      <ul>${c.pegadinhas.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>

    <div class="acoes">
      <button class="btn acento grande" id="c-ir">${ic('saida')}Ir para o site do emissor</button>
      <button class="btn secundario" id="c-comparar" style="margin-top:9px">
        ${selecao.includes(c.id) ? 'Remover da comparação' : 'Adicionar à comparação'}</button>
    </div>`

  $('#c-ir').addEventListener('click', () =>
    toast('Demonstração — cartões são fictícios', 'alerta'))
  $('#c-comparar').addEventListener('click', () => { alternaSelecao(c.id); desenhaComparar(); abreTab('comparar') })
  vai('cartao')
}
$('#c-voltar').addEventListener('click', () => abreTab(voltarDe))

/* ------------------------------------------------------------ comparar */
function desenhaComparar() {
  const base = est.perfil ? recomenda(est.perfil, score) : CARTOES
  const sel = selecao.map((id) => base.find((c) => c.id === id)).filter(Boolean)

  const slot = (c) => c ? `
    <div class="slot cheio">
      <button class="troca" data-tab="cartoes" aria-label="Trocar ${esc(c.nome)}">
        ${cartao(c, 'p')}<span class="nome">${esc(c.nome)}</span>
      </button>
      <button class="tirar" data-tirar="${c.id}">remover</button>
    </div>` : `
    <button class="slot" data-tab="cartoes">
      <span class="mais">${ic('mais', { classe: 'ic g' })}</span>
      <small>Escolher cartão</small>
    </button>`

  let html = `<div class="slots">${slot(sel[0])}${slot(sel[1])}</div>`

  if (sel.length < 2) {
    html += `<div class="vazio">Escolha dois cartões na aba <b>Cartões</b>, tocando no círculo à direita de cada um.</div>`
  } else {
    const [a, b] = sel
    const linhas = [
      ['Anuidade', (c) => c.anuidade === 0 ? 'Grátis' : 'R$ ' + num(c.anuidade), (x, y) => x.anuidade < y.anuidade],
      ['Renda mínima', (c) => c.rendaMinima ? 'R$ ' + num(c.rendaMinima) : 'Livre', (x, y) => x.rendaMinima < y.rendaMinima],
      ['Aprovação', (c) => APROVACAO_ROTULO[c.aprovacao], () => false],
      ['Cashback', (c) => c.cashback ? dec(c.cashback) + '%' : 'Não tem', (x, y) => x.cashback > y.cashback],
      ['Pontos por US$', (c) => c.pontosPorDolar ? dec(c.pontosPorDolar) : 'Não tem', (x, y) => x.pontosPorDolar > y.pontosPorDolar],
      ['Sala VIP', (c) => c.salaVip ? 'Sim' : 'Não', (x, y) => x.salaVip && !y.salaVip],
      ['Avaliação', (c) => '★ ' + dec(c.nota), (x, y) => x.nota > y.nota],
    ]
    if (a.match != null) linhas.unshift(['Sua chance', (c) => c.match + '%', (x, y) => x.match > y.match])

    html += `<table class="tabela"><caption class="sr">Comparação entre dois cartões</caption><tbody>
      ${linhas.map(([rot, val, vence]) => `<tr>
        <th>${esc(rot)}</th>
        <td class="${vence(a, b) ? 'vence' : ''}">${vence(a, b) ? ic('check') : ''}${esc(val(a))}</td>
        <td class="${vence(b, a) ? 'vence' : ''}">${vence(b, a) ? ic('check') : ''}${esc(val(b))}</td>
      </tr>`).join('')}
    </tbody></table>
    <div class="nota" style="margin-top:16px">O verde marca quem leva vantagem quando a
      comparação é objetiva. "Melhor" depende do seu uso: cashback alto não compensa
      anuidade se você gasta pouco.</div>`
  }

  $('#p-corpo').innerHTML = html
  $('#p-corpo').querySelectorAll('[data-tirar]').forEach((el) => el.addEventListener('click', (e) => {
    e.stopPropagation(); alternaSelecao(el.dataset.tirar); desenhaComparar()
  }))
}

/* ---------------------------------------------------------------- menu */
function desenhaMenu() {
  const c = est.conta
  $('#m-corpo').innerHTML = `
    <div class="rotulo">Meu perfil</div>
    ${c?.nome ? `<div class="item-menu" style="cursor:default">
      <div class="ico">${ic('usuario')}</div>
      <div class="txt"><b>${esc(c.nome)}</b><small>${esc(c.email)}</small></div>
    </div>` : `<button class="item-menu" id="m-criar">
      <div class="ico">${ic('usuario')}</div>
      <div class="txt"><b>Salvar meu resultado</b><small>Para não perder quando trocar de aparelho</small></div>
      <div class="seta">${ic('seta')}</div></button>`}

    <button class="item-menu" data-ir="quiz">
      <div class="ico">${ic('refazer')}</div>
      <div class="txt"><b>${est.perfil ? 'Refazer questionário' : 'Responder questionário'}</b>
        <small>${est.perfil ? 'Mudou de renda ou objetivo?' : 'Leva cerca de 40 segundos'}</small></div>
      <div class="seta">${ic('seta')}</div></button>

    ${score ? `<button class="item-menu" data-abrir-score>
      <div class="ico">${ic('medidor')}</div>
      <div class="txt"><b>Meu score</b><small>${score.pontos} de 1000 · ${esc(faixaDe(score.pontos).nome)}</small></div>
      <div class="seta">${ic('seta')}</div></button>` : ''}

    <button class="item-menu" id="m-notif">
      <div class="ico">${ic('sino')}</div>
      <div class="txt"><b>Avisos</b><small>${est.notif === 'sim' ? 'Ativados' : 'Desativados'}</small></div>
      <div class="seta">${ic('seta')}</div></button>

    <div class="rotulo">Categorias</div>
    ${FILTROS.filter((f) => f.id !== 'todos').map((f) => `
      <button class="item-menu" data-filtro="${f.id}">
        <div class="ico">${ic('etiqueta')}</div><div class="txt"><b>${esc(f.r)}</b></div>
        <div class="seta">${ic('seta')}</div></button>`).join('')}

    <div class="rotulo">Sobre</div>
    <div class="nota">
      <b>Crédito Simplificado</b> é um produto da Evaloriza. Não somos banco nem
      emissor: comparamos cartões e estimamos sua chance de aprovação.<br><br>
      Suas respostas <b>não saem do seu aparelho</b>. Não pedimos CPF, não
      consultamos birô e não criamos conta de verdade.<br><br>
      <span style="color:var(--mudo-fg);font-size:13px">Demonstração — cartões,
      emissores e condições são fictícios.</span>
    </div>
    ${est.perfil ? `<button class="btn secundario" id="m-apagar" style="margin-top:8px">
      ${ic('x')}Apagar meus dados deste aparelho</button>` : ''}`

  ligaAtalhos($('#m-corpo'))
  $('#m-criar')?.addEventListener('click', abreCaptura)
  $('#m-notif')?.addEventListener('click', abreNotif)
  $('#m-apagar')?.addEventListener('click', () => {
    if (!confirm('Apagar suas respostas, score e conta deste aparelho?')) return
    localStorage.removeItem(CHAVE)
    est = { perfil: null, conta: null, notif: null }
    score = null; selecao = []
    iSlide = 0; desenhaSlide()
    vai('intro')
  })
}

/* ---------------------------------------------------------------- tabs */
$('#tabbar').innerHTML = [
  ['home', 'casa', 'Início'], ['cartoes', 'cartao', 'Cartões'],
  ['comparar', 'comparar', 'Comparar'], ['menu', 'menu', 'Menu'],
].map(([t, i, r]) => `<button data-tab="${t}">${ic(i, { classe: 'ic g' })}<span>${r}</span></button>`).join('')

document.querySelectorAll('.voltar:empty').forEach((b) => { b.innerHTML = ic('voltar') })

/* A elevação do topo é consequência do scroll, não decoração fixa: sem isso
 * a sombra fica pairando sobre nada quando a lista está no início. */
document.querySelectorAll('.corpo').forEach((c) => {
  const pai = c.parentElement
  const barra = pai.querySelector('.filtros') || pai.querySelector('.topo, .topo-app')
  if (!barra) return
  c.addEventListener('scroll', () => barra.classList.toggle('rolado', c.scrollTop > 4), { passive: true })
})

/* ----------------------------------------------------------------- boot */
const inicial = location.hash.slice(1)
if (est.perfil) {
  abreTab(TABS.includes(inicial) ? inicial : 'home')
} else {
  desenhaSlide()
  history.replaceState({ tela: 'intro' }, '', '#intro')
  $('#tabbar').hidden = true
}

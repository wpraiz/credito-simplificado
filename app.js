/* Crédito Simplificado — app da Evaloriza (demo navegável).
 *
 * Estrutura de navegação inspirada no padrão do setor: onboarding por quiz,
 * home com card de score no topo, tab bar de quatro itens. Identidade, copy e
 * regras de score são próprias.
 *
 * Sem build, sem framework, sem backend. As respostas ficam no localStorage do
 * aparelho — nada é enviado. */

import {
  CARTOES, PERGUNTAS, calculaScore, recomenda, faixaDe, fmt, APROVACAO_ROTULO,
} from './dados.js'
import { ic } from './icones.js'

const $ = (s) => document.querySelector(s)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const num = (n) => n.toLocaleString('pt-BR')
const dec = (n) => String(n).replace('.', ',')

const CHAVE = 'cs.perfil.v1'
let perfil = JSON.parse(localStorage.getItem(CHAVE) || 'null')
let score = perfil ? calculaScore(perfil) : null
let iPergunta = 0, respostas = {}
let filtro = 'todos'
let selecao = []
let voltarDe = 'cartoes'

const TABS = ['home', 'cartoes', 'comparar', 'menu']

/* ------------------------------------------------------------ navegação */
function vai(tela) {
  document.querySelectorAll('.tela').forEach((t) => t.classList.toggle('ativa', t.id === 't-' + tela))
  const ehTab = TABS.includes(tela)
  $('#tabbar').hidden = !ehTab
  document.querySelectorAll('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tela))
  const c = $('#t-' + tela + ' .corpo')
  if (c) c.scrollTop = 0
  if (location.hash !== '#' + tela) history.pushState({ tela }, '', '#' + tela)
}

function abreTab(t) {
  if (t === 'home') desenhaHome()
  if (t === 'cartoes') desenhaLista()
  if (t === 'comparar') desenhaComparar()
  if (t === 'menu') desenhaMenu()
  vai(t)
}

window.addEventListener('popstate', (e) => {
  const t = (e.state && e.state.tela) || location.hash.slice(1) || 'inicio'
  if (TABS.includes(t)) abreTab(t)
  else document.querySelectorAll('.tela').forEach((x) => x.classList.toggle('ativa', x.id === 't-' + t))
})

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]')
  if (t) return abreTab(t.dataset.tab)
  const ir = e.target.closest('[data-ir]')
  if (ir && ir.dataset.ir === 'quiz') iniciaQuiz()
})

/* ----------------------------------------------------------------- quiz */
function iniciaQuiz() {
  iPergunta = 0; respostas = {}
  desenhaPergunta(); vai('quiz')
}

function desenhaPergunta() {
  const p = PERGUNTAS[iPergunta]
  $('#q-barra').style.width = (iPergunta / PERGUNTAS.length * 100) + '%'
  $('#q-passo').textContent = `${iPergunta + 1}/${PERGUNTAS.length}`
  $('#q-corpo').innerHTML = `
    <h3 class="pergunta">${esc(p.titulo)}</h3>
    <p class="ajuda">${esc(p.ajuda)}</p>
    <div class="opcoes">
      ${p.opcoes.map((o, i) => `<button class="opcao${respostas[p.id] === o.v ? ' marcada' : ''}" data-i="${i}"><span>${esc(o.r)}</span>${ic('check')}</button>`).join('')}
    </div>`
  $('#q-corpo').querySelectorAll('.opcao').forEach((b) => b.addEventListener('click', () => {
    respostas[p.id] = p.opcoes[+b.dataset.i].v
    b.classList.add('marcada')
    setTimeout(avanca, 130)
  }))
}

function avanca() {
  if (iPergunta < PERGUNTAS.length - 1) { iPergunta++; return desenhaPergunta() }
  perfil = { ...respostas }
  localStorage.setItem(CHAVE, JSON.stringify(perfil))
  score = calculaScore(perfil)
  desenhaScore(); vai('score')
}

$('#q-voltar').addEventListener('click', () => {
  if (iPergunta === 0) return vai(perfil ? 'home' : 'inicio')
  iPergunta--; desenhaPergunta()
})

/* ----------------------------------------------------------------- home */
function desenhaHome() {
  const rec = perfil ? recomenda(perfil, score) : []
  const f = score ? faixaDe(score.pontos) : null

  const cardScore = score ? `
    <button class="card-score" data-abrir-score>
      <div class="cs-topo"><span>Sua chance de aprovação</span><span class="faixa-chip">${esc(f.nome)}</span></div>
      <div class="cs-num">${score.pontos}<small> / 1000</small></div>
      <div class="cs-trilha"><i style="left:${score.pontos / 10}%"></i></div>
      <div class="cs-esc"><span>0</span><span>500</span><span>1000</span></div>
    </button>` : `
    <button class="card-score vazio" data-ir="quiz">
      <div class="cs-topo"><span>Ainda não calculado</span>${ic('seta')}</div>
      <div style="font-size:17px;font-weight:650;margin:10px 0 4px">Descubra sua chance</div>
      <div style="font-size:13.5px;color:var(--mudo-fg)">Seis perguntas, cerca de 40 segundos.</div>
    </button>`

  // packs por objetivo: cada um mostra os 3 melhores daquela categoria
  const packs = [
    { id: 'aprovacao', tit: 'Aprovação mais fácil' },
    { id: 'cashback', tit: 'Para cashback' },
    { id: 'pontos', tit: 'Para pontos' },
    { id: 'viagem', tit: 'Para viagem' },
  ].map((p) => {
    const base = (rec.length ? rec : CARTOES).filter((c) => c.categoria === p.id).slice(0, 3)
    if (!base.length) return ''
    return `<div class="pack">
      <div class="pk-tit">${esc(p.tit)}</div>
      ${base.map((c) => `
        <button class="pk-item" data-cartao="${c.id}">
          <div class="plastico" style="width:36px;height:24px;background:${c.cor}"></div>
          <div class="pk-nome">${esc(c.nome)}<span class="pk-sub">${c.anuidade === 0 ? 'Sem anuidade' : fmt(c.anuidade)}</span></div>
          ${c.match != null ? `<b style="font-size:13px;color:${corMatch(c.match)}">${c.match}%</b>` : ''}
        </button>`).join('')}
      <button class="pk-ver" data-filtro="${p.id}">Ver todos</button>
    </div>`
  }).filter(Boolean).join('')

  $('#h-corpo').innerHTML = `
    ${cardScore}

    <button class="atalho" data-ir="quiz">
      <div class="ico">${ic('refazer')}</div>
      <div class="txt"><b>${perfil ? 'Refazer o questionário' : 'Responder o questionário'}</b>
        <small>${perfil ? 'Mudou de renda ou de objetivo?' : 'Para recomendações sob medida'}</small></div>
      <div class="seta">${ic('seta')}</div>
    </button>

    <div class="secao"><h3>Sugestões para você</h3></div>
    <p class="secao-sub">${perfil ? 'Ordenadas pela chance estimada para o seu perfil.' : 'Responda o questionário para ver a sua chance em cada um.'}</p>
    <div class="carrossel">${packs}</div>

    <div class="secao"><h3>Ferramentas</h3></div>
    <div class="grade-acoes">
      <button class="acao" data-tab="comparar"><div class="ico">${ic('comparar')}</div><b>Comparar</b><small>Dois cartões lado a lado</small></button>
      <button class="acao" data-filtro="sem-anuidade"><div class="ico">${ic('moeda')}</div><b>Sem anuidade</b><small>Custo zero por ano</small></button>
      <button class="acao" data-filtro="aprovacao"><div class="ico">${ic('checkCirculo')}</div><b>Aprovação fácil</b><small>Menos exigência</small></button>
      <button class="acao" data-abrir-score><div class="ico">${ic('medidor')}</div><b>Meu score</b><small>Como foi calculado</small></button>
    </div>`

  ligaAtalhos($('#h-corpo'))
}

const corMatch = (m) => m >= 70 ? 'var(--acento)' : m >= 45 ? 'var(--alerta)' : 'var(--perigo)'

function ligaAtalhos(raiz) {
  raiz.querySelectorAll('[data-cartao]').forEach((el) =>
    el.addEventListener('click', () => { voltarDe = 'home'; abreCartao(el.dataset.cartao) }))
  raiz.querySelectorAll('[data-filtro]').forEach((el) =>
    el.addEventListener('click', () => { filtro = el.dataset.filtro; desenhaLista(); vai('cartoes') }))
  raiz.querySelectorAll('[data-abrir-score]').forEach((el) =>
    el.addEventListener('click', () => {
      if (!score) return iniciaQuiz()
      desenhaScore(); vai('score')
    }))
}

/* ---------------------------------------------------------------- score */
function desenhaScore() {
  const f = faixaDe(score.pontos)
  $('#s-corpo').innerHTML = `
    <div class="medidor">
      <div class="num" style="color:${f.cor}">${score.pontos}</div>
      <div class="de">de 1000</div>
      <div class="faixa" style="background:${f.cor}1a;color:${f.cor}">${esc(f.nome)}</div>
    </div>
    <div class="trilha"><i class="marcador" style="left:${score.pontos / 10}%"></i></div>
    <div class="escala"><span>0</span><span>400</span><span>600</span><span>800</span><span>1000</span></div>
    <div class="nota">${esc(f.texto)}</div>

    <div class="rotulo">Como chegamos nesse número</div>
    ${score.detalhe.map((d) => `
      <div class="fator">
        <div class="l1"><span>${esc(d.rotulo)}</span><span class="peso">${d.obtido} de ${d.peso}</span></div>
        <div class="barra"><i style="width:${d.obtido / d.peso * 100}%"></i></div>
      </div>`).join('')}

    <div class="nota" style="margin-top:16px">
      Score de <b>orientação</b>, calculado a partir do que você declarou. Não é
      consulta a birô, não usa seu CPF e não afeta seu histórico. Cada emissor
      faz a própria análise — o resultado pode ser diferente.
    </div>

    <div class="acoes">
      <button class="btn" data-tab="cartoes">Ver cartões recomendados</button>
      <button class="btn texto" data-ir="quiz">Refazer o questionário</button>
    </div>`
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

  let itens = perfil ? recomenda(perfil, score) : CARTOES.map((c) => ({ ...c, match: null, porques: [] }))
  if (filtro === 'sem-anuidade') itens = itens.filter((c) => c.anuidade === 0)
  else if (filtro !== 'todos') itens = itens.filter((c) => c.categoria === filtro)

  if (!itens.length) return ($('#l-corpo').innerHTML = '<div class="vazio">Nenhum cartão com esse filtro.</div>')

  $('#l-corpo').innerHTML = itens.map((c) => `
    <div class="cartao" data-id="${c.id}" role="button" tabindex="0">
      <div class="plastico" style="background:${c.cor}"></div>
      <div class="info">
        <div class="nome">${esc(c.nome)}</div>
        <div class="emissor">${esc(c.emissor)} · ${esc(c.bandeira)} · ★ ${dec(c.nota)}</div>
        <div class="tags">
          <span class="tag${c.anuidade === 0 ? ' bom' : ''}">${c.anuidade === 0 ? 'Sem anuidade' : fmt(c.anuidade)}</span>
          ${c.cashback ? `<span class="tag bom">${dec(c.cashback)}% cashback</span>` : ''}
          ${c.pontosPorDolar ? `<span class="tag">${dec(c.pontosPorDolar)} pts/US$</span>` : ''}
          ${c.salaVip ? '<span class="tag bom">Sala VIP</span>' : ''}
        </div>
      </div>
      ${c.match != null ? `<div class="match"><div class="pct" style="color:${corMatch(c.match)}">${c.match}%</div><div class="lbl">chance</div></div>` : ''}
      <button class="marcar${selecao.includes(c.id) ? ' on' : ''}" data-marcar="${c.id}" aria-label="Selecionar ${esc(c.nome)} para comparar">${ic(selecao.includes(c.id)?'checkCirculo':'circulo')}</button>
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
  desenhaLista()
}

/* -------------------------------------------------------------- detalhe */
function abreCartao(id) {
  const c = (perfil ? recomenda(perfil, score) : CARTOES).find((x) => x.id === id)
  $('#c-titulo').textContent = c.nome
  $('#c-corpo').innerHTML = `
    <div class="plastico grande" style="background:linear-gradient(135deg,${c.cor},${c.cor}c0)">
      <div class="pn">${esc(c.nome)}</div><div class="pb">${esc(c.bandeira.toUpperCase())}</div>
    </div>

    ${c.match != null ? `
      <div class="nota" style="display:flex;align-items:center;gap:14px">
        <div style="font-size:28px;font-weight:800;color:${corMatch(c.match)};line-height:1">${c.match}%</div>
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

    <p style="color:#374151;font-size:15px">${esc(c.resumo)}</p>

    <div class="bloco bom"><h4>${ic('checkCirculo')}O que ele entrega</h4>
      <ul>${c.beneficios.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>
    <div class="bloco risco"><h4>${ic('alerta')}O que costuma incomodar</h4>
      <ul>${c.pegadinhas.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>

    <div class="acoes">
      <button class="btn acento" id="c-ir">${ic('saida')}Ir para o site do emissor</button>
      <button class="btn secundario" id="c-comparar" style="margin-top:9px">
        ${selecao.includes(c.id) ? 'Remover da comparação' : 'Adicionar à comparação'}</button>
    </div>`

  $('#c-ir').addEventListener('click', () =>
    alert('Demonstração.\n\nEm produção, este botão leva ao site do emissor.\nCartões e condições aqui são fictícios.'))
  $('#c-comparar').addEventListener('click', () => { alternaSelecao(c.id); desenhaComparar(); abreTab('comparar') })
  vai('cartao')
}
$('#c-voltar').addEventListener('click', () => abreTab(voltarDe))

/* ------------------------------------------------------------- comparar */
function desenhaComparar() {
  const base = perfil ? recomenda(perfil, score) : CARTOES
  const sel = selecao.map((id) => base.find((c) => c.id === id))

  // slot preenchido não é <button> porque contém o botão "remover" dentro —
  // botão aninhado é HTML inválido e quebra o teclado.
  const slot = (c, i) => c ? `
    <div class="slot cheio">
      <button class="troca" data-troca="${i}" aria-label="Trocar ${esc(c.nome)}">
        <div class="plastico" style="background:${c.cor}"></div>
        <div class="nome">${esc(c.nome)}</div>
      </button>
      <button class="tirar" data-tirar="${c.id}">remover</button>
    </div>` : `
    <button class="slot" data-tab="cartoes">
      <div class="mais">${ic('mais', { classe: 'ic g' })}</div>
      <small>Escolher cartão</small>
    </button>`

  let html = `<div class="slots">${slot(sel[0], 0)}${slot(sel[1], 1)}</div>`

  if (sel.length < 2) {
    html += `<div class="vazio">Escolha dois cartões na aba <b>Cartões</b> tocando no círculo à direita de cada um.</div>`
  } else {
    const [a, b] = sel
    const linhas = [
      ['Anuidade', (c) => c.anuidade === 0 ? 'Grátis' : 'R$ ' + num(c.anuidade), (x, y) => x.anuidade < y.anuidade],
      ['Renda mínima', (c) => c.rendaMinima ? 'R$ ' + num(c.rendaMinima) : 'Livre', (x, y) => x.rendaMinima < y.rendaMinima],
      ['Aprovação', (c) => APROVACAO_ROTULO[c.aprovacao], () => false],
      ['Cashback', (c) => c.cashback ? dec(c.cashback) + '%' : 'Não tem', (x, y) => x.cashback > y.cashback],
      ['Pontos por US$', (c) => c.pontosPorDolar ? dec(c.pontosPorDolar) : 'Não tem', (x, y) => x.pontosPorDolar > y.pontosPorDolar],
      ['Internacional', (c) => c.internacional ? 'Sim' : 'Não', (x, y) => x.internacional && !y.internacional],
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
    <div class="nota" style="margin-top:16px">O ponto verde marca quem leva vantagem
      quando a comparação é objetiva. "Melhor" depende do seu uso: cashback alto
      não compensa anuidade se você gasta pouco.</div>`
  }

  $('#p-corpo').innerHTML = html
  $('#p-corpo').querySelectorAll('[data-tirar]').forEach((el) => el.addEventListener('click', (e) => {
    e.stopPropagation(); alternaSelecao(el.dataset.tirar); desenhaComparar()
  }))
  $('#p-corpo').querySelectorAll('[data-troca]').forEach((el) => el.addEventListener('click', () => abreTab('cartoes')))
}

/* ----------------------------------------------------------------- menu */
function desenhaMenu() {
  $('#m-corpo').innerHTML = `
    <div class="rotulo">Meu perfil</div>
    <button class="item-menu" data-ir="quiz">
      <div class="ico">${ic('refazer')}</div>
      <div class="txt"><b>${perfil ? 'Refazer questionário' : 'Responder questionário'}</b>
        <small>${perfil ? 'Atualize renda, objetivo ou histórico' : 'Leva cerca de 40 segundos'}</small></div>
      <div class="seta">${ic('seta')}</div>
    </button>
    ${score ? `<button class="item-menu" data-abrir-score>
      <div class="ico">${ic('medidor')}</div>
      <div class="txt"><b>Meu score</b><small>${score.pontos} de 1000 · ${esc(faixaDe(score.pontos).nome)}</small></div>
      <div class="seta">${ic('seta')}</div></button>` : ''}
    ${perfil ? `<button class="item-menu" id="m-apagar">
      <div class="ico">${ic('x')}</div>
      <div class="txt"><b>Apagar meus dados</b><small>Remove tudo deste aparelho</small></div>
      <div class="seta">${ic('seta')}</div></button>` : ''}

    <div class="rotulo">Categorias</div>
    ${FILTROS.filter((f) => f.id !== 'todos').map((f) => `
      <button class="item-menu" data-filtro="${f.id}">
        <div class="ico">${ic('etiqueta')}</div><div class="txt"><b>${esc(f.r)}</b></div><div class="seta">${ic('seta')}</div>
      </button>`).join('')}

    <div class="rotulo">Sobre</div>
    <div class="nota">
      <b>Crédito Simplificado</b> é um produto da Evaloriza. Não somos banco nem
      emissor: comparamos cartões e estimamos sua chance de aprovação.<br><br>
      Suas respostas <b>não saem do seu aparelho</b>. Não pedimos CPF, não
      consultamos birô e não criamos conta.<br><br>
      <span style="color:var(--mudo-fg);font-size:13px">Demonstração — cartões,
      emissores e condições são fictícios.</span>
    </div>`

  ligaAtalhos($('#m-corpo'))
  const ap = $('#m-apagar')
  if (ap) ap.addEventListener('click', () => {
    if (!confirm('Apagar suas respostas e o score deste aparelho?')) return
    localStorage.removeItem(CHAVE)
    perfil = null; score = null; selecao = []
    vai('inicio')
  })
}

/* ------------------------------------------------------------------ boot */
const inicial = location.hash.slice(1)
if (perfil) {
  abreTab(TABS.includes(inicial) ? inicial : 'home')
} else {
  history.replaceState({ tela: 'inicio' }, '', '#inicio')
  $('#tabbar').hidden = true
}

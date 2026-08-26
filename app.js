/* Crédito Simplificado — demo navegável.
 * Vanilla, sem build. Estado só na memória e no localStorage do próprio
 * aparelho: nenhuma resposta do quiz sai daqui. */

import {
  CARTOES, PERGUNTAS, FATORES, calculaScore, recomenda,
  faixaDe, fmt, APROVACAO_ROTULO,
} from './dados.js'

const $ = (s) => document.querySelector(s)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const CHAVE = 'cs.perfil.v1'
let perfil = JSON.parse(localStorage.getItem(CHAVE) || 'null')
let score = perfil ? calculaScore(perfil) : null
let iPergunta = 0
let respostas = {}
let filtro = 'todos'
let selecao = []

/* ------------------------------------------------------------ navegação */
function vai(tela) {
  document.querySelectorAll('.tela').forEach((t) => t.classList.toggle('ativa', t.id === 't-' + tela))
  const c = $('#t-' + tela + ' .corpo')
  if (c) c.scrollTop = 0
  if (location.hash !== '#' + tela) history.pushState({ tela }, '', '#' + tela)
}
window.addEventListener('popstate', (e) => {
  const t = (e.state && e.state.tela) || location.hash.slice(1) || 'inicio'
  document.querySelectorAll('.tela').forEach((x) => x.classList.toggle('ativa', x.id === 't-' + t))
})
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ir]')
  if (!b) return
  const destino = b.dataset.ir
  if (destino === 'quiz') iniciaQuiz()
  else if (destino === 'lista') { desenhaLista(); vai('lista') }
  else vai(destino)
})

/* ----------------------------------------------------------------- quiz */
function iniciaQuiz() {
  iPergunta = 0
  respostas = {}
  desenhaPergunta()
  vai('quiz')
}

function desenhaPergunta() {
  const p = PERGUNTAS[iPergunta]
  $('#q-barra').style.width = ((iPergunta) / PERGUNTAS.length * 100) + '%'
  $('#q-passo').textContent = `${iPergunta + 1}/${PERGUNTAS.length}`
  $('#q-corpo').innerHTML = `
    <h3 class="pergunta">${esc(p.titulo)}</h3>
    <p class="ajuda">${esc(p.ajuda)}</p>
    <div class="opcoes">
      ${p.opcoes.map((o, i) => `
        <button class="opcao${respostas[p.id] === o.v ? ' marcada' : ''}" data-i="${i}">${esc(o.r)}</button>
      `).join('')}
    </div>`

  $('#q-corpo').querySelectorAll('.opcao').forEach((btn) => {
    btn.addEventListener('click', () => {
      respostas[p.id] = p.opcoes[+btn.dataset.i].v
      btn.classList.add('marcada')
      // pausa curta para o toque registrar visualmente antes de avançar
      setTimeout(avanca, 140)
    })
  })
}

function avanca() {
  if (iPergunta < PERGUNTAS.length - 1) { iPergunta++; desenhaPergunta(); return }
  perfil = { ...respostas }
  localStorage.setItem(CHAVE, JSON.stringify(perfil))
  score = calculaScore(perfil)
  desenhaScore()
  vai('score')
}

$('#q-voltar').addEventListener('click', () => {
  if (iPergunta === 0) return vai('inicio')
  iPergunta--
  desenhaPergunta()
})

/* ---------------------------------------------------------------- score */
function desenhaScore() {
  const f = faixaDe(score.pontos)
  $('#s-corpo').innerHTML = `
    <div class="medidor">
      <div class="num" style="color:${f.cor}">${score.pontos}</div>
      <div class="de">de 1000</div>
      <div class="faixa" style="background:${f.cor}22;color:${f.cor}">${esc(f.nome)}</div>
    </div>

    <div class="trilha"><i class="marcador" style="left:${score.pontos / 10}%"></i></div>
    <div class="escala"><span>0</span><span>400</span><span>600</span><span>800</span><span>1000</span></div>

    <div class="explica">${esc(f.texto)}</div>

    <div class="rotulo-secao">Como chegamos nesse número</div>
    ${score.detalhe.map((d) => `
      <div class="fator">
        <div class="linha1">
          <span>${esc(d.rotulo)}</span>
          <span class="peso">${d.obtido}/${d.peso}</span>
        </div>
        <div class="barra"><i style="width:${d.obtido / d.peso * 100}%"></i></div>
      </div>
    `).join('')}

    <div class="explica" style="margin-top:18px">
      Este é um score de <b>orientação</b>, calculado a partir do que você
      declarou — não é consulta a birô de crédito e não afeta seu CPF. Cada
      emissor faz a própria análise, e o resultado pode ser diferente.
    </div>

    <div class="acoes">
      <button class="btn" data-ir="lista">Ver meus cartões</button>
      <button class="btn texto" id="s-refazer">Refazer o questionário</button>
    </div>`

  $('#s-refazer').addEventListener('click', iniciaQuiz)
}

/* ---------------------------------------------------------------- lista */
const FILTROS = [
  { id: 'todos', r: 'Todos' },
  { id: 'aprovacao', r: 'Aprovação fácil' },
  { id: 'cashback', r: 'Cashback' },
  { id: 'pontos', r: 'Pontos' },
  { id: 'viagem', r: 'Viagem' },
  { id: 'premium', r: 'Premium' },
  { id: 'sem-anuidade', r: 'Sem anuidade' },
]

function desenhaLista() {
  const temPerfil = !!perfil
  $('#l-titulo').textContent = temPerfil ? 'Cartões para você' : 'Todos os cartões'

  $('#l-filtros').innerHTML = FILTROS.map((f) =>
    `<button class="chip${filtro === f.id ? ' on' : ''}" data-f="${f.id}">${esc(f.r)}</button>`).join('')
  $('#l-filtros').querySelectorAll('.chip').forEach((c) =>
    c.addEventListener('click', () => { filtro = c.dataset.f; desenhaLista() }))

  let itens = temPerfil ? recomenda(perfil, score) : CARTOES.map((c) => ({ ...c, match: null, porques: [] }))
  if (filtro === 'sem-anuidade') itens = itens.filter((c) => c.anuidade === 0)
  else if (filtro !== 'todos') itens = itens.filter((c) => c.categoria === filtro)

  if (!itens.length) {
    $('#l-corpo').innerHTML = '<div class="vazio">Nenhum cartão com esse filtro.</div>'
    return
  }

  $('#l-corpo').innerHTML = itens.map((c) => {
    const tags = [
      `<span class="tag${c.anuidade === 0 ? ' bom' : ''}">${c.anuidade === 0 ? 'Sem anuidade' : fmt(c.anuidade)}</span>`,
      c.cashback ? `<span class="tag bom">${String(c.cashback).replace('.', ',')}% cashback</span>` : '',
      c.pontosPorDolar ? `<span class="tag">${String(c.pontosPorDolar).replace('.', ',')} pts/dólar</span>` : '',
      c.salaVip ? '<span class="tag bom">Sala VIP</span>' : '',
      `<span class="tag">Renda ${c.rendaMinima ? 'R$ ' + c.rendaMinima.toLocaleString('pt-BR') : 'livre'}</span>`,
    ].filter(Boolean).join('')

    const cor = c.match == null ? 'var(--txt2)' : c.match >= 70 ? '#4ade80' : c.match >= 45 ? '#fbbf24' : '#f87171'
    return `
      <div class="cartao" data-id="${c.id}">
        <div class="plastico" style="background:${c.cor}"></div>
        <div class="info">
          <div class="nome">${esc(c.nome)}</div>
          <div class="emissor">${esc(c.emissor)} · ${esc(c.bandeira)} · ★ ${String(c.nota).replace('.', ',')}</div>
          <div class="tags">${tags}</div>
        </div>
        ${c.match != null ? `<div class="match"><div class="pct" style="color:${cor}">${c.match}%</div><div class="lbl">chance</div></div>` : ''}
        <div class="marcar${selecao.includes(c.id) ? ' on' : ''}" data-marcar="${c.id}">✓</div>
      </div>`
  }).join('')

  $('#l-corpo').querySelectorAll('.cartao').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-marcar]')) return
      abreCartao(el.dataset.id)
    })
  })
  $('#l-corpo').querySelectorAll('[data-marcar]').forEach((m) => {
    m.addEventListener('click', () => alternaSelecao(m.dataset.marcar))
  })
  atualizaBarra()
}

function alternaSelecao(id) {
  const i = selecao.indexOf(id)
  if (i >= 0) selecao.splice(i, 1)
  else if (selecao.length >= 2) { selecao.shift(); selecao.push(id) }
  else selecao.push(id)
  desenhaLista()
}

function atualizaBarra() {
  const b = $('#l-comparar')
  b.hidden = selecao.length === 0
  $('#l-selecao').textContent = selecao.length === 1
    ? 'Escolha mais um para comparar'
    : `${selecao.length} cartões selecionados`
  $('#l-btn-comparar').disabled = selecao.length !== 2
}
$('#l-btn-comparar').addEventListener('click', () => { desenhaComparacao(); vai('comparar') })
$('#l-voltar').addEventListener('click', () => vai(perfil ? 'score' : 'inicio'))

/* -------------------------------------------------------------- detalhe */
function abreCartao(id) {
  const base = perfil ? recomenda(perfil, score) : CARTOES
  const c = base.find((x) => x.id === id)
  const cor = c.match == null ? 'var(--txt2)' : c.match >= 70 ? '#4ade80' : c.match >= 45 ? '#fbbf24' : '#f87171'

  $('#c-corpo').innerHTML = `
    <div class="plastico grande" style="background:linear-gradient(135deg,${c.cor},${c.cor}bb)">
      <div class="pnome">${esc(c.nome)}</div>
      <div class="pband">${esc(c.bandeira.toUpperCase())}</div>
    </div>

    ${c.match != null ? `
      <div class="explica" style="display:flex;align-items:center;gap:14px">
        <div style="font-size:27px;font-weight:800;color:${cor};line-height:1">${c.match}%</div>
        <div style="font-size:13.5px">de chance para o seu perfil.<br>
        <span style="color:var(--txt2)">Estimativa nossa, não decisão do emissor.</span></div>
      </div>
      <div class="porques">
        ${c.porques.map((p) => `<div class="porque"><span>→</span><span>${esc(p)}</span></div>`).join('')}
      </div>` : ''}

    <div class="grade">
      <div class="cel"><div class="k">Anuidade</div><div class="v">${c.anuidade === 0 ? 'Grátis' : 'R$ ' + c.anuidade}</div></div>
      <div class="cel"><div class="k">Renda mín.</div><div class="v">${c.rendaMinima ? 'R$ ' + (c.rendaMinima / 1000).toLocaleString('pt-BR') + 'k' : 'Livre'}</div></div>
      <div class="cel"><div class="k">Aprovação</div><div class="v">${APROVACAO_ROTULO[c.aprovacao]}</div></div>
      <div class="cel"><div class="k">Cashback</div><div class="v">${c.cashback ? String(c.cashback).replace('.', ',') + '%' : '—'}</div></div>
      <div class="cel"><div class="k">Pontos</div><div class="v">${c.pontosPorDolar ? String(c.pontosPorDolar).replace('.', ',') : '—'}</div></div>
      <div class="cel"><div class="k">Sala VIP</div><div class="v">${c.salaVip ? 'Sim' : 'Não'}</div></div>
    </div>

    <p style="color:#c8d3e2;font-size:15px">${esc(c.resumo)}</p>

    <div class="bloco">
      <h4>O que ele entrega</h4>
      <ul>${c.beneficios.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>

    <div class="bloco risco">
      <h4>O que costuma incomodar</h4>
      <ul>${c.pegadinhas.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </div>

    <div class="acoes">
      <button class="btn" id="c-solicitar">Ir para o site do emissor</button>
      <button class="btn texto" data-ir="lista">Ver outras opções</button>
    </div>`

  $('#c-solicitar').addEventListener('click', () => {
    alert('Demonstração — em produção este botão leva ao site do emissor.\n\nCartão e condições são fictícios.')
  })
  vai('cartao')
}

/* ------------------------------------------------------------- comparar */
function desenhaComparacao() {
  const base = perfil ? recomenda(perfil, score) : CARTOES
  const [a, b] = selecao.map((id) => base.find((c) => c.id === id))

  // "menor vence" para custo, "maior vence" para benefício
  const linhas = [
    ['Anuidade', (c) => c.anuidade === 0 ? 'Grátis' : 'R$ ' + c.anuidade, (x, y) => x.anuidade < y.anuidade],
    ['Renda mínima', (c) => c.rendaMinima ? 'R$ ' + c.rendaMinima.toLocaleString('pt-BR') : 'Livre', (x, y) => x.rendaMinima < y.rendaMinima],
    ['Aprovação', (c) => APROVACAO_ROTULO[c.aprovacao], () => false],
    ['Cashback', (c) => c.cashback ? String(c.cashback).replace('.', ',') + '%' : 'Não tem', (x, y) => x.cashback > y.cashback],
    ['Pontos/dólar', (c) => c.pontosPorDolar ? String(c.pontosPorDolar).replace('.', ',') : 'Não tem', (x, y) => x.pontosPorDolar > y.pontosPorDolar],
    ['Internacional', (c) => c.internacional ? 'Sim' : 'Não', (x, y) => x.internacional && !y.internacional],
    ['Sala VIP', (c) => c.salaVip ? 'Sim' : 'Não', (x, y) => x.salaVip && !y.salaVip],
    ['Nota', (c) => '★ ' + String(c.nota).replace('.', ','), (x, y) => x.nota > y.nota],
  ]
  if (a.match != null) linhas.unshift(['Sua chance', (c) => c.match + '%', (x, y) => x.match > y.match])

  $('#p-corpo').innerHTML = `
    <div class="cabeca-comp">
      ${[a, b].map((c) => `<div>
        <div class="plastico" style="background:${c.cor}"></div>
        <div class="nome">${esc(c.nome)}</div>
      </div>`).join('')}
    </div>

    <table class="tabela">
      <thead><tr><th></th><th>${esc(a.nome)}</th><th>${esc(b.nome)}</th></tr></thead>
      <tbody>
        ${linhas.map(([rot, val, vence]) => `
          <tr>
            <th>${esc(rot)}</th>
            <td class="${vence(a, b) ? 'vence' : ''}">${esc(val(a))}</td>
            <td class="${vence(b, a) ? 'vence' : ''}">${esc(val(b))}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <div class="explica" style="margin-top:20px">
      O ponto verde marca quem leva vantagem em cada critério — quando a
      comparação é objetiva. "Melhor" depende do seu uso: cashback alto não
      compensa anuidade se você gasta pouco.
    </div>

    <div class="acoes"><button class="btn secundario" data-ir="lista">Escolher outros</button></div>`
}

/* ------------------------------------------------------------------ boot */
if (perfil) {
  // quem já respondeu volta direto pro resultado, não repete o quiz
  desenhaScore()
  const inicial = location.hash.slice(1) || 'score'
  if (inicial === 'lista') desenhaLista()
  vai(['score', 'lista', 'inicio'].includes(inicial) ? inicial : 'score')
} else {
  history.replaceState({ tela: 'inicio' }, '', '#inicio')
}

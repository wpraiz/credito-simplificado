/* Crédito Simplificado — dados do demo.
 *
 * Cartões FICTÍCIOS. Nomes, marcas e condições são inventados para o
 * protótipo; nenhum dado veio dos apps analisados. Se um dia isso virar
 * produto, este arquivo é substituído por uma coleção remota (Firestore,
 * Supabase, o que for) — a UI já lê como se fosse assíncrono.
 */

export const CARTOES = [
  {
    id: 'base-garantido', nome: 'Base Garantido', emissor: 'Base', cor: '#4b5563',
    categoria: 'aprovacao', anuidade: 0, rendaMinima: 0, aprovacao: 'muito-facil',
    cashback: 0, pontosPorDolar: 0, internacional: false, salaVip: false,
    bandeira: 'Visa', nota: 4.1, avaliacoes: 890,
    resumo: 'Cartão com limite garantido por depósito. Serve para construir histórico do zero.',
    beneficios: ['Sem consulta a birô', 'Limite igual ao depósito', 'App com controle de gastos'],
    pegadinhas: ['Limite preso ao valor depositado', 'Não gera pontos nem cashback'],
  },
  {
    id: 'orbita-zero', nome: 'Órbita Zero', emissor: 'Órbita', cor: '#0ea5e9',
    categoria: 'aprovacao', anuidade: 0, rendaMinima: 800, aprovacao: 'facil',
    cashback: 0.5, pontosPorDolar: 0, internacional: true, salaVip: false,
    bandeira: 'Mastercard', nota: 4.3, avaliacoes: 3120,
    resumo: 'Entrada sem anuidade e com exigência de renda baixa. Bom primeiro cartão.',
    beneficios: ['Sem anuidade para sempre', '0,5% de cashback', 'Aumento de limite por uso'],
    pegadinhas: ['Cashback baixo', 'Sem benefício de viagem'],
  },
  {
    id: 'orbita-start', nome: 'Órbita Start', emissor: 'Órbita', cor: '#06b6d4',
    categoria: 'aprovacao', anuidade: 0, rendaMinima: 1200, aprovacao: 'facil',
    cashback: 1.0, pontosPorDolar: 0, internacional: true, salaVip: false,
    bandeira: 'Visa', nota: 4.4, avaliacoes: 2410,
    resumo: 'Pensado para quem está começando a carreira e quer cashback simples.',
    beneficios: ['1% em todas as compras', 'Anuidade zero', 'Cartão virtual ilimitado'],
    pegadinhas: ['Limite inicial costuma ser baixo'],
  },
  {
    id: 'zenit-livre', nome: 'Zenit Livre', emissor: 'Zenit', cor: '#2563eb',
    categoria: 'cashback', anuidade: 0, rendaMinima: 2000, aprovacao: 'media',
    cashback: 1.5, pontosPorDolar: 0, internacional: true, salaVip: false,
    bandeira: 'Mastercard', nota: 4.6, avaliacoes: 8740,
    resumo: 'O equilíbrio entre cashback decente e nenhuma anuidade.',
    beneficios: ['1,5% em tudo', 'Sem anuidade', 'Seguro de compra'],
    pegadinhas: ['Cashback creditado só no mês seguinte'],
  },
  {
    id: 'nivel-cashback', nome: 'Nível Cashback', emissor: 'Nível', cor: '#7c3aed',
    categoria: 'cashback', anuidade: 290, rendaMinima: 3500, aprovacao: 'media',
    cashback: 2.5, pontosPorDolar: 0, internacional: true, salaVip: false,
    bandeira: 'Visa', nota: 4.5, avaliacoes: 5210,
    resumo: 'Cashback alto que compensa a anuidade se você gasta acima de R$ 1.500/mês.',
    beneficios: ['2,5% em supermercado e delivery', '1,2% no resto', 'Anuidade devolvida se gastar R$ 3.000/mês'],
    pegadinhas: ['Anuidade de R$ 290 se não bater a meta', 'Teto de R$ 400 de cashback por mês'],
  },
  {
    id: 'atlas-pontos', nome: 'Atlas Pontos', emissor: 'Atlas', cor: '#059669',
    categoria: 'pontos', anuidade: 480, rendaMinima: 5000, aprovacao: 'media',
    cashback: 0, pontosPorDolar: 2.0, internacional: true, salaVip: false,
    bandeira: 'Mastercard', nota: 4.4, avaliacoes: 4380,
    resumo: 'Acúmulo de pontos consistente, sem os extras caros de um premium.',
    beneficios: ['2 pontos por dólar', 'Pontos não expiram', 'Transferência para programas parceiros'],
    pegadinhas: ['Anuidade sem opção de isenção', 'Sem sala VIP'],
  },
  {
    id: 'meridiano-viagem', nome: 'Meridiano Viagem', emissor: 'Meridiano', cor: '#ea580c',
    categoria: 'viagem', anuidade: 690, rendaMinima: 7000, aprovacao: 'dificil',
    cashback: 0, pontosPorDolar: 2.5, internacional: true, salaVip: true,
    bandeira: 'Visa', nota: 4.7, avaliacoes: 3960,
    resumo: 'Para quem viaja com frequência e usa sala VIP de verdade.',
    beneficios: ['2,5 pontos por dólar', '4 acessos a sala VIP por ano', 'Seguro viagem incluso'],
    pegadinhas: ['Anuidade alta', 'Sala VIP limitada a 4 usos'],
  },
  {
    id: 'nivel-black', nome: 'Nível Black', emissor: 'Nível', cor: '#111827',
    categoria: 'premium', anuidade: 1200, rendaMinima: 12000, aprovacao: 'dificil',
    cashback: 1.0, pontosPorDolar: 3.0, internacional: true, salaVip: true,
    bandeira: 'Mastercard', nota: 4.8, avaliacoes: 2180,
    resumo: 'Premium completo. Só faz sentido com gasto alto e uso real dos benefícios.',
    beneficios: ['3 pontos por dólar', 'Sala VIP ilimitada', 'Concierge 24h', 'Seguros completos'],
    pegadinhas: ['Anuidade de R$ 1.200', 'Exige renda de R$ 12.000'],
  },
  {
    id: 'atlas-infinite', nome: 'Atlas Infinite', emissor: 'Atlas', cor: '#1e293b',
    categoria: 'premium', anuidade: 1450, rendaMinima: 15000, aprovacao: 'dificil',
    cashback: 0, pontosPorDolar: 3.5, internacional: true, salaVip: true,
    bandeira: 'Visa', nota: 4.7, avaliacoes: 1490,
    resumo: 'O topo da linha do emissor, com o maior acúmulo de pontos da nossa base.',
    beneficios: ['3,5 pontos por dólar', 'Sala VIP ilimitada + acompanhante', 'Upgrade de hotel'],
    pegadinhas: ['A anuidade mais cara da base', 'Análise de crédito rigorosa'],
  },
  {
    id: 'zenit-mais', nome: 'Zenit Mais', emissor: 'Zenit', cor: '#4338ca',
    categoria: 'cashback', anuidade: 390, rendaMinima: 4500, aprovacao: 'media',
    cashback: 2.0, pontosPorDolar: 1.0, internacional: true, salaVip: false,
    bandeira: 'Mastercard', nota: 4.5, avaliacoes: 6030,
    resumo: 'Híbrido: cashback bom e ainda acumula pontos. Útil para quem não quer escolher.',
    beneficios: ['2% de cashback', '1 ponto por dólar em paralelo', 'Isenção com gasto de R$ 4.000/mês'],
    pegadinhas: ['Precisa gastar bastante para isentar a anuidade'],
  },
]

/* ------------------------------------------------------------------ quiz */

export const PERGUNTAS = [
  {
    id: 'renda', titulo: 'Qual sua renda mensal?',
    ajuda: 'Somando salário, bicos e benefícios. Fica só no seu aparelho.',
    opcoes: [
      { v: 900, r: 'Até R$ 1.000' },
      { v: 1800, r: 'R$ 1.000 a R$ 2.500' },
      { v: 3500, r: 'R$ 2.500 a R$ 5.000' },
      { v: 8000, r: 'R$ 5.000 a R$ 10.000' },
      { v: 15000, r: 'Acima de R$ 10.000' },
    ],
  },
  {
    id: 'historico', titulo: 'Como está seu nome hoje?',
    ajuda: 'Sem julgamento — isso só ajusta a recomendação.',
    opcoes: [
      { v: 'limpo', r: 'Limpo, sem restrição' },
      { v: 'leve', r: 'Tive atraso, já resolvi' },
      { v: 'restricao', r: 'Tenho restrição ativa' },
      { v: 'naosei', r: 'Não sei' },
    ],
  },
  {
    id: 'temCartao', titulo: 'Você já tem cartão de crédito?',
    ajuda: 'Quem já tem histórico costuma ter mais opções.',
    opcoes: [
      { v: 'nao', r: 'Não, seria o primeiro' },
      { v: 'um', r: 'Tenho um' },
      { v: 'varios', r: 'Tenho dois ou mais' },
    ],
  },
  {
    id: 'objetivo', titulo: 'O que você mais quer do cartão?',
    ajuda: 'Escolha o principal. Dá para mudar depois.',
    opcoes: [
      { v: 'aprovacao', r: 'Ser aprovado' },
      { v: 'cashback', r: 'Dinheiro de volta' },
      { v: 'pontos', r: 'Acumular pontos' },
      { v: 'viagem', r: 'Viajar melhor' },
      { v: 'premium', r: 'Serviços premium' },
    ],
  },
  {
    id: 'anuidade', titulo: 'Aceita pagar anuidade?',
    ajuda: 'Anuidade só compensa se você usa os benefícios.',
    opcoes: [
      { v: 'nunca', r: 'Só sem anuidade' },
      { v: 'talvez', r: 'Depende do benefício' },
      { v: 'sim', r: 'Sim, se valer a pena' },
    ],
  },
  {
    id: 'estabilidade', titulo: 'Há quanto tempo na renda atual?',
    ajuda: 'Estabilidade pesa na análise dos emissores.',
    opcoes: [
      { v: 'novo', r: 'Menos de 6 meses' },
      { v: 'medio', r: 'De 6 meses a 2 anos' },
      { v: 'estavel', r: 'Mais de 2 anos' },
    ],
  },
]

/* ----------------------------------------------------------------- score */

// Pesos somam 100. Ficam visíveis na tela de score de propósito: um número
// que o usuário não entende não gera confiança, gera desconfiança.
export const FATORES = [
  { id: 'renda',        rotulo: 'Renda compatível',    peso: 30 },
  { id: 'historico',    rotulo: 'Histórico de crédito', peso: 25 },
  { id: 'perfil',       rotulo: 'Perfil declarado',     peso: 20 },
  { id: 'estabilidade', rotulo: 'Estabilidade de renda', peso: 15 },
  { id: 'relacionamento', rotulo: 'Relacionamento bancário', peso: 10 },
]

export function calculaScore(r) {
  const nota = {}

  // renda: comparada com a mediana de renda mínima da base
  const medianaRenda = 3500
  nota.renda = Math.min(1, (r.renda || 0) / (medianaRenda * 2))

  nota.historico = { limpo: 1, leve: 0.65, naosei: 0.5, restricao: 0.15 }[r.historico] ?? 0.5
  nota.perfil = r.objetivo ? 0.8 : 0.5
  if (r.objetivo === 'premium' && (r.renda || 0) < 8000) nota.perfil = 0.45 // desalinhado
  nota.estabilidade = { novo: 0.35, medio: 0.7, estavel: 1 }[r.estabilidade] ?? 0.5
  nota.relacionamento = { nao: 0.3, um: 0.7, varios: 1 }[r.temCartao] ?? 0.3

  const total = FATORES.reduce((s, f) => s + nota[f.id] * f.peso, 0)
  const pontos = Math.round(total * 10) // 0–1000

  return {
    pontos,
    faixa: faixaDe(pontos),
    detalhe: FATORES.map((f) => ({ ...f, obtido: Math.round(nota[f.id] * f.peso) })),
  }
}

// `cor` pinta preenchimento e barra; `corTexto` é a variante que passa 4,5:1
// (WCAG AA) sobre o fundo claro — as vivas reprovam em texto pequeno.
export const FAIXAS = [
  { min: 800, nome: 'Excelente', cor: '#16a34a', corTexto: '#15803d', texto: 'Você tem perfil para pleitear os cartões premium da nossa base.' },
  { min: 600, nome: 'Bom',       cor: '#65a30d', corTexto: '#3f6212', texto: 'Seu perfil casa com a maioria dos cartões intermediários. Há espaço para crescer.' },
  { min: 400, nome: 'Regular',   cor: '#ea580c', corTexto: '#9a3412', texto: 'Comece por cartões sem anuidade para construir limite e melhorar gradualmente.' },
  { min: 0,   nome: 'Atenção',   cor: '#dc2626', corTexto: '#b91c1c', texto: 'Vale construir histórico primeiro. Cartão garantido é o caminho mais curto.' },
]

export const faixaDe = (p) => FAIXAS.find((f) => p >= f.min)

/* -------------------------------------------------- recomendação (match) */

const ORDEM_APROVACAO = { 'muito-facil': 4, facil: 3, media: 2, dificil: 1 }

export function recomenda(r, score) {
  return CARTOES.map((c) => {
    let m = 50
    const porques = []

    // renda: o filtro mais duro — abaixo do mínimo, a chance despenca
    if (r.renda >= c.rendaMinima) {
      m += 18
      if (c.rendaMinima > 0) porques.push('Sua renda cobre o mínimo exigido')
    } else {
      m -= 34
      porques.push(`Pede renda de R$ ${c.rendaMinima.toLocaleString('pt-BR')}`)
    }

    // objetivo declarado
    if (r.objetivo === c.categoria) { m += 20; porques.push('Casa com seu objetivo principal') }

    // anuidade
    if (r.anuidade === 'nunca' && c.anuidade > 0) { m -= 30; porques.push('Tem anuidade e você pediu sem') }
    if (r.anuidade === 'nunca' && c.anuidade === 0) { m += 12; porques.push('Sem anuidade, como você quer') }
    if (r.anuidade === 'sim' && c.anuidade > 0) m += 4

    // histórico contra dificuldade de aprovação
    const facilidade = ORDEM_APROVACAO[c.aprovacao]
    if (r.historico === 'restricao') {
      if (facilidade >= 4) { m += 22; porques.push('Aceita quem tem restrição') }
      else { m -= 32; porques.push('Exige nome limpo') }
    }
    if (r.historico === 'limpo' && facilidade <= 2) m += 8

    // score geral empurra ou segura
    if (score.pontos >= 800 && facilidade <= 2) m += 10
    if (score.pontos < 400 && facilidade <= 2) m -= 20

    // primeiro cartão não combina com premium
    if (r.temCartao === 'nao' && (c.categoria === 'premium' || c.categoria === 'viagem')) {
      m -= 18
      porques.push('Difícil como primeiro cartão')
    }

    return { ...c, match: Math.max(3, Math.min(97, Math.round(m))), porques: porques.slice(0, 3) }
  }).sort((a, b) => b.match - a.match)
}

export const fmt = (n) => n === 0 ? 'Grátis' : `R$ ${n.toLocaleString('pt-BR')}/ano`
export const APROVACAO_ROTULO = { 'muito-facil': 'Muito alta', facil: 'Alta', media: 'Média', dificil: 'Baixa' }

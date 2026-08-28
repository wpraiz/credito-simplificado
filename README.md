# Crédito Simplificado — demo

Protótipo navegável do produto da Evaloriza. Comparador e recomendador de cartão
de crédito, com score de aprovação estimado a partir do que o usuário declara.

**Cartões, emissores e condições são fictícios** — servem para avaliar a
experiência do produto, não para orientar decisão financeira de ninguém.

O desenho deste app saiu de uma análise de concorrentes que vive em repositório
separado e privado. Nada foi copiado de lá: nem nome, nem copy, nem layout. O
que veio foi **arquitetura e estratégia de produto**.

## Rodar local

```bash
npx serve .           # ou qualquer servidor estático
```

Precisa de servidor: o app usa módulos ES, que o `file://` bloqueia.

## O funil

```
início → quiz (6 perguntas, ~40s) → score → recomendações → detalhe → comparar
```

## Decisões de produto, e o porquê

**O score mostra os pesos.** Renda 30 · histórico 25 · perfil 20 · estabilidade
15 · relacionamento 10. Um número que o usuário não entende não gera confiança,
gera desconfiança — e a promessa do produto é justamente clareza.

**Cada cartão tem "o que costuma incomodar".** Listar só benefício é o que todo
comparador faz, e é por isso que ninguém acredita em nenhum. A pegadinha
declarada é o diferencial defensável.

**Nada é enviado.** As respostas ficam no `localStorage` do aparelho. Não há
consulta a birô, não há CPF, não há conta. Isso é dito na primeira tela porque é
a objeção número um de quem já foi queimado por "simulador de crédito".

**Sem gate de anúncio.** Os concorrentes analisados travam a recomendação atrás
de um anúncio recompensado, cobrado logo depois de o usuário investir ~45s no
questionário. Funciona para eles; aqui a decisão foi entregar o resultado e
ganhar a confiança primeiro. Se um dia houver monetização, ela entra depois de o
produto provar valor.

## O que falta para virar produto

- Catálogo real de cartões, vindo de backend (hoje é `dados.js` estático)
- Parceria/afiliação com os emissores — é de onde sai a receita
- Persistência de conta, para o usuário voltar e acompanhar
- Config remota (spec 001), para ajustar sem release

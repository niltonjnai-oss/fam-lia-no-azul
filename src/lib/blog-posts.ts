// Conteúdo do blog (SEO). Sem CMS de propósito: os posts vivem aqui como
// dados estruturados — mesmo padrão já usado na landing page (arrays de
// benefícios, FAQ etc.) — e cada campo mapeia direto pra um pedaço de HTML
// semântico e pro Article/FAQPage schema da página do post.
//
// Ao adicionar um post novo, atualizar manualmente também:
// public/sitemap.xml (nova <url>) e public/blog/rss.xml (novo <item>).

export interface BlogFaqItem {
  q: string;
  a: string;
}

export interface BlogSection {
  /** Vira um <h2>. */
  heading: string;
  /** Cada string vira um <p>. Aceita **negrito** simples (ver renderInline). */
  paragraphs: string[];
  list?: { ordered: boolean; items: string[] };
}

export interface BlogPost {
  slug: string;
  /** Título da página / <h1>. */
  title: string;
  metaDescription: string;
  /** Resumo curto pro card da listagem do blog. */
  excerpt: string;
  publishedISO: string;
  updatedISO?: string;
  readingMinutes: number;
  /** Parágrafo de abertura: responde a pergunta do título em 1-2 frases —
   *  é o trecho que mecanismos de busca por IA mais citam. */
  directAnswer: string;
  sections: BlogSection[];
  faq?: BlogFaqItem[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "como-organizar-as-financas-da-familia",
    title: "Como organizar as finanças da família (guia completo)",
    metaDescription:
      "Passo a passo prático para organizar as finanças da família pelo método 50-30-20, sem planilha: como dividir a renda, cortar o gasto invisível e sair do aperto no fim do mês.",
    excerpt:
      "O passo a passo pra sair do 'o dinheiro entrou e sumiu' e passar a saber, todo mês, pra onde foi cada real da família.",
    publishedISO: "2026-07-13",
    readingMinutes: 7,
    directAnswer:
      "Organizar as finanças da família começa por três passos: somar toda a renda do mês, dividir esse valor entre essencial, estilo de vida e reserva (o método 50-30-20), e registrar os gastos do dia a dia pra comparar com o planejado. O segredo não é fazer uma planilha perfeita — é repetir esses três passos toda semana, em poucos minutos.",
    sections: [
      {
        heading: "Por que a maioria das famílias não sabe pra onde vai o dinheiro",
        paragraphs: [
          "Não é falta de renda — na maioria dos casos, é falta de visibilidade. O salário cai, as contas do mês descontam um pedaço, e o resto vai se diluindo em pequenos gastos que ninguém anota: um delivery aqui, uma parcela ali, o mercado da semana que sempre custa \"um pouco mais\" do que devia.",
          "Sem um jeito simples de acompanhar isso, o primeiro sinal de que algo deu errado só aparece perto do dia 25 ou 28: a conta aperta e ninguém sabe explicar exatamente por quê. O problema não é o tamanho da renda — é a ausência de um método.",
        ],
      },
      {
        heading: "O método 50-30-20 explicado em 3 partes",
        paragraphs: [
          "O 50-30-20 é uma forma simples de dividir a renda mensal da família em três grupos, sem precisar decidir gasto por gasto no chute:",
        ],
        list: {
          ordered: false,
          items: [
            "**50% — Essencial**: tudo que a família não pode deixar de pagar. Moradia, contas de luz e água, mercado, transporte, escola dos filhos, saúde.",
            "**30% — Estilo de vida**: o que torna o dia a dia melhor, mas é escolha. Lazer, restaurante, streaming, academia, presentes.",
            "**20% — Reserva e dívidas**: o que protege o futuro da família. Guardar para uma reserva de emergência e quitar dívidas ativas.",
          ],
        },
      },
      {
        heading: "Passo a passo pra organizar as finanças da família",
        paragraphs: [
          "Na prática, dá pra começar em um único fim de semana. O importante não é fazer perfeito — é começar.",
        ],
        list: {
          ordered: true,
          items: [
            "**Some toda a renda do mês**: salário, bicos, pensão, qualquer entrada fixa. Esse é o número que você vai dividir.",
            "**Liste as despesas fixas**: aluguel ou prestação, contas de consumo, escola, transporte. Você já sabe esses valores de cabeça ou pela fatura do mês passado.",
            "**Aplique o 50-30-20**: veja se as despesas fixas cabem nos 50% do essencial. Se estourar, é sinal de que algo precisa ser renegociado ou cortado — mas isso é conversa pra outro artigo.",
            "**Registre os gastos do dia a dia**: cada compra no mercado, cada delivery, cada Uber. O objetivo não é anotar tudo com precisão contábil — é ter uma ideia real de quanto está saindo em cada grupo.",
            "**Revise uma vez por semana**: separar 5 minutos toda semana (não só no fim do mês) é o que faz a diferença entre descobrir um problema no dia 10 ou só no dia 28, quando já não dá mais pra corrigir.",
          ],
        },
      },
      {
        heading: "Por que a planilha costuma não durar",
        paragraphs: [
          "Quase toda família em algum momento já tentou uma planilha. E quase sempre a história se repete: as primeiras duas semanas vão bem, depois vem um dia corrido, um gasto que não foi anotado na hora, uma fórmula que quebra sem ninguém perceber — e a planilha para de refletir a realidade. A partir daí, ela deixa de ser útil e é abandonada.",
          "O problema não é a pessoa ser desorganizada. É que uma planilha exige duas coisas ao mesmo tempo: disciplina para manter e conhecimento técnico para não quebrar. Um método que se mantém sozinho — dividindo a renda automaticamente e deixando só o registro do gasto por conta da pessoa — tem muito mais chance de durar além da terceira semana.",
        ],
      },
      {
        heading: "Um exemplo prático com números",
        paragraphs: [
          "Imagine uma família com renda de R$ 6.000 por mês. Aplicando o 50-30-20:",
        ],
        list: {
          ordered: false,
          items: [
            "Essencial (50%): até R$ 3.000 — aluguel, contas, mercado, escola, transporte.",
            "Estilo de vida (30%): até R$ 1.800 — lazer, streaming, restaurante, academia.",
            "Reserva e dívidas (20%): pelo menos R$ 1.200 — reserva de emergência e parcelas de dívidas.",
          ],
        },
      },
      {
        heading: "O que fazer quando as contas não cabem no 50%",
        paragraphs: [
          "É comum, principalmente no primeiro mês, o essencial passar de 50% da renda — sobretudo em famílias que estão com dívidas em aberto. Isso não é motivo pra desistir do método; é justamente o sinal que ele existe pra mostrar. A partir daí, os próximos passos costumam ser: revisar contratos de assinatura e serviços, comparar preços de contas recorrentes (internet, plano de saúde) e, se houver dívidas caras, priorizar quitar a que tem o maior juro primeiro — mesmo que ela não seja a maior em valor total.",
        ],
      },
    ],
    faq: [
      {
        q: "Preciso saber de finanças para aplicar o método 50-30-20?",
        a: "Não. O método foi pensado justamente para quem nunca lidou com planilha ou controle financeiro. A única conta que você precisa fazer é somar a renda do mês — o resto é dividir esse número em três partes.",
      },
      {
        q: "O que fazer se a renda da família for variável (freelas, comissão)?",
        a: "Use a média dos últimos 3 meses como base para a divisão. Em meses acima da média, direcione o excedente principalmente para a reserva de emergência — ela é o que segura os meses mais fracos.",
      },
      {
        q: "Quanto tempo leva para organizar as finanças da família pela primeira vez?",
        a: "O primeiro levantamento (somar renda, listar despesas fixas e aplicar o 50-30-20) costuma levar entre 15 e 30 minutos. Depois disso, o dia a dia é só registrar os gastos, o que leva segundos por lançamento.",
      },
      {
        q: "Dá pra fazer isso numa planilha em vez de um aplicativo?",
        a: "Dá, mas a maioria das famílias abandona a planilha nas primeiras semanas porque ela exige manutenção manual constante. Um aplicativo que já divide a renda automaticamente e soma os gastos sozinho tende a durar muito mais no dia a dia.",
      },
    ],
  },
  {
    slug: "como-sair-das-dividas",
    title: "Como sair das dívidas: passo a passo pra família",
    metaDescription:
      "Passo a passo prático para sair das dívidas: como listar o que deve, descobrir o custo real de cada uma, priorizar pelo juro (não pelo valor) e negociar com informação na mão.",
    excerpt:
      "Dívida não some sozinha, mas também não precisa de milagre. O caminho é listar, entender o juro de cada uma e atacar na ordem certa.",
    publishedISO: "2026-07-14",
    readingMinutes: 8,
    directAnswer:
      "Sair das dívidas começa por listar todas elas com o valor, a parcela e o juro de cada uma — não só o total que você deve. Depois, priorize o pagamento pela dívida com o juro mais alto primeiro (não a maior em valor), porque é ela que mais cresce enquanto espera. O restante das dívidas você mantém só na parcela mínima até a prioritária ser quitada.",
    sections: [
      {
        heading: "Por que uma dívida não some sozinha",
        paragraphs: [
          "Toda dívida que não é paga cresce todo mês, porque o juro incide sobre o que já é juro do mês anterior — é o chamado juro composto. Uma dívida de cartão a 12% ao mês, por exemplo, dobra de tamanho em menos de 6 meses se ninguém pagar nada nela.",
          "É por isso que dívida parada nunca é neutra: ela está sempre ficando maior, mesmo que a fatura não chegue ou o boleto não seja cobrado. Entender isso é o primeiro passo — não é falta de sorte, é matemática, e a matemática tem solução.",
        ],
      },
      {
        heading: "Passo 1 — Liste todas as dívidas, não só o total",
        paragraphs: [
          "A maioria das pessoas sabe o valor aproximado que deve no total, mas não sabe o detalhe de cada dívida — e é o detalhe que importa. Para cada dívida ativa, anote:",
        ],
        list: {
          ordered: true,
          items: [
            "**Nome**: cartão, empréstimo, financiamento, o que for.",
            "**Valor total** que ainda falta pagar.",
            "**Parcela mensal** que você paga hoje.",
            "**Taxa de juros ao mês** — esse é o dado que quase ninguém tem de cabeça, mas é o mais importante da lista.",
          ],
        },
      },
      {
        heading: "Passo 2 — Descubra o custo real de cada dívida",
        paragraphs: [
          "Se você não sabe a taxa de juros de uma dívida, tem duas formas de descobrir: perguntar direto para o banco ou a loja, ou calcular a partir do que você já sabe — quanto custava à vista e quanto está pagando parcelado.",
          "Por exemplo: um produto de **R$ 1.200 à vista**, parcelado em **12x de R$ 140**, vira **R$ 1.680 no total** — **R$ 480 de juros**, o que equivale a cerca de **4,5% ao mês**. Ver esse número em reais (não só em %) costuma ser o momento em que a dívida deixa de ser abstrata.",
        ],
      },
      {
        heading: "Passo 3 — Priorize pelo juro, não pelo valor",
        paragraphs: [
          "Esse é o ponto que mais gera erro: a tendência natural é querer quitar primeiro a dívida menor, porque parece mais fácil. Mas o que realmente economiza dinheiro é atacar primeiro a dívida com o **juro mais alto**, não a de menor valor — é ela que está crescendo mais rápido enquanto as outras esperam.",
          "Na prática: continue pagando a parcela mínima de todas as dívidas, e qualquer valor extra que sobrar no mês, direcione inteiro para a dívida do juro mais alto. Quando ela for quitada, o valor que ia para ela passa a reforçar a próxima da lista — o efeito vai acumulando.",
        ],
      },
      {
        heading: "Passo 4 — Negocie com informação na mão",
        paragraphs: [
          "Uma negociação de dívida é sempre mais forte quando você já sabe os números antes de ligar. Antes de aceitar qualquer proposta:",
        ],
        list: {
          ordered: false,
          items: [
            "**Pergunte sempre o valor à vista primeiro** — é a base pra saber se o parcelado realmente compensa.",
            "**Calcule o desconto real**: se devem R$ 3.000 e a proposta à vista é R$ 1.800, o desconto é de 40% — vale a pena se você tiver o dinheiro sem comprometer outras contas.",
            "**Peça a proposta por escrito** antes de aceitar (protocolo, e-mail ou contrato).",
            "**Desconfie de parcela que não cabe no seu mês** — acordo quebrado costuma virar uma dívida pior que a original.",
          ],
        },
      },
      {
        heading: "Um exemplo prático com números",
        paragraphs: [
          "Imagine uma família com três dívidas ativas e R$ 200 sobrando por mês para direcionar além das parcelas mínimas:",
        ],
        list: {
          ordered: false,
          items: [
            "Cartão de crédito: R$ 2.000, 10% ao mês — **prioridade 1** (juro mais alto).",
            "Empréstimo pessoal: R$ 4.000, 3% ao mês — prioridade 2.",
            "Financiamento de móveis: R$ 1.500, 1,5% ao mês — prioridade 3.",
          ],
        },
      },
      {
        heading: "O que fazer se a parcela nem cobre os juros",
        paragraphs: [
          "Às vezes a parcela mínima de uma dívida é tão baixa que ela não vence nem os juros do mês — ou seja, o saldo devedor cresce mesmo com o pagamento em dia. Esse é o sinal mais claro de que essa dívida específica precisa de renegociação urgente, porque matematicamente ela nunca vai zerar do jeito que está.",
          "Nesses casos, o caminho costuma ser: ligar para o credor, explicar a situação e pedir uma condição nova (prazo maior, taxa menor) — ou, se possível, trocar essa dívida cara por um empréstimo com juro mais baixo em outro lugar, só para quitar a mais cara.",
        ],
      },
    ],
    faq: [
      {
        q: "Devo pagar a dívida com o maior valor ou a de maior juro primeiro?",
        a: "A de maior juro. Ela é a que mais cresce enquanto espera, então quitá-la primeiro economiza mais dinheiro no total, mesmo que o valor dela seja menor que o de outra dívida.",
      },
      {
        q: "Dívida vencida continua rendendo juros?",
        a: "Sim, e geralmente com juros de mora e multa adicionais por cima do juro normal. Dívida vencida é, na prática, a que mais urge negociar ou quitar primeiro.",
      },
      {
        q: "É melhor negociar sozinho ou contratar alguém para negociar por mim?",
        a: "Para a maioria das dívidas de cartão, loja ou empréstimo pessoal, dá para negociar sozinho — basta ligar direto para o credor com os números em mãos. Empresas de renegociação costumam cobrar uma taxa sobre o desconto conseguido, então vale comparar se o valor economizado compensa.",
      },
      {
        q: "Taxa de juros mensal e anual são a mesma coisa?",
        a: "Não — e essa confusão faz muita gente aceitar uma proposta ruim. 5% ao mês não é 60% ao ano; por causa do juro composto, equivale a mais de 79% ao ano. Sempre confirme se a taxa que te passaram é mensal ou anual antes de comparar propostas.",
      },
      {
        q: "Quitar uma dívida limpa meu nome na hora?",
        a: "Normalmente sim, mas o prazo para a baixa aparecer nos birôs de crédito (Serasa, SPC) varia de alguns dias a algumas semanas, dependendo do credor. Vale pedir o comprovante de quitação e guardar — ele é a prova caso a baixa demore.",
      },
    ],
  },
  {
    slug: "metodo-50-30-20-como-funciona",
    title: "Método 50-30-20: como funciona e como calcular o seu",
    metaDescription:
      "Entenda como funciona o método 50-30-20 de verdade: como calcular sua divisão exata, o que entra em cada categoria, os casos que geram dúvida e o que fazer quando a renda não cabe.",
    excerpt:
      "50% essencial, 30% estilo de vida, 20% futuro. Simples de explicar, mas cheio de dúvida na hora de aplicar — este artigo resolve as duas coisas.",
    publishedISO: "2026-07-14",
    readingMinutes: 7,
    directAnswer:
      "O método 50-30-20 divide a renda mensal líquida da família em três partes fixas: 50% para despesas essenciais, 30% para estilo de vida e 20% para reserva de emergência e dívidas. Para calcular o seu, multiplique sua renda líquida do mês por 0,5, por 0,3 e por 0,2 — esses três valores são os limites de cada categoria.",
    sections: [
      {
        heading: "De onde vem o método 50-30-20",
        paragraphs: [
          "O 50-30-20 não é modismo recente: foi popularizado em 2005 pela senadora americana Elizabeth Warren, quando ainda era professora de Harvard, no livro sobre finanças pessoais que escreveu com a filha. A proposta original era simples — resolver o problema de que a maioria das pessoas não consegue manter um controle financeiro detalhado por muito tempo.",
          "A força do método está justamente aí: em vez de decidir gasto por gasto, você decide só três limites. Menos decisões, mais consistência — é por isso que ele resiste ao teste do tempo em qualquer época.",
        ],
      },
      {
        heading: "Como calcular a sua divisão exata",
        paragraphs: [
          "O cálculo usa a **renda líquida** (o que realmente entra na conta, depois de descontos) — não a renda bruta. Para cada R$ 1.000 de renda líquida:",
        ],
        list: {
          ordered: false,
          items: [
            "**Essencial**: multiplique por 0,5 → R$ 500 a cada R$ 1.000.",
            "**Estilo de vida**: multiplique por 0,3 → R$ 300 a cada R$ 1.000.",
            "**Reserva e dívidas**: multiplique por 0,2 → R$ 200 a cada R$ 1.000.",
          ],
        },
      },
      {
        heading: "O que entra em cada categoria (e os casos que geram dúvida)",
        paragraphs: [
          "As pontas são fáceis: moradia e mercado são sempre essenciais, viagem e presente são sempre estilo de vida. A dúvida real mora no meio — nesses casos, uma pergunta resolve: **\"se a renda caísse pela metade amanhã, eu continuaria pagando isso?\"** Se sim, é essencial. Se não, é estilo de vida, mesmo que pareça necessário hoje.",
        ],
        list: {
          ordered: false,
          items: [
            "**Internet**: essencial se for usada para trabalho ou escola; estilo de vida se for só lazer.",
            "**Streaming**: quase sempre estilo de vida — corta primeiro numa emergência.",
            "**Academia**: depende. Se for prescrição médica, essencial; se for bem-estar geral, estilo de vida.",
            "**Plano de saúde**: essencial — é seguro contra um risco que a família não pode bancar sozinha.",
            "**Transporte**: a parte pra trabalhar é essencial; Uber de sábado à noite é estilo de vida.",
          ],
        },
      },
      {
        heading: "Por que dividir por categoria funciona melhor que \"guardar o que sobrar\"",
        paragraphs: [
          "A abordagem mais comum — gastar o mês inteiro e guardar o que sobrar no fim — costuma resultar em zero de reserva, porque quase sempre não sobra nada. O 50-30-20 inverte a lógica: os 20% de reserva e dívidas são um limite mínimo definido antes de gastar, não uma esperança para depois.",
          "É a mesma diferença entre \"vou economizar o que der\" e \"tenho R$ 400 reservados este mês, ponto final\" — o segundo é o que realmente sai do papel.",
        ],
      },
      {
        heading: "Quando os 50-30-20 não cabem na sua realidade",
        paragraphs: [
          "É comum, principalmente em famílias com aluguel caro ou dívidas em aberto, o essencial passar dos 50% no primeiro mês. Isso não invalida o método — é o próprio método mostrando onde está o aperto real. Duas saídas práticas:",
        ],
        list: {
          ordered: true,
          items: [
            "**Revisar o essencial primeiro**: contratos de internet e plano de saúde às vezes têm opções mais baratas com a mesma cobertura; vale comparar antes de cortar o resto.",
            "**Usar uma variação temporária**: famílias com renda mais apertada às vezes usam 60-20-20 (60% essencial, 20% estilo de vida, 20% reserva) até o essencial caber melhor — o importante é nunca abrir mão dos 20% de reserva e dívidas, mesmo reduzindo o estilo de vida a zero por um tempo.",
          ],
        },
      },
      {
        heading: "Um exemplo prático com números",
        paragraphs: [
          "Uma família com renda líquida de R$ 4.500 por mês aplicaria assim:",
        ],
        list: {
          ordered: false,
          items: [
            "Essencial (50%): até R$ 2.250 — aluguel, contas, mercado, transporte para o trabalho.",
            "Estilo de vida (30%): até R$ 1.350 — lazer, streaming, restaurante.",
            "Reserva e dívidas (20%): pelo menos R$ 900 — divididos entre guardar e pagar dívidas ativas.",
          ],
        },
      },
    ],
    faq: [
      {
        q: "O cálculo usa renda bruta ou líquida?",
        a: "Líquida — o valor que realmente cai na conta depois de descontos como INSS e imposto de renda. Usar a renda bruta infla os três limites e faz o essencial parecer que cabe quando na prática não cabe.",
      },
      {
        q: "E se a renda da família for variável (freelas, comissão)?",
        a: "Calcule os três limites com base na média dos últimos 3 a 6 meses, não no mês mais alto. Em meses acima da média, o excedente deve reforçar principalmente a reserva de emergência — ela é o que sustenta os meses mais fracos.",
      },
      {
        q: "É normal o essencial passar de 50% da renda?",
        a: "É comum, especialmente com aluguel alto ou dívidas em aberto, mas é um sinal para agir — seja revisando contas, seja usando uma divisão temporária mais generosa no essencial até a situação melhorar.",
      },
      {
        q: "Os 20% de reserva e dívidas são só para guardar dinheiro?",
        a: "Não — essa fatia cobre tanto guardar para a reserva de emergência quanto pagar dívidas ativas. Se há dívida cara em aberto, a prioridade dentro desses 20% costuma ser quitar a dívida antes de acumular reserva, porque o juro da dívida geralmente supera qualquer rendimento de investimento.",
      },
      {
        q: "Preciso acertar os três números com exatidão todo mês?",
        a: "Não. O 50-30-20 é uma referência para decidir onde focar, não uma meta que precisa fechar centavo a centavo. O que importa é a tendência ao longo dos meses, não a perfeição em um mês isolado.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

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
  /** Categoria/eyebrow curto exibido acima do título nos cards. */
  category: string;
  /** URL da imagem de capa (via .asset.json + assetUrl). */
  coverImage: string;
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
    publishedISO: "2026-06-01",
    readingMinutes: 7,
    category: "Guia prático",
    coverImage: "organizar-financas",

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
    publishedISO: "2026-04-14",
    readingMinutes: 8,
    category: "Dívidas",
    coverImage: "sair-dividas",

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
    publishedISO: "2026-05-13",
    readingMinutes: 7,
    category: "Método",
    coverImage: "metodo-50-30-20",

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
  {
    slug: "quanto-guardar-reserva-emergencia",
    title: "Quanto guardar de reserva de emergência: o número certo pra sua família",
    metaDescription:
      "Descubra quanto guardar de reserva de emergência considerando sua renda, o tipo de trabalho e quantas rendas existem em casa — com fórmula prática e exemplo em reais.",
    excerpt:
      "3 meses? 6? 12? O número certo de reserva de emergência depende de quem trabalha na casa e como a renda chega. Veja como calcular o seu.",
    publishedISO: "2026-07-15",
    readingMinutes: 7,
    category: "Reserva",
    coverImage: "reserva-emergencia",

    directAnswer:
      "A reserva de emergência ideal cobre entre 3 e 6 meses das despesas essenciais da família — não da renda inteira. Famílias com renda fixa e duas fontes de renda podem ficar nos 3 meses; famílias com renda variável, autônomos ou com uma única fonte de renda em casa devem mirar de 6 a 12 meses. O cálculo é simples: despesas essenciais mensais × número de meses da sua situação.",
    sections: [
      {
        heading: "O que é (e o que não é) uma reserva de emergência",
        paragraphs: [
          "Reserva de emergência é o dinheiro guardado só pra cobrir as despesas essenciais da família se a renda parar de entrar — perda de emprego, um bico que secou, um imprevisto de saúde. Ela não é a reserva pra trocar de carro, viajar ou dar entrada num imóvel: essas são metas, e metas têm prazo e planejamento próprios.",
          "É por isso que, no método 50-30-20, ela mora dentro dos 20% do futuro, junto com o pagamento de dívidas — é dinheiro de proteção, não de projeto.",
        ],
      },
      {
        heading: "Quanto guardar: a fórmula em 2 passos",
        paragraphs: [
          "Não existe um valor fixo em reais que sirva pra toda família — o número certo é sempre relativo às suas despesas. O cálculo tem dois passos:",
        ],
        list: {
          ordered: true,
          items: [
            "**Some suas despesas essenciais mensais**: moradia, contas, mercado, transporte, escola, saúde — os mesmos 50% do método 50-30-20. Não entra o estilo de vida (streaming, lazer, restaurante): numa emergência real, isso é o primeiro a ser cortado.",
            "**Multiplique pelo número de meses da sua situação**: o número certo varia conforme quem trabalha em casa e como a renda chega (veja a tabela abaixo). O resultado é a sua meta de reserva.",
          ],
        },
      },
      {
        heading: "Quantos meses guardar, segundo a sua situação",
        paragraphs: [
          "O número de meses não é igual pra todo mundo — ele depende de quão rápido a família consegue repor a renda se ela parar:",
        ],
        list: {
          ordered: false,
          items: [
            "**Duas rendas fixas em casa (CLT ou estáveis)**: 3 meses costuma bastar — se uma renda para, a outra ainda sustenta o essencial enquanto a situação se resolve.",
            "**Uma única renda fixa sustentando a casa**: 6 meses — não há uma segunda fonte pra segurar o essencial no meio tempo.",
            "**Autônomo, comissionado ou freelancer**: 6 a 12 meses — a renda já é instável no dia a dia, então a reserva precisa cobrir tanto uma emergência quanto um mês fraco de vendas.",
            "**Renda muito variável ou negócio próprio**: 12 meses — quanto mais imprevisível a entrada, maior o colchão necessário pra não entrar em pânico no primeiro mês ruim.",
          ],
        },
      },
      {
        heading: "Onde guardar a reserva (e onde não guardar)",
        paragraphs: [
          "O critério pra reserva de emergência não é rendimento máximo — é liquidez e segurança. Ela precisa estar em algo que você resgata em minutos, sem perder dinheiro, no dia exato em que precisar. Por isso, aplicações com prazo de carência, ações ou fundos com risco de oscilação não servem pra esse dinheiro, mesmo que rendam mais no papel: reserva de emergência não pode estar sujeita a 'hoje não é um bom dia pra vender'.",
          "As opções mais usadas pra isso no Brasil são as de liquidez diária e baixo risco — poupança, CDB com liquidez diária do próprio banco, ou Tesouro Selic. Cada uma tem prós e contras de rendimento, mas o ponto em comum que importa aqui é: dá pra sacar rápido, sem perder o valor guardado.",
        ],
      },
      {
        heading: "Como formar a reserva tendo dívida ativa",
        paragraphs: [
          "É comum a dúvida: guardo reserva ou quito dívida primeiro? Na prática, as duas coisas não são excludentes, mas a ordem importa. O caminho mais seguro costuma ser: primeiro, um colchão inicial pequeno (o equivalente a 1 mês de essencial) — só pra família não precisar recorrer a mais dívida se algo pequeno acontecer no meio do processo. Depois, direcione o esforço pra quitar a dívida mais cara (maior juro) primeiro. Só depois de zerar as dívidas caras é que faz sentido voltar a engordar a reserva até o número final da sua situação.",
          "A lógica é simples: enquanto existe dívida com juro alto em aberto, ela está crescendo mais rápido do que qualquer rendimento da reserva parada — então quitá-la primeiro é o que mais protege o orçamento da família no médio prazo.",
        ],
      },
      {
        heading: "Um exemplo prático com números",
        paragraphs: [
          "Imagine uma família com renda de R$ 5.000 por mês, uma única renda fixa em casa, sem dívidas caras em aberto:",
        ],
        list: {
          ordered: false,
          items: [
            "Despesas essenciais (50% do método): R$ 2.500 por mês.",
            "Situação: uma única renda em casa → meta de 6 meses.",
            "Meta de reserva: R$ 2.500 × 6 = **R$ 15.000**.",
            "Guardando R$ 400 por mês (parte dos 20% do futuro), a família leva cerca de 3 anos e 2 meses pra formar a reserva do zero — e pode acelerar em meses de renda extra, como 13º ou restituição do imposto de renda.",
          ],
        },
      },
      {
        heading: "Reserva formada: e depois?",
        paragraphs: [
          "Quando a meta é atingida, o dinheiro que ia todo mês pra reserva pode ser redirecionado — geralmente pra quitar dívidas restantes ou pra metas de médio prazo, que são guardadas separadas da reserva. Se a reserva precisar ser usada numa emergência de verdade, o passo seguinte é sempre repor o valor gasto assim que a renda normalizar, antes de voltar a gastar nos 30% de estilo de vida com folga.",
        ],
      },
    ],
    faq: [
      {
        q: "13º salário e FGTS contam como parte da reserva de emergência?",
        a: "Não devem ser contados como reserva já formada, porque não estão disponíveis a qualquer momento — o FGTS tem acesso restrito e o 13º só cai em datas fixas. Eles são ótimos pra acelerar a formação da reserva quando caem, mas a reserva em si precisa estar em algo de liquidez imediata.",
      },
      {
        q: "Reserva de emergência substitui um seguro?",
        a: "Não — elas se complementam. A reserva cobre imprevistos menores e rápidos (um conserto, um mês sem renda). Um seguro (de vida, saúde, residencial) cobre riscos grandes que o dinheiro guardado sozinho não daria conta de bancar, como uma internação longa.",
      },
      {
        q: "Preciso quitar todas as minhas dívidas antes de começar a reserva?",
        a: "Não todas — mas vale montar um colchão inicial pequeno (1 mês de essencial) antes de focar 100% nas dívidas, pra família não precisar se endividar de novo por causa de um imprevisto pequeno no meio do caminho. Depois desse colchão, priorize as dívidas com juro mais alto e só depois volte a completar a reserva.",
      },
      {
        q: "Reserva de emergência rende, ou fica parada perdendo valor?",
        a: "As opções recomendadas pra reserva (poupança, CDB de liquidez diária, Tesouro Selic) rendem, sim — só que menos do que investimentos de maior risco, porque o critério aqui é segurança e acesso rápido, não rendimento máximo. O objetivo da reserva não é multiplicar dinheiro, é estar disponível no momento exato em que a família precisar.",
      },
      {
        q: "E se a renda da família for variável (freelas, comissão)?",
        a: "Use a média dos últimos 3 a 6 meses pra calcular as despesas essenciais, e fique na faixa de 6 a 12 meses de reserva — quanto mais instável a renda, mais perto de 12. É justamente a variação da renda que torna a reserva mais necessária, não menos.",
      },
    ],
  },
  {
    slug: "financas-de-casal-sem-planilha",
    title: "Finanças de casal sem planilha: como organizar o dinheiro a dois",
    metaDescription:
      "Como organizar as finanças de casal sem depender de planilha: os 3 modelos de divisão mais comuns, como dividir quando a renda é diferente entre os dois, e como aplicar o 50-30-20 a dois.",
    excerpt:
      "Dividir contas a dois não devia significar discussão nem planilha que só um dos dois sabe mexer. Veja os modelos mais usados e como aplicar o 50-30-20 quando duas rendas entram na mesma casa.",
    publishedISO: "2026-07-16",
    readingMinutes: 7,
    category: "Casal",
    coverImage: "casal-sem-planilha",

    directAnswer:
      "Organizar as finanças de casal sem planilha começa por escolher um modelo de divisão — conta conjunta total, contas separadas com uma conta comum pra despesas do casal, ou contribuição proporcional à renda de cada um — e depois aplicar o método 50-30-20 sobre a renda combinada da casa. O que substitui a planilha não é abrir mão do controle, é ter os dois lançando e vendo o mesmo painel em tempo real, sem depender de um dos dois lembrar de atualizar um arquivo.",
    sections: [
      {
        heading: "Por que a planilha do casal costuma travar (e não é falta de organização)",
        paragraphs: [
          "Toda planilha financeira de casal começa igual: um dos dois monta, formata bonito, explica pro outro como preencher. Duas semanas depois, só uma pessoa está atualizando — e ela é quem carrega sozinha o peso de saber pra onde foi o dinheiro dos dois.",
          "O problema não é falta de disciplina. É que uma planilha não avisa em tempo real quando o outro gasta, não notifica, não sincroniza — cada atualização depende de alguém lembrar de abrir o arquivo e digitar. Isso vira fonte de atrito: 'você não me falou que tinha gasto isso' é quase sempre um problema de visibilidade, não de confiança.",
        ],
      },
      {
        heading: "Os 3 modelos de divisão mais comuns entre casais",
        paragraphs: [
          "Não existe um modelo certo — existe o que se encaixa na realidade de cada casal. Os três mais usados:",
        ],
        list: {
          ordered: false,
          items: [
            "**Conta conjunta total**: toda a renda dos dois cai numa conta só, e as despesas (do casal e pessoais) saem dela. Simples de acompanhar, mas exige alinhamento alto sobre gasto individual.",
            "**Contas separadas + conta comum**: cada um mantém a própria conta e transfere uma parte combinada pra uma conta só de despesas do casal (aluguel, mercado, contas fixas). Preserva autonomia sobre o resto da renda.",
            "**Contribuição proporcional à renda**: cada um contribui pra conta comum na mesma proporção que ganha, não o mesmo valor fixo. Costuma ser o modelo mais sentido como justo quando as rendas são bem diferentes.",
          ],
        },
      },
      {
        heading: "Como aplicar o 50-30-20 quando são duas rendas",
        paragraphs: [
          "O método continua o mesmo, mas a base de cálculo passa a ser a renda combinada da casa, não a renda de cada um isolada. Some tudo que entra (dos dois) e divida em 50% essencial, 30% estilo de vida, 20% reserva e dívidas — só que agora o essencial e a reserva geralmente são compromissos do casal, e o estilo de vida pode ter uma parte compartilhada (lazer a dois) e uma parte individual (o que cada um gasta sozinho).",
          "Quando as rendas são muito diferentes, vale decidir explicitamente se a divisão das despesas comuns vai ser 50/50 ou proporcional à renda — os dois funcionam, o problema é não decidir e deixar no automático, porque aí um dos dois costuma sentir que está pagando mais do que devia.",
        ],
      },
      {
        heading: "O que muda quando os dois veem o mesmo painel",
        paragraphs: [
          "A diferença entre planilha e um painel compartilhado em tempo real não é estética — é que o lançamento de um aparece pro outro sem precisar avisar. Isso tira a carga mental de ser 'o financeiro da relação' de cima de uma pessoa só, porque os dois enxergam o mesmo número ao mesmo tempo.",
          "Na prática, isso evita duas brigas clássicas: descobrir um gasto grande só no extrato do banco, e discordar sobre quanto realmente sobrou no mês porque cada um fez a conta de um jeito diferente na cabeça.",
        ],
      },
      {
        heading: "Um exemplo prático com números",
        paragraphs: [
          "Um casal com renda combinada de R$ 8.000 (R$ 5.000 e R$ 3.000), dividindo proporcionalmente:",
        ],
        list: {
          ordered: false,
          items: [
            "Essencial (50%): R$ 4.000 no total — quem ganha R$ 5.000 contribui com R$ 2.500 (a mesma proporção da própria renda), quem ganha R$ 3.000 contribui com R$ 1.500.",
            "Estilo de vida (30%): R$ 2.400 no total — pode ser dividido entre uma parte comum (lazer a dois) e uma parte livre pra cada um gastar como quiser.",
            "Reserva e dívidas (20%): R$ 1.600 — geralmente tratada como meta do casal, guardada na conta comum.",
          ],
        },
      },
      {
        heading: "E quando um dos dois entrou na relação já com dívida?",
        paragraphs: [
          "É comum um dos dois chegar no relacionamento com dívida própria, anterior ao casal. Nesses casos, a prática mais usada é manter essa dívida como responsabilidade individual — sai da parte pessoal da renda de quem a contraiu, sem misturar com os 20% de reserva e dívidas do casal. Dividir essa dívida também é uma escolha válida, desde que seja combinada explicitamente pelos dois, não assumida por padrão.",
        ],
      },
    ],
    faq: [
      {
        q: "Precisamos ter uma conta bancária conjunta pra dividir as finanças?",
        a: "Não. Dá pra aplicar qualquer um dos 3 modelos com contas separadas, usando uma conta comum só pra despesas do casal, ou até sem conta conjunta nenhuma, dividindo por transferência mês a mês. O que importa é que os dois enxerguem o mesmo total, não onde o dinheiro fisicamente fica guardado.",
      },
      {
        q: "Como dividir quando um ganha muito mais que o outro?",
        a: "A divisão proporcional à renda costuma ser sentida como mais justa nesses casos: cada um contribui com a mesma porcentagem da própria renda pras despesas comuns, em vez do mesmo valor em reais. Isso evita que quem ganha menos fique proporcionalmente mais apertado que quem ganha mais.",
      },
      {
        q: "Um consegue ver o gasto individual do outro no app?",
        a: "Depende de como o casal configura — dá pra manter visibilidade total cruzada ou separar o que é despesa comum do que é gasto pessoal de cada um. O importante é os dois combinarem isso antes, não descobrirem no meio do uso.",
      },
      {
        q: "Isso funciona pra namorados que ainda não moram juntos?",
        a: "Funciona, principalmente pra quem já divide despesas recorrentes (viagens, assinaturas, saídas). Não precisa esperar morar junto pra ter visibilidade combinada — só ajuda a evitar surpresa quando chegar a hora de dividir uma conta maior.",
      },
      {
        q: "E se um dos dois simplesmente não gosta de mexer em finanças?",
        a: "É comum um dos dois puxar mais a rotina no início — o ponto é que o painel compartilhado ainda assim mostra pro outro o que está acontecendo, mesmo que ele não seja quem lança os gastos. Isso já resolve boa parte do problema de um se sentir no escuro, mesmo sem os dois participarem igualmente do dia a dia.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

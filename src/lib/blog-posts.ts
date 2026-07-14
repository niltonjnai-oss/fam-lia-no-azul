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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

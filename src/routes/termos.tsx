import { createFileRoute, Link } from "@tanstack/react-router";

import { BlogLayout, InlineText } from "@/components/BlogLayout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Família no Azul" },
      {
        name: "description",
        content:
          "Termos de Uso do Família no Azul: condições de contratação, pagamento, direito de arrependimento e uso do serviço.",
      },
      { property: "og:title", content: "Termos de Uso — Família no Azul" },
      {
        property: "og:description",
        content:
          "Termos de Uso do Família no Azul: condições de contratação, pagamento, direito de arrependimento e uso do serviço.",
      },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
  component: TermosPage,
});

interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: { ordered: boolean; items: string[] };
}

const sections: LegalSection[] = [
  {
    heading: "1. Quem somos",
    paragraphs: [
      "O Família no Azul (\"Aplicativo\") é uma marca operada por **Educar Bem — Grupo Romana Multiplataforma**, inscrita no CNPJ sob o nº **48.570.356/0001-97**, com sede na Rua Campolino Alves, 300, Capoeiras, Florianópolis/SC, CEP 88085-110.",
      "O Serviço é disponibilizado no endereço https://azul.educarbem.com.br. Ao criar uma conta, acessar ou usar o Família no Azul, você concorda com estes Termos de Uso e com a nossa Política de Privacidade. Se você não concordar com algum ponto, não utilize o serviço.",
    ],
  },
  {
    heading: "2. O que é o serviço",
    paragraphs: [
      "O Família no Azul é uma ferramenta de organização financeira familiar: ela aplica o método 50-30-20 sobre a renda informada por você, ajuda a montar reserva de emergência e a priorizar o pagamento de dívidas.",
      "O aplicativo **não se conecta à sua conta bancária, não movimenta dinheiro e não realiza nenhuma transação financeira em seu nome**. Todos os valores (renda, gastos, dívidas) são inseridos manualmente por você. Opcionalmente, você pode importar um arquivo de extrato (CSV/OFX) só pra facilitar o registro dos lançamentos — essa importação é feita no seu próprio navegador, por sua escolha, e não nos dá acesso à sua instituição financeira.",
      "O Família no Azul é uma ferramenta de **organização e educação financeira** — não constitui consultoria de investimentos, assessoria financeira, contábil, jurídica ou qualquer outro serviço regulado. As decisões financeiras tomadas com base nas informações organizadas no aplicativo são de sua exclusiva responsabilidade.",
    ],
  },
  {
    heading: "3. Cadastro e conta",
    paragraphs: [
      "Pra contratar o serviço você precisa ter capacidade civil plena (18 anos completos, ou emancipação nos termos da lei). Você se compromete a fornecer informações verdadeiras, completas e atualizadas no cadastro.",
      "Você é responsável por manter sua senha em sigilo e por tudo que acontecer na sua conta. Avise a gente imediatamente pelo e-mail sac.familianoazul@educarbem.com.br se suspeitar de uso não autorizado.",
    ],
  },
  {
    heading: "4. Modo Casal — conta compartilhada",
    paragraphs: [
      "O plano permite até **2 pessoas por família** (titular e cônjuge/parceiro convidado) compartilhando o mesmo orçamento, cada uma com seu próprio login. Não é permitido revender, sublicenciar ou compartilhar o acesso além do previsto neste item.",
    ],
  },
  {
    heading: "5. Preço, pagamento e prazo de acesso",
    paragraphs: [
      "O acesso ao Família no Azul custa **R$ 67,90**, cobrados em pagamento único, e dá direito a **12 meses de acesso** a partir da confirmação do pagamento.",
      "O pagamento é processado por um terceiro, a plataforma **Kiwify**, que aceita cartão de crédito, Pix e boleto. Não temos acesso aos dados completos do seu cartão — isso é tratado diretamente pelo processador de pagamento.",
      "O acesso **não renova automaticamente**. Próximo do fim dos 12 meses, avisamos por e-mail com antecedência; a continuidade do serviço depende de uma nova contratação feita por você.",
      "Eventuais alterações de preço valem apenas para novas contratações ou renovações futuras — nunca para o período que você já pagou.",
    ],
  },
  {
    heading: "6. Direito de arrependimento e reembolso",
    paragraphs: [
      "Como a contratação é feita pela internet, você tem **7 (sete) dias corridos**, a partir da confirmação do pagamento, pra desistir da compra e pedir reembolso integral, sem necessidade de justificativa — conforme o art. 49 do Código de Defesa do Consumidor e o Decreto nº 7.962/2013.",
      "Pra exercer esse direito, basta enviar um e-mail pra sac.familianoazul@educarbem.com.br dentro do prazo. O reembolso é processado pela Kiwify e costuma cair de volta pelo mesmo meio de pagamento usado na compra.",
      "Após esse prazo de 7 dias, não há reembolso proporcional do período restante, exceto quando exigido por lei ou em caráter de exceção, a critério da empresa.",
    ],
  },
  {
    heading: "7. Uso permitido e condutas proibidas",
    paragraphs: [
      "O serviço deve ser usado apenas para fins pessoais e familiares lícitos. Não é permitido:",
    ],
    list: {
      ordered: false,
      items: [
        "Tentar acessar contas ou dados de outras famílias sem autorização.",
        "Fazer engenharia reversa, copiar ou redistribuir o software, o conteúdo do blog ou qualquer material do Família no Azul.",
        "Usar o serviço de forma fraudulenta, para fins ilícitos, ou de qualquer forma que viole direitos de terceiros.",
        "Burlar os limites de contas do plano (item 4) pra compartilhar acesso com pessoas fora da família.",
      ],
    },
  },
  {
    heading: "8. Propriedade intelectual",
    paragraphs: [
      "A marca \"Família no Azul\", o logotipo, o software, o conteúdo do blog e demais materiais do serviço são de propriedade do Grupo Romana ou usados sob licença. O uso do serviço não transfere a você nenhum direito de propriedade intelectual sobre esses materiais.",
    ],
  },
  {
    heading: "9. Dados pessoais e privacidade",
    paragraphs: [
      "Tratamos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Os detalhes de quais dados coletamos, como usamos e quais são os seus direitos estão na nossa Política de Privacidade.",
    ],
  },
  {
    heading: "10. Disponibilidade e alterações do serviço",
    paragraphs: [
      "Fazemos o possível pra manter o serviço disponível, mas podem ocorrer interrupções pontuais pra manutenção, melhorias ou por motivos fora do nosso controle. Podemos adicionar, alterar ou remover funcionalidades ao longo do tempo, sempre buscando manter ou melhorar a experiência do serviço contratado.",
    ],
  },
  {
    heading: "11. Limitação de responsabilidade",
    paragraphs: [
      "O Família no Azul é uma ferramenta de organização financeira, não uma consultoria. Na máxima extensão permitida pela legislação de proteção ao consumidor, não nos responsabilizamos por decisões financeiras tomadas por você com base nas informações organizadas no aplicativo, nem por danos indiretos decorrentes do uso do serviço — ressalvados os casos de dolo, culpa grave ou outras hipóteses de responsabilidade previstas em lei, que não podem ser afastadas contratualmente.",
    ],
  },
  {
    heading: "12. Cancelamento e rescisão",
    paragraphs: [
      "Você pode encerrar sua conta a qualquer momento pelo e-mail sac.familianoazul@educarbem.com.br. Fora do prazo de arrependimento (item 6), o cancelamento não gera reembolso proporcional do período já pago.",
      "Podemos suspender ou encerrar contas em caso de violação destes Termos, fraude, uso indevido do serviço ou contestação de pagamento (chargeback) sem justa causa, avisando você sempre que possível.",
    ],
  },
  {
    heading: "13. Alterações destes Termos",
    paragraphs: [
      "Podemos atualizar estes Termos de Uso ao longo do tempo. Mudanças relevantes serão comunicadas por e-mail ou por aviso no aplicativo/site com antecedência razoável. O uso continuado do serviço após a alteração entrar em vigor representa sua concordância com os novos termos.",
    ],
  },
  {
    heading: "14. Legislação aplicável e foro",
    paragraphs: [
      "Estes Termos são regidos pela legislação brasileira, em especial o Código de Defesa do Consumidor (Lei nº 8.078/1990), a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).",
      "Fica eleito o foro do domicílio do consumidor para dirimir eventuais controvérsias decorrentes destes Termos, sem prejuízo do seu direito de optar por outro foro previsto em lei.",
    ],
  },
  {
    heading: "15. Fale conosco",
    paragraphs: [
      "Dúvidas sobre estes Termos? Nosso canal oficial de atendimento (SAC) é o e-mail sac.familianoazul@educarbem.com.br, com resposta em até 5 (cinco) dias úteis.",
    ],
  },
];

function TermosPage() {
  return (
    <BlogLayout>
      <article>
        <h1 className="font-display text-4xl leading-tight tracking-tight text-[#0F2A47] md:text-5xl">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-[#0F2A47]/60">Última atualização: 16 de julho de 2026</p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl leading-tight tracking-tight text-[#0F2A47] md:text-3xl">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[17px] leading-[1.75] text-[#0F2A47]/85">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>
                    <InlineText text={p} />
                  </p>
                ))}
                {section.heading.startsWith("9.") && (
                  <p>
                    <Link to="/privacidade" className="font-semibold text-[#0F2A47] underline">
                      Leia a Política de Privacidade completa →
                    </Link>
                  </p>
                )}
              </div>
              {section.list && (
                <ul
                  className={`mt-4 space-y-2.5 text-[17px] leading-[1.7] text-[#0F2A47]/85 ${
                    section.list.ordered ? "list-decimal" : "list-disc"
                  } marker:text-orange-500 marker:font-semibold pl-6`}
                >
                  {section.list.items.map((item, i) => (
                    <li key={i} className="pl-1">
                      <InlineText text={item} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </BlogLayout>
  );
}

import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { BlogLayout } from "@/components/BlogLayout";

const LP_BACKGROUND = "linear-gradient(180deg, #E6F2FB 0%, #D6EAF8 40%, #EAF4FC 100%)";

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

function TermosPage() {
  return (
    <BlogLayout>
      <article>
        <h1 className="font-display text-4xl leading-tight tracking-tight text-[#0F2A47] md:text-5xl">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-[#0F2A47]/60">Última atualização: 16 de julho de 2026</p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-[#0F2A47]/85">
          <Section title="1. Quem somos">
            <p>
              O Família no Azul "Aplicativo" é uma marca operada por Educar Bem — Grupo Romana
              Multiplataforma, inscrita no CNPJ sob o nº 48.570.356/0001-97, com sede na Rua
              Campolino Alves, 300, Capoeiras, Florianópolis/SC, CEP 88085-110.
            </p>
            <p>O Serviço é disponibilizado no endereço https://azul.educarbem.com.br.</p>
            <p>
              Canal oficial de atendimento (SAC): sac.familianoazul@educarbem.com.br, com resposta
              em até 5 dias úteis.
            </p>
          </Section>

          <Section title="2. Aceitação destes Termos">
            <p>
              Ao criar uma conta, acessar ou usar o Aplicativo, você declara que leu, entendeu e
              concorda integralmente com estes Termos de Uso e com a Política de Privacidade.
            </p>
            <p>Se você não concorda com qualquer cláusula, não utilize o Serviço.</p>
            <p>
              Estes Termos são um contrato de adesão celebrado entre você ("Usuário") e o Grupo
              Romana, e a relação é regida pelo Código de Defesa do Consumidor (Lei nº 8.078/1990),
              pelo Marco Civil da Internet (Lei nº 12.965/2014), pela Lei Geral de Proteção de
              Dados (Lei nº 13.709/2018) e pelo Decreto nº 7.962/2013.
            </p>
          </Section>

          <Section title="3. Requisitos para usar o Serviço">
            <p>Para criar uma conta, você declara que:</p>
            <p>a) é maior de 18 anos e plenamente capaz para os atos da vida civil;</p>
            <p>b) fornece informações verdadeiras, exatas e atualizadas;</p>
            <p>c) realizou a compra do acesso e teve o pagamento aprovado.</p>
            <p>
              O Serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente dados
              de crianças e adolescentes. Se identificarmos cadastro de menor, a conta será
              encerrada e os dados eliminados.
            </p>
          </Section>

          <Section title="4. O que o Serviço é - e o que não é">
            <h3 className="font-semibold text-[#0F2A47]">4.1 O que oferecemos</h3>
            <p>
              O Família no Azul é uma ferramenta de registro e visualização de informações
              financeiras domésticas, que permite ao Usuário:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>registrar receitas e despesas do mês;</li>
              <li>visualizar a distribuição do orçamento segundo o método 50-30-20;</li>
              <li>acompanhar meta e progresso de reserva de emergência;</li>
              <li>registrar dívidas e visualizar simulações e comparações de custo;</li>
              <li>cadastrar contas recorrentes e receber lembretes por e-mail;</li>
              <li>importar extratos em formato CSV/OFX;</li>
              <li>compartilhar o orçamento com outro membro da família (Modo Casal).</li>
            </ul>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">
              4.2 O que NÃO somos — leia com atenção
            </h3>
            <p className="border-l-4 border-orange-500 bg-orange-50 p-4 italic">
              O Família no Azul não presta consultoria, assessoria ou recomendação financeira, de
              investimentos, de crédito, contábil, tributária ou jurídica.
            </p>
            <p>Especificamente:</p>
            <p>
              a) Não somos instituição financeira, de pagamento ou correspondente bancário. Não
              custodiamos, transferimos, investimos nem movimentamos dinheiro do Usuário. O
              Aplicativo não se conecta a contas bancárias e não executa transações.
            </p>
            <p>
              b) Não somos consultores de valores mobiliários nos termos da Resolução CVM nº
              19/2021. Nada no Aplicativo constitui recomendação de compra, venda ou manutenção de
              qualquer investimento.
            </p>
            <p>
              c) O método 50-30-20 é uma referência educacional de uso público, e não uma
              prescrição personalizada para a sua situação. Os percentuais são padrões gerais,
              ajustáveis pelo Usuário, e podem não ser adequados ao seu caso concreto.
            </p>
            <p>
              d) As simulações do módulo de dívidas (cálculo de juro real, semáforo de risco,
              simulador de negociação) são estimativas matemáticas baseadas exclusivamente nos
              dados que o Usuário informou. Não substituem a consulta ao contrato firmado com o
              credor, nem garantem qualquer resultado em negociação.
            </p>
            <p>
              e) Toda decisão financeira é exclusiva do Usuário. O Aplicativo organiza e apresenta
              informação; quem decide é você. Recomendamos consultar profissional habilitado
              (contador, advogado, planejador financeiro certificado) antes de decisões relevantes.
            </p>
            <p>
              f) Não garantimos resultado econômico algum - quitação de dívidas, formação de
              reserva, equilíbrio orçamentário ou economia de qualquer valor. Os resultados
              dependem da conduta do Usuário e de fatores fora do nosso controle.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">4.3 Precisão dos dados</h3>
            <p>
              O Aplicativo processa os dados que o próprio Usuário insere ou importa. Não
              verificamos, auditamos nem validamos essas informações junto a bancos, credores ou
              terceiros. Cálculos e gráficos refletem os dados fornecidos - dados incorretos
              produzem resultados incorretos.
            </p>
          </Section>

          <Section title="5. Cadastro e conta">
            <h3 className="font-semibold text-[#0F2A47]">5.1 Liberação do acesso</h3>
            <p>
              O cadastro só é liberado após a confirmação de pagamento aprovado pela plataforma de
              checkout (Kiwify). O acesso é pessoal e intransferível.
            </p>
            <h3 className="mt-4 font-semibold text-[#0F2A47]">
              5.2 Responsabilidade pelas credenciais
            </h3>
            <p>
              Você é responsável por manter a confidencialidade da sua senha e por toda atividade
              realizada na sua conta. Comunique imediatamente qualquer uso não autorizado pelo
              canal de SAC.
            </p>
            <h3 className="mt-4 font-semibold text-[#0F2A47]">5.3 Uma conta por pessoa</h3>
            <p>
              É vedado criar múltiplas contas para burlar a cobrança, compartilhar credenciais com
              terceiros fora do Modo Casal, ou revender/ceder o acesso.
            </p>
          </Section>

          <Section title="6. Modo Casal - compartilhamento de orçamento">
            <p>
              O Modo Casal permite que dois membros da mesma família compartilhem um único
              orçamento, cada um com login próprio.
            </p>
            <p>
              Ao ativar o Modo Casal ou aceitar um convite, você declara estar ciente e de acordo
              que:
            </p>
            <p>
              a) os lançamentos, valores, categorias e demais informações financeiras que você
              registrar no orçamento compartilhado ficarão visíveis ao outro membro, e vice-versa;
            </p>
            <p>
              b) esse compartilhamento é voluntário e consentido por ambos, e constitui a
              finalidade essencial do recurso;
            </p>
            <p>
              c) o membro que envia o convite declara ter autorização do convidado para informar o
              e-mail dele;
            </p>
            <p>
              d) o convidado tem acesso ao orçamento sem necessidade de nova compra, e seu acesso
              vigora enquanto vigorar o plano do titular;
            </p>
            <p>
              e) não nos responsabilizamos por conflitos, desentendimentos ou consequências
              pessoais, patrimoniais ou familiares decorrentes da visualização recíproca de
              informações - o recurso existe justamente para dar transparência ao casal, e essa é a
              escolha de quem o ativa.
            </p>

            <h3 className="mt-4 font-semibold text-[#0F2A47]">
              6.1 Encerramento do compartilhamento
            </h3>
            <p>
              Qualquer um dos membros pode revogar o compartilhamento a qualquer momento nas
              configurações da conta ou solicitando pelo SAC. A revogação:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>interrompe o acesso futuro do outro membro ao orçamento compartilhado;</li>
              <li>
                não apaga retroativamente os dados já visualizados ou eventualmente exportados pelo
                outro membro;
              </li>
              <li>não gera direito a reembolso proporcional fora da hipótese da Cláusula 8.</li>
            </ul>
            <p>
              Em caso de separação, divórcio, litígio ou pedido conflitante entre os membros, o
              titular original da compra mantém a conta e os dados do orçamento, e o membro
              convidado poderá solicitar a exclusão dos seus próprios dados pessoais nos termos da
              LGPD.
            </p>
          </Section>

          <Section title="7. Preço, pagamento e renovação">
            <p>
              a) O acesso ao Família no Azul é adquirido em pagamento único, que garante 12 (doze)
              meses de acesso contados da aprovação do pagamento.
            </p>
            <p>
              b) Não se trata de assinatura com renovação automática recorrente. Antes do término
              do período de 12 meses, você será comunicado por e-mail sobre a expiração e sobre as
              condições de renovação, que dependerá de nova contratação ativa da sua parte.
            </p>
            <p>
              c) O pagamento é processado pela Kiwify (plataforma de terceiro), sujeita aos termos
              e à política de privacidade dela. Não armazenamos dados completos de cartão de
              crédito.
            </p>
            <p>
              d) Os preços podem ser alterados a qualquer tempo, mas alterações não afetam períodos
              já contratados e pagos.
            </p>
            <p>
              e) Findo o prazo de 12 meses sem renovação, o acesso ao Aplicativo é suspenso. Seus
              dados permanecerão armazenados por 12 meses para eventual reativação, após o que
              poderão ser eliminados, ressalvado o direito de solicitar exportação antes disso.
            </p>
          </Section>

          <Section title="8. Direito de arrependimento e garantia de 7 dias">
            <p>
              Nos termos do artigo 49 do Código de Defesa do Consumidor, você pode desistir da
              contratação no prazo de 7 (sete) dias corridos, contados da data da aprovação do
              pagamento, recebendo a devolução integral do valor pago, sem necessidade de
              justificativa.
            </p>
            <p>
              Para exercer esse direito, basta enviar solicitação para
              sac.familianoazul@educarbem.com.br. O reembolso será processado pela Kiwify no prazo
              e na forma do meio de pagamento originalmente utilizado, em até 7 dias úteis a contar
              da solicitação.
            </p>
            <p>
              O uso do Aplicativo durante o período de 7 dias não afasta o direito de
              arrependimento.
            </p>
          </Section>

          <Section title="9. Uso permitido e condutas vedadas">
            <p>Você concorda em não:</p>
            <p>
              a) usar o Serviço para qualquer finalidade ilícita, fraudulenta ou que viole direitos
              de terceiros;
            </p>
            <p>b) tentar acessar contas, dados ou áreas do sistema sem autorização;</p>
            <p>
              c) realizar engenharia reversa, descompilar, copiar ou criar obra derivada do
              Aplicativo;
            </p>
            <p>d) empregar robôs, scrapers ou meios automatizados para extrair dados da Plataforma;</p>
            <p>e) sobrecarregar, interferir ou comprometer a infraestrutura ou a segurança do Serviço;</p>
            <p>f) revender, sublicenciar, alugar ou explorar comercialmente o acesso;</p>
            <p>
              g) inserir conteúdo ilegal, ofensivo, difamatório ou que viole direito de terceiro nos
              campos de texto livre;
            </p>
            <p>h) usar a marca, o nome ou a identidade visual do Família no Azul sem autorização escrita.</p>
            <p>O descumprimento pode acarretar suspensão ou encerramento da conta, na forma da Cláusula 13.</p>
          </Section>

          <Section title="10. Propriedade intelectual">
            <p>
              Todo o conteúdo do Aplicativo - código-fonte, design, interface, marca, logotipo,
              textos, ilustrações, artigos do blog, metodologia de apresentação e materiais
              educacionais - é de titularidade do Grupo Romana ou de seus licenciantes, protegido
              pela Lei nº 9.610/1998 e pela Lei nº 9.279/1996.
            </p>
            <p>
              Concedemos a você uma licença de uso pessoal, não exclusiva, intransferível e
              revogável, limitada ao período contratado e às finalidades destes Termos. Nenhuma
              cláusula aqui transfere qualquer direito de propriedade intelectual.
            </p>
            <p>
              <strong>Seus dados são seus.</strong> As informações financeiras que você insere
              permanecem de sua titularidade. Utilizamos esses dados exclusivamente para prestar o
              Serviço, nos termos da Política de Privacidade.
            </p>
          </Section>

          <Section title="11. Proteção de dados pessoais (LGPD)">
            <p>
              O tratamento dos seus dados pessoais é regido pela nossa Política de Privacidade, que
              integra estes Termos.
            </p>
            <p>Em síntese:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                tratamos dados para execução do contrato (art. 7º, V, da LGPD) e para cumprimento
                de obrigação legal;
              </li>
              <li>
                os dados financeiros que você registra não são vendidos, cedidos ou compartilhados
                com terceiros para fins publicitários;
              </li>
              <li>
                utilizamos subprocessadores de infraestrutura (Supabase, Vercel, Kiwify)
                estritamente para viabilizar o Serviço;
              </li>
              <li>
                você pode exercer os direitos do art. 18 da LGPD - confirmação, acesso, correção,
                portabilidade, eliminação, informação sobre compartilhamento e revogação de
                consentimento - pelo e-mail sac.familianoazul@educarbem.com.br;
              </li>
              <li>
                mantemos registros de acesso pelo prazo legal de 6 meses, conforme art. 15 do Marco
                Civil da Internet.
              </li>
            </ul>
          </Section>

          <Section title="12. Disponibilidade, alterações e suporte">
            <p>
              a) Empregamos esforços para manter o Serviço disponível de forma contínua, mas não
              garantimos operação ininterrupta ou livre de erros. Podem ocorrer interrupções por
              manutenção, falha de terceiros (provedores de hospedagem, e-mail, checkout), caso
              fortuito ou força maior.
            </p>
            <p>
              b) Podemos modificar, evoluir ou descontinuar funcionalidades. Alterações que reduzam
              significativamente o valor do Serviço contratado serão comunicadas com antecedência
              de 30 dias, e você poderá solicitar reembolso proporcional ao período remanescente.
            </p>
            <p>
              c) O Aplicativo é um PWA e depende do navegador e do dispositivo do Usuário, cuja
              compatibilidade não podemos garantir integralmente.
            </p>
            <p>
              d) Lembretes de vencimento de contas são uma comodidade, não uma garantia. O envio
              depende de serviços de e-mail de terceiros e de filtros antispam. A responsabilidade
              pelo pagamento pontual das suas contas é exclusivamente sua, e não nos
              responsabilizamos por multas, juros ou encargos decorrentes de lembrete não recebido,
              atrasado ou não visualizado.
            </p>
            <p>
              e) Recomendamos que você exporte periodicamente seus dados. Ainda que mantenhamos
              rotinas de backup, não substituímos a cópia própria do Usuário.
            </p>
          </Section>

          <Section title="13. Suspensão e encerramento">
            <h3 className="font-semibold text-[#0F2A47]">13.1 Por você</h3>
            <p>
              Você pode encerrar sua conta a qualquer momento pelas configurações ou pelo SAC.
              Fora da hipótese da Cláusula 8 (7 dias), o encerramento voluntário não gera direito a
              reembolso do período não utilizado.
            </p>
            <h3 className="mt-4 font-semibold text-[#0F2A47]">13.2 Por nós</h3>
            <p>Podemos suspender ou encerrar o acesso, mediante notificação prévia sempre que possível, em caso de:</p>
            <p>a) violação destes Termos, especialmente da Cláusula 9;</p>
            <p>b) fraude, estorno indevido (chargeback) ou inadimplência;</p>
            <p>c) determinação legal ou judicial;</p>
            <p>
              d) descontinuação integral do Serviço - hipótese em que devolveremos o valor
              proporcional ao período remanescente e daremos prazo mínimo de 30 dias para
              exportação dos dados.
            </p>
            <p>
              Em caso de encerramento por violação grave e comprovada, não haverá reembolso, sem
              prejuízo de eventual apuração de perdas e danos.
            </p>
          </Section>

          <Section title="14. Responsabilidade">
            <p>
              Assumimos integralmente as responsabilidades que a legislação consumerista brasileira
              nos impõe, notadamente pelos vícios e defeitos do Serviço (arts. 14, 18 e 20 do CDC).
              Nenhuma cláusula destes Termos exclui ou limita responsabilidade nas hipóteses em que
              a lei brasileira veda tal limitação (art. 25 do CDC).
            </p>
            <p>Dito isso, e nos limites permitidos em lei, não nos responsabilizamos por:</p>
            <p>
              a) decisões financeiras tomadas pelo Usuário com base nas informações organizadas no
              Aplicativo (Cláusula 4.2);
            </p>
            <p>b) incorreção de dados inseridos ou importados pelo próprio Usuário;</p>
            <p>
              c) prejuízos decorrentes de uso indevido das credenciais por culpa exclusiva do
              Usuário ou de terceiro;
            </p>
            <p>
              d) falhas de serviços de terceiros (instituições financeiras, Kiwify, provedores de
              e-mail, operadoras de internet), ressalvada nossa responsabilidade solidária nos
              termos do CDC quando aplicável;
            </p>
            <p>e) conflitos familiares decorrentes do uso consentido do Modo Casal (Cláusula 6);</p>
            <p>f) caso fortuito ou força maior.</p>
          </Section>

          <Section title="15. Alterações destes Termos">
            <p>
              Podemos alterar estes Termos a qualquer tempo. Alterações relevantes serão
              comunicadas por e-mail e/ou aviso no Aplicativo com antecedência mínima de 15 dias da
              entrada em vigor.
            </p>
            <p>
              Se você não concordar com a nova versão, poderá encerrar sua conta antes da vigência
              e solicitar reembolso proporcional ao período remanescente. O uso continuado após a
              entrada em vigor caracteriza concordância.
            </p>
            <p>A data da última atualização consta no topo deste documento.</p>
          </Section>

          <Section title="16. Comunicações">
            <p>
              Você concorda em receber comunicações operacionais por e-mail (lembretes de conta,
              avisos de vencimento do plano, alterações contratuais, segurança) - essenciais à
              execução do contrato e não sujeitas a descadastramento enquanto a conta estiver
              ativa.
            </p>
            <p>
              Comunicações de marketing dependem do seu consentimento e podem ser recusadas a
              qualquer momento pelo link de descadastro.
            </p>
          </Section>

          <Section title="17. Disposições gerais">
            <p>a) A eventual nulidade de uma cláusula não afeta a validade das demais.</p>
            <p>
              b) A tolerância quanto ao descumprimento de qualquer cláusula não constitui novação
              ou renúncia de direito.
            </p>
            <p>
              c) Estes Termos, junto à Política de Privacidade, constituem o acordo integral entre
              as partes quanto ao objeto.
            </p>
            <p>
              d) Você não pode ceder sua posição contratual sem nossa anuência. Podemos ceder estes
              Termos em caso de reorganização societária, mediante comunicação prévia.
            </p>
          </Section>

          <Section title="18. Lei aplicável e foro">
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil.</p>
            <p>
              Fica eleito o foro da comarca do domicílio do Usuário para dirimir controvérsias, em
              observância ao artigo 101, I, do Código de Defesa do Consumidor.
            </p>
            <p>
              Você também pode recorrer à plataforma consumidor.gov.br e aos órgãos de defesa do
              consumidor (PROCON).
            </p>
          </Section>

          <Section title="19. Contato">
            <p>Educar Bem — Grupo Romana Multiplataforma — CNPJ 48.570.356/0001-97</p>
            <p>E-mail: sac.familianoazul@educarbem.com.br</p>
            <p>Site: https://azul.educarbem.com.br</p>
          </Section>
        </div>
      </article>
    </BlogLayout>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2
        className="text-2xl tracking-tight text-[#0F2A47]"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

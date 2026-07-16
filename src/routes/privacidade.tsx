import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { BlogLayout } from "@/components/BlogLayout";

// Fundo azul da landing page (mesmo gradiente do hero), pedido para as páginas legais.
const LP_BACKGROUND = "linear-gradient(180deg, #E6F2FB 0%, #D6EAF8 40%, #EAF4FC 100%)";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Família no Azul" },
      {
        name: "description",
        content:
          "Como o Família no Azul trata seus dados pessoais, em conformidade com a LGPD: quais dados coletamos, para quê, com quem compartilhamos e quais são os seus direitos.",
      },
      { property: "og:title", content: "Política de Privacidade — Família no Azul" },
      {
        property: "og:description",
        content:
          "Como o Família no Azul trata seus dados pessoais, em conformidade com a LGPD.",
      },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <BlogLayout background={LP_BACKGROUND}>
      <article>
        <h1 className="font-display text-4xl leading-tight tracking-tight text-[#0F2A47] md:text-5xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-[#0F2A47]/60">Última atualização: 16 de julho de 2026</p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-[#0F2A47]/85">
          <Section title="1. Quem é o controlador dos seus dados">
            <p>O Família no Azul "Aplicativo" é uma marca operada por:</p>
            <p>
              Educar Bem — Grupo Romana Multiplataforma, CNPJ nº 48.570.356/0001-97, Rua Campolino
              Alves, 300 - Capoeiras - Florianópolis/SC - CEP 88085-110 - Site:
              https://azul.educarbem.com.br - E-mail: sac.familianoazul@educarbem.com.br
            </p>
            <p>
              Somos o controlador dos seus dados pessoais, nos termos do art. 5º, VI, da Lei nº
              13.709/2018 (LGPD) — ou seja, somos quem decide as finalidades e os meios do
              tratamento, e quem responde por ele.
            </p>
            <p>
              Esta Política integra os Termos de Uso e se aplica a todo tratamento de dados
              realizado no Aplicativo, no site e nas comunicações relacionadas.
            </p>
          </Section>

          <Section title="2. Encarregado pelo Tratamento de Dados (DPO)">
            <p>
              Nos termos do art. 41 da LGPD, nosso contato administrativo é Nilcenéia Nascimento,
              através do e-mail admin@educarbem.com.br.
            </p>
            <p>
              Esse é o canal de comunicação entre você, nós e a Autoridade Nacional de Proteção de
              Dados (ANPD). Enquanto o canal dedicado não estiver ativo, os pedidos podem ser
              enviados para sac.familianoazul@educarbem.com.br.
            </p>
          </Section>

          <Section title="3. Quais dados tratamos">
            <h3 className="font-semibold text-[#0F2A47]">3.1 Dados que você nos fornece</h3>
            <p>
              <strong>Cadastro e conta:</strong>
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>nome;</li>
              <li>e-mail;</li>
              <li>senha (armazenada de forma criptografada - nós não conseguimos ler sua senha);</li>
              <li>e-mail do cônjuge/parceiro, quando você envia um convite do Modo Casal.</li>
            </ul>
            <p>
              <strong>Dados financeiros do orçamento — o núcleo do Serviço:</strong>
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                receitas (salário, trabalho autônomo, pensão, outras entradas) e respectivos
                valores;
              </li>
              <li>despesas, valores, datas, categorias e descrições em texto livre;</li>
              <li>contas fixas e recorrentes, com valores e datas de vencimento;</li>
              <li>
                dívidas: credor, saldo devedor, taxa de juros, número de parcelas, condições
                informadas;
              </li>
              <li>metas de reserva de emergência e progresso;</li>
              <li>ajustes que você fizer nos percentuais do método 50-30-20.</li>
            </ul>
            <p>
              <strong>Arquivos importados:</strong> extratos em formato CSV ou OFX que você optar
              por enviar. Esses arquivos podem conter histórico de transações, identificação de
              estabelecimentos, datas e valores. Processamos exclusivamente o conteúdo do arquivo
              que você mesmo enviou — não buscamos nada no seu banco.
            </p>
            <p>
              <strong>Atendimento:</strong> conteúdo das mensagens que você envia ao SAC e os dados
              de contato que constem nelas.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">3.2 Dados coletados automaticamente</h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Registros de acesso: endereço IP, data e hora, conforme exigido pelo art. 15 do
                Marco Civil da Internet (Lei nº 12.965/2014);
              </li>
              <li>
                Dados técnicos: tipo e versão do navegador, sistema operacional, tipo de
                dispositivo, idioma;
              </li>
              <li>Dados de uso: páginas e telas acessadas, funcionalidades utilizadas, datas de acesso;</li>
              <li>Cookies e tecnologias similares: ver Cláusula 9.</li>
            </ul>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">3.3 Dados recebidos de terceiros</h3>
            <p>
              <strong>Kiwify (checkout):</strong> confirmação de pagamento aprovado, e-mail e nome
              do comprador, identificador da transação e status do pedido, recebidos via webhook
              para liberar seu acesso. Não recebemos e não armazenamos o número completo do seu
              cartão de crédito, CVV ou senha bancária — esses dados ficam com a Kiwify e com os
              arranjos de pagamento envolvidos.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">
              3.4 Sobre a natureza dos seus dados financeiros
            </h3>
            <p>
              Sejamos precisos, porque a distinção importa: dados financeiros não se enquadram como
              "dados pessoais sensíveis" na definição do art. 5º, II, da LGPD, que abrange origem
              racial ou étnica, convicção religiosa, opinião política, filiação sindical, dados
              referentes à saúde ou à vida sexual, dado genético e biométrico.
            </p>
            <p>
              Ainda assim, tratamos suas informações financeiras com rigor equivalente ao de dados
              sensíveis, porque reconhecemos o potencial de dano concreto ao titular em caso de
              vazamento. Isso significa acesso restrito, criptografia, minimização e nenhuma
              finalidade comercial secundária.
            </p>
            <p>
              Atenção a um ponto: os campos de descrição em texto livre (de despesas, dívidas ou
              anotações) podem, dependendo do que você escrever, acabar revelando dados sensíveis de
              fato — por exemplo, ao descrever uma despesa como "consulta com psiquiatra", "dízimo"
              ou "contribuição sindical". Recomendamos que você evite detalhar mais do que precisa
              nesses campos.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">3.5 O que NÃO fazemos</h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>não vendemos, alugamos, cedemos ou trocamos seus dados;</li>
              <li>
                não compartilhamos suas informações financeiras com bancos, seguradoras, birôs de
                crédito (Serasa, SPC, Boa Vista) ou fintechs;
              </li>
              <li>não usamos seus dados financeiros para publicidade direcionada, nossa ou de terceiros;</li>
              <li>não fazemos score de crédito nem qualquer classificação sua para uso externo;</li>
              <li>não conectamos o Aplicativo à sua conta bancária (não usamos Open Finance);</li>
              <li>não movimentamos, custodiamos nem investimos seu dinheiro.</li>
            </ul>
          </Section>

          <Section title="4. Para que usamos seus dados e com qual base legal">
            <p>
              A LGPD exige que todo tratamento tenha finalidade específica e base legal (arts. 6º e
              7º). Estas são as nossas:
            </p>
            <DataTable
              headers={["Finalidade", "Dados envolvidos", "Base legal (LGPD)"]}
              rows={[
                ["Criar e manter sua conta; autenticar acesso", "Cadastro", "Execução de contrato - art. 7º, V"],
                [
                  "Prestar o Serviço: registrar lançamentos, calcular o 50-30-20, exibir painel, reserva e módulo de dívidas",
                  "Dados financeiros do orçamento",
                  "Execução de contrato - art. 7º, V",
                ],
                ["Processar extratos CSV/OFX que você enviar", "Arquivos importados", "Execução de contrato - art. 7º, V"],
                ["Liberar acesso após compra aprovada", "Dados da Kiwify", "Execução de contrato - art. 7º, V"],
                [
                  "Compartilhar o orçamento entre os membros no Modo Casal",
                  "Dados financeiros do orçamento",
                  "Consentimento - art. 7º, I",
                ],
                ["Enviar lembretes de vencimento de contas", "Contas recorrentes, e-mail", "Execução de contrato - art. 7º, V"],
                [
                  "Enviar comunicações operacionais (segurança, expiração do plano, mudanças contratuais)",
                  "E-mail",
                  "Execução de contrato - art. 7º, V",
                ],
                ["Prestar atendimento (SAC)", "Cadastro, conteúdo das mensagens", "Execução de contrato - art. 7º, V"],
                [
                  "Guardar registros de acesso",
                  "IP, data e hora",
                  "Cumprimento de obrigação legal - art. 7º, II (c/c art. 15 do Marco Civil)",
                ],
                ["Emitir e guardar documentos fiscais", "Cadastro, dados da transação", "Cumprimento de obrigação legal - art. 7º, II"],
                [
                  "Prevenir fraude, abuso e uso não autorizado; garantir segurança",
                  "Registros de acesso, dados de uso",
                  "Legítimo interesse - art. 7º, IX",
                ],
                [
                  "Melhorar o Aplicativo, corrigir erros e entender uso agregado",
                  "Dados de uso (agregados/pseudonimizados)",
                  "Legítimo interesse - art. 7º, IX",
                ],
                ["Exercer direitos em processo judicial, administrativo ou arbitral", "Conforme necessário", "Art. 7º, VI"],
                ["Enviar novidades e conteúdo de marketing", "E-mail, nome", "Consentimento - art. 7º, I (revogável a qualquer tempo)"],
              ]}
            />
            <p>
              Sobre o legítimo interesse: só o utilizamos para segurança e melhoria do produto,
              sempre com dados de uso - nunca com o conteúdo financeiro do seu orçamento. Realizamos
              o teste de balanceamento previsto no art. 10 da LGPD e mantemos o registro à
              disposição da ANPD.
            </p>
          </Section>

          <Section title="5. Modo Casal - compartilhamento entre membros">
            <p>
              O Modo Casal permite que dois membros da mesma família compartilhem um orçamento, cada
              um com login próprio.
            </p>
            <p>Como funciona, em termos de dados:</p>
            <p>
              a) O membro titular envia um convite informando o e-mail do outro. Ao fazer isso, o
              titular declara ter autorização da pessoa convidada para nos fornecer esse e-mail.
            </p>
            <p>
              b) Ao aceitar o convite e criar sua conta, o convidado consente expressamente com o
              compartilhamento recíproco dos lançamentos do orçamento compartilhado.
            </p>
            <p>
              c) A partir da ativação, os lançamentos, valores, categorias e descrições registrados
              por um membro ficam visíveis ao outro. Essa é a finalidade essencial do recurso - não
              é um efeito colateral.
            </p>
            <p>
              d) Cada membro mantém credenciais próprias e privadas. Um membro não acessa a senha nem
              a conta do outro.
            </p>
            <p>
              e) Ambos são, entre si, responsáveis pelo uso que fizerem da informação visualizada.
              Nosso papel é executar o compartilhamento que vocês consentiram.
            </p>
            <p>
              <strong>Revogação:</strong> qualquer membro pode revogar o consentimento e encerrar o
              compartilhamento a qualquer momento, nas configurações ou pelo SAC. A revogação
              interrompe o acesso futuro do outro membro, mas - e isso é uma limitação técnica
              honesta, não uma escolha nossa - não apaga o que já foi visualizado, memorizado ou
              exportado. Dados não vistos deixam de ser vistos; dados já vistos não podem ser
              "desvistos".
            </p>
            <p>
              Em caso de separação, litígio ou pedido conflitante entre os membros, cada titular
              preserva o direito de solicitar a eliminação dos seus próprios dados pessoais. O
              tratamento de dados de titularidade conjunta ou disputada será avaliado caso a caso,
              com apoio do Encarregado.
            </p>
          </Section>

          <Section title="6. Com quem compartilhamos seus dados">
            <p>
              Não vendemos seus dados. Compartilhamos apenas o estritamente necessário, e apenas
              nestas hipóteses:
            </p>

            <h3 className="mt-4 font-semibold text-[#0F2A47]">
              6.1 Operadores (prestadores de infraestrutura)
            </h3>
            <p>
              Atuam como operadores (art. 5º, VII, da LGPD): tratam dados sob nossa instrução,
              exclusivamente para viabilizar o Serviço, sem finalidade própria.
            </p>
            <DataTable
              headers={["Operador", "Função", "Dados acessados", "Local"]}
              rows={[
                [
                  "Supabase",
                  "Banco de dados e autenticação",
                  "Cadastro e dados financeiros do orçamento",
                  "Brasil (São Paulo, sa-east-1)",
                ],
                [
                  "Vercel",
                  "Hospedagem e entrega da aplicação",
                  "Registros de acesso, dados técnicos",
                  "Estados Unidos / rede global",
                ],
                [
                  "Kiwify",
                  "Checkout e processamento de pagamento",
                  "Nome, e-mail, dados da transação",
                  "Brasil",
                ],
                [
                  "Resend",
                  "Envio de lembretes e comunicações por e-mail",
                  "Nome, e-mail, referência da conta a vencer",
                  "Estados Unidos",
                ],
              ]}
            />
            <p>
              Exigimos dos operadores compromissos contratuais de segurança e confidencialidade, e
              respondemos solidariamente por eles nos termos do art. 42 da LGPD.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">
              6.2 Parceiro de medição de anúncios (mediante consentimento)
            </h3>
            <p>
              Utilizamos o <strong>Meta Pixel</strong> (Meta Platforms, Inc. - Estados Unidos) para
              medir o alcance e o resultado dos nossos anúncios. Ele só é ativado{" "}
              <strong>após o seu aceite</strong> no banner de cookies, e coleta apenas dados de
              navegação no site público (páginas visitadas e eventos como visualização de página) -{" "}
              <strong>nunca os dados financeiros do seu orçamento</strong>, que sequer ficam
              acessíveis nas páginas onde o Pixel opera. Você pode recusar no banner ou revogar
              depois limpando os cookies do navegador. Ver Cláusula 9.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">6.3 Autoridades</h3>
            <p>
              Podemos compartilhar dados mediante ordem judicial, requisição de autoridade
              competente ou obrigação legal. Sempre que juridicamente possível e não vedado,
              notificaremos você previamente.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">6.4 Reorganização societária</h3>
            <p>
              Em caso de fusão, aquisição ou incorporação, seus dados podem ser transferidos ao
              sucessor, que ficará vinculado a esta Política. Você será comunicado e poderá exercer
              seus direitos, inclusive de eliminação.
            </p>

            <h3 className="mt-6 font-semibold text-[#0F2A47]">6.5 Com o outro membro do Modo Casal</h3>
            <p>Conforme a Cláusula 5, mediante o consentimento de ambos.</p>
          </Section>

          <Section title="7. Transferência internacional de dados">
            <p>
              O núcleo dos seus dados - cadastro e todo o conteúdo financeiro do orçamento - fica
              hospedado no Supabase, em <strong>região no Brasil (São Paulo, sa-east-1)</strong>.
              Ou seja, seus dados financeiros não saem do país.
            </p>
            <p>
              Parte da infraestrutura de apoio, porém, opera fora do Brasil: a hospedagem da
              aplicação (Vercel) e o envio de e-mails (Resend) rodam majoritariamente nos Estados
              Unidos. Isso implica transferência internacional apenas dos dados que passam por esses
              serviços - registros de acesso, dados técnicos, nome e e-mail -, regida pelos arts. 33
              a 36 da LGPD.
            </p>
            <p>
              Essa transferência é realizada com fundamento no art. 33, II, "d" (cláusulas
              contratuais padrão) e/ou no art. 33, VIII (necessária para a execução de contrato do
              qual você é parte), e os fornecedores adotam salvaguardas contratuais de proteção
              compatíveis com a LGPD.
            </p>
          </Section>

          <Section title="8. Segurança da informação">
            <p>
              Adotamos medidas técnicas e administrativas para proteger seus dados (art. 46 da
              LGPD), incluindo:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>criptografia em trânsito (HTTPS/TLS) em toda a comunicação;</li>
              <li>criptografia em repouso no banco de dados;</li>
              <li>senhas armazenadas com hash - não temos acesso à sua senha em texto legível;</li>
              <li>
                isolamento de dados por usuário via políticas de acesso em nível de linha (Row Level
                Security), de modo que um usuário não acesse o orçamento de outro fora do Modo Casal
                consentido;
              </li>
              <li>
                controle de acesso interno restrito, limitado ao estritamente necessário para
                operação e suporte;
              </li>
              <li>registros de acesso e monitoramento;</li>
              <li>rotinas de backup.</li>
            </ul>
            <p>
              Nenhum sistema é 100% seguro, e seria desonesto afirmar o contrário. Se ocorrer
              incidente de segurança com risco ou dano relevante aos titulares, comunicaremos você e
              a ANPD, em prazo razoável, conforme o art. 48 da LGPD.
            </p>
            <p>
              <strong>Sua parte:</strong> use senha forte e exclusiva, não compartilhe credenciais e
              nos avise imediatamente se suspeitar de acesso não autorizado.
            </p>
          </Section>

          <Section title="9. Cookies">
            <p>Utilizamos cookies e tecnologias similares para:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Cookies estritamente necessários</strong> - manter sua sessão autenticada e
                garantir segurança. Sem eles o Aplicativo não funciona; por isso não dependem de
                consentimento.
              </li>
              <li>
                <strong>Cookies de preferência</strong> - lembrar configurações da interface.
              </li>
              <li>
                <strong>Cookies de medição/marketing (Meta Pixel)</strong> - o Meta Pixel (Meta
                Platforms, Inc.) mede o alcance dos nossos anúncios com base na sua navegação pelo
                site público. Ele só é carregado <strong>após o seu aceite</strong> no banner de
                cookies que aparece na primeira visita, e o banner oferece recusa real - recusar
                mantém o Pixel desligado, sem prejuízo do uso do Aplicativo.
              </li>
            </ul>
            <p>
              Você pode rever sua escolha a qualquer momento limpando os cookies e dados do site no
              seu navegador (o banner reaparece) ou gerenciando/bloqueando cookies nas configurações
              do navegador - ciente de que bloquear os necessários impedirá o login.
            </p>
          </Section>

          <Section title="10. Por quanto tempo guardamos seus dados">
            <DataTable
              headers={["Dado", "Prazo de retenção", "Motivo"]}
              rows={[
                ["Cadastro e dados do orçamento", "Enquanto a conta estiver ativa", "Execução do contrato"],
                [
                  "Cadastro e dados do orçamento após expiração do plano sem renovação",
                  "12 meses",
                  "Permitir reativação sem perda de histórico",
                ],
                [
                  "Dados após pedido de exclusão",
                  "Eliminados em até 30 dias, salvo as exceções abaixo",
                  "Direito do titular — art. 18, VI",
                ],
                ["Registros de acesso (IP, data, hora)", "6 meses", "Obrigação legal - art. 15 do Marco Civil"],
                [
                  "Dados fiscais e da transação",
                  "5 anos",
                  "Obrigação legal - legislação fiscal e art. 27 do CDC",
                ],
                ["Dados necessários à defesa em processo", "Até o trânsito em julgado", "Art. 16, II, da LGPD"],
                [
                  "Registros de consentimento",
                  "Enquanto durar o tratamento + prazos legais",
                  "Prova de conformidade",
                ],
              ]}
            />
            <p>Findos os prazos, os dados são eliminados ou anonimizados de forma irreversível.</p>
          </Section>

          <Section title="11. Seus direitos como titular">
            <p>O art. 18 da LGPD garante a você, gratuitamente e a qualquer momento:</p>
            <DataTable
              headers={["Direito", "O que significa"]}
              rows={[
                ["Confirmação e acesso", "Saber se tratamos seus dados e obter cópia deles"],
                ["Correção", "Corrigir dados incompletos, inexatos ou desatualizados"],
                [
                  "Anonimização, bloqueio ou eliminação",
                  "De dados desnecessários, excessivos ou tratados em desconformidade",
                ],
                ["Portabilidade", "Receber seus dados em formato estruturado e interoperável"],
                ["Eliminação", "Excluir dados tratados com base em consentimento, com as ressalvas legais"],
                ["Informação sobre compartilhamento", "Saber com quais entidades compartilhamos seus dados"],
                ["Informação sobre o consentimento", "Saber que pode não consentir e quais as consequências"],
                ["Revogação do consentimento", "Retirar o consentimento a qualquer momento"],
                ["Oposição", "Opor-se a tratamento baseado em legítimo interesse"],
                ["Revisão de decisões automatizadas", "Solicitar revisão humana - ver Cláusula 12"],
              ]}
            />
            <p>
              <strong>Como exercer:</strong> envie pedido para sac.familianoazul@educarbem.com.br ou
              ao Encarregado. Responderemos em até 15 dias para pedidos de acesso (art. 19, II) e em
              prazo razoável nos demais casos. Podemos solicitar confirmação de identidade antes de
              atender - é uma medida de proteção sua, não um obstáculo.
            </p>
            <p>
              <strong>Limites honestos:</strong> a eliminação pode não ser integral quando houver
              obrigação legal de guarda (dados fiscais, registros de acesso) ou necessidade de defesa
              em processo. Nesses casos, informaremos exatamente o que foi mantido e por quê.
            </p>
            <p>
              Você também pode peticionar diretamente à ANPD (https://www.gov.br/anpd) ou a órgãos de
              defesa do consumidor.
            </p>
          </Section>

          <Section title="12. Decisões automatizadas">
            <p>
              O Aplicativo realiza cálculos automatizados - a divisão da renda pelo método 50-30-20,
              o cálculo do juro real de uma dívida, o "semáforo de risco" e a sugestão de qual dívida
              priorizar.
            </p>
            <p>Sobre isso, dois esclarecimentos importantes:</p>
            <p>
              a) Esses cálculos não produzem efeitos jurídicos nem definem seu perfil perante
              terceiros. Não geram score, não são compartilhados com credores e não restringem seu
              acesso a nada. São ferramentas de visualização - quem decide é você.
            </p>
            <p>
              b) Ainda assim, nos termos do art. 20 da LGPD, você pode solicitar informações sobre os
              critérios utilizados e pedir revisão. Escreva ao SAC e explicaremos a lógica do cálculo
              em linguagem clara.
            </p>
          </Section>

          <Section title="13. Dados de crianças e adolescentes">
            <p>
              O Serviço é destinado exclusivamente a maiores de 18 anos e não coletamos
              intencionalmente dados de crianças ou adolescentes.
            </p>
            <p>
              Se você registrar despesas relacionadas a filhos (mensalidade escolar, por exemplo),
              recomendamos não inserir dados pessoais identificáveis do menor - use descrições
              genéricas como "escola" em vez do nome da criança.
            </p>
            <p>Identificado cadastro de menor de 18 anos, a conta será encerrada e os dados eliminados.</p>
          </Section>

          <Section title="14. Alterações nesta Política">
            <p>
              Podemos atualizar esta Política. Mudanças relevantes - especialmente novas
              finalidades, novos operadores ou alteração de bases legais - serão comunicadas por
              e-mail e/ou aviso no Aplicativo com antecedência mínima de 15 dias.
            </p>
            <p>
              Se a mudança exigir novo consentimento, ele será solicitado de forma destacada, e a
              recusa não prejudicará o funcionamento do que você já contratou.
            </p>
            <p>A data da última atualização consta no topo. Recomendamos revisá-la periodicamente.</p>
          </Section>

          <Section title="15. Contato">
            <p>Educar Bem - Grupo Romana Multiplataforma</p>
            <p>CNPJ 48.570.356/0001-97</p>
            <p>Rua Campolino Alves, 300 - Capoeiras - Florianópolis/SC - CEP 88085-110</p>
            <p>SAC: sac.familianoazul@educarbem.com.br - resposta em até 5 dias úteis</p>
            <p>Site: https://azul.educarbem.com.br</p>
            <p>Autoridade Nacional de Proteção de Dados: https://www.gov.br/anpd</p>
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

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-[#0F2A47]/10">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[#0F2A47]/5">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-[#0F2A47]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[#0F2A47]/10 align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#0F2A47]/85">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

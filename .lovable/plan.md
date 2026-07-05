
## Objetivo

Adicionar envio de emails via **Resend** para fluxos de marketing, onboarding, lembretes e notificações educacionais — **sem interferir** nos emails que o Supabase já dispara (confirmação de conta, reset de senha, boas-vindas, pagamentos).

## Separação de responsabilidades

| Tipo de email | Quem envia | Onde fica configurado |
|---|---|---|
| Confirmação de conta, reset de senha, magic link | **Supabase** (como já está) | Painel do Supabase → Auth → Emails |
| Boas-vindas pós-signup, notificações de pagamento | **Supabase** (como já está) | Suas edge functions atuais |
| Onboarding (sequência dias 1, 3, 7…) | **Lovable / Resend** | Server functions no projeto |
| Marketing (novidades, campanhas) | **Lovable / Resend** | Server functions no projeto |
| Lembretes e follow-ups | **Lovable / Resend** | Server functions no projeto |
| Notificações internas / educacionais | **Lovable / Resend** | Server functions no projeto |

**Garantia de não-duplicação:** o Lovable **não vai** se plugar no Auth Hook do Supabase nem sobrescrever templates de auth. Toda a integração fica em código de aplicação novo, isolado sob `src/lib/emails/` e `src/routes/api/`.

## Passo a passo

### 1. Conectar Resend como connector do workspace
Abrir o fluxo do connector Resend. Você escolhe entre:
- **Autorizar via OAuth** (recomendado — Lovable gerencia a chave), ou
- **Colar a API Key** que você já tem no Resend.

Após conectar, a chave fica disponível como `RESEND_API_KEY` no runtime do servidor, junto com `LOVABLE_API_KEY` (já provisionada). Nenhuma chave vaza para o frontend.

### 2. Confirmar domínio de envio
Usar um domínio/remetente já verificado na sua conta Resend (ex.: `no-reply@familianoazul.com.br`). Se preferir subdomínio dedicado para não-transacional (ex.: `news.familianoazul.com.br`), você verifica no Resend antes e me passa o remetente.

### 3. Criar camada de envio isolada
Estrutura nova, sem tocar em nada do Supabase:

```text
src/lib/emails/
  ├── send.ts              → wrapper único que chama o gateway Resend
  ├── templates/
  │   ├── onboarding-dia-1.tsx
  │   ├── onboarding-dia-3.tsx
  │   ├── lembrete-orcamento.tsx
  │   ├── marketing-generico.tsx
  │   └── notificacao-interna.tsx
  └── types.ts             → tipos de payload por template
```

Templates escritos em HTML/JSX com a identidade visual do Família no Azul (logo, tipografia, cores do design system). Cada template recebe props tipadas.

### 4. Endpoints para disparar cada tipo

```text
src/routes/api/emails/
  ├── onboarding.ts        → dispara sequência ao completar cadastro
  ├── lembrete.ts          → chamado por cron/agendador
  ├── marketing.ts         → envio manual (protegido: só admin)
  └── notificacao.ts       → notificações educacionais
```

Cada endpoint:
- Valida input com Zod
- Verifica autenticação/role quando aplicável (marketing = só admin via `has_role`)
- Chama `sendEmail()` do wrapper

### 5. Página de administração (opcional, se quiser)
Uma rota `/admin/emails` para você:
- Ver últimos envios (log)
- Disparar campanha de marketing manualmente
- Testar templates antes de mandar em massa

Só aparece para usuários com role `admin`.

### 6. Agendamento (lembretes / onboarding drip)
Duas opções, você escolhe depois:
- **pg_cron no Supabase** chamando os endpoints públicos `/api/public/emails/*` com um secret compartilhado (mais simples, usa o que você já tem)
- **Cron externo** (ex.: cron-job.org) apontando para os mesmos endpoints

## Detalhes técnicos (para referência)

- Chamadas Resend via gateway: `https://connector-gateway.lovable.dev/resend/emails` com headers `Authorization: Bearer LOVABLE_API_KEY` + `X-Connection-Api-Key: RESEND_API_KEY`.
- Server functions (`createServerFn`) para chamadas autenticadas do próprio app; server routes sob `src/routes/api/public/*` para cron/webhooks (com verificação de assinatura HMAC).
- Nada é adicionado em `auth-context.tsx`, em migrations de auth, ou nos templates do Supabase — a separação é 100% respeitada.

## O que preciso de você antes de codar

1. Confirmar o **remetente** (ex.: `Família no Azul <no-reply@familianoazul.com.br>`).
2. Confirmar se quer **página de admin** para disparo manual de marketing.
3. Confirmar se prefere **pg_cron** (Supabase) ou **cron externo** para lembretes agendados.
4. Quais **templates iniciais** devo já criar (posso começar com: boas-vindas de onboarding dia 1, lembrete de orçamento semanal, e um genérico de marketing).

Depois que você aprovar o plano e responder esses 4 pontos, eu conecto o Resend e implemento a camada de envio + templates iniciais.

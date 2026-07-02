
## Objetivo

Adicionar ao Painel (`/`) uma seção da **assinatura do próprio app Família no Azul**, mostrando quanto tempo falta para vencer (o usuário já comprou via Kiwify, validade de 1 ano) e permitindo **indicar o app com link de desconto**.

## Escopo desta etapa (mock)

Como o schema de assinaturas ainda não existe no Supabase, faço tudo com **dados mock isolados** — quando a integração real com a Kiwify chegar, basta trocar a fonte de dados. UI totalmente pronta.

## Estrutura

### 1. Mock isolado
`src/lib/mockAssinaturaApp.ts`:
- `assinaturaAppMock`: `{ plano: "Anual", dataCompra, dataVencimento (compra + 365d), status: "ativa" | "expirada" }`.
- `indicacaoMock`: `{ codigo: "AZUL10", linkBase: "https://familianoazul.com.br/?ref=", desconto: "10% OFF" }`.
- Helpers: `diasRestantes(dataVencimento)`, `progressoAno(dataCompra, dataVencimento)`.

### 2. Novo componente `src/components/AssinaturaAppCard.tsx`
Card no Painel com dois blocos lado a lado (empilhados no mobile):

**Bloco A — Sua assinatura**
- Título: **"Sua assinatura do Família no Azul"** + badge de status (`success` = Ativa, `warning` ≤ 30 dias, `destructive` = Expirada).
- Destaque grande com número tabular: **"XXX dias restantes"**.
- Linha secundária: `Plano Anual • Vence em DD/MM/AAAA`.
- Barra de progresso (`Progress` shadcn) representando o ano decorrido, com cor do token semântico conforme o status.
- Micro-CTA `Button variant="outline"` **"Renovar assinatura"** (link externo `#` por enquanto — placeholder até termos a URL da Kiwify).

**Bloco B — Indique e ganhe**
- Título: **"Indique o Família no Azul"** + subtítulo curto: *"Seus amigos ganham 10% OFF e você ajuda mais famílias a saírem do vermelho."*
- Campo `Input` readOnly com o link completo (`https://familianoazul.com.br/?ref=AZUL10`).
- Dois botões: **"Copiar link"** (ícone `Copy`, usa `navigator.clipboard.writeText` + `toast` via `sonner`) e **"Compartilhar"** (ícone `Share2`, usa `navigator.share` se disponível, senão fallback para copiar).
- Textos de compartilhamento em pt-BR já prontos: título "Família no Azul" + mensagem "Estou usando o Família no Azul para organizar as finanças da minha casa. Use meu link e ganhe 10% OFF: {link}".

### 3. Integração no Painel
- Em `src/routes/index.tsx`, inserir `<AssinaturaAppCard />` logo abaixo do bloco do topo (após "Lançamento Rápido" e antes dos KPIs), respeitando o sistema de personalização de visibilidade do `PainelExtras` — adiciono a chave `assinaturaApp` com toggle "Assinatura do app".

## Estilo

- Nada hardcoded: cores via tokens semânticos (`success`, `warning`, `destructive`, `primary`, `muted-foreground`).
- Números com `tabular-nums` (padrão já configurado para valores).
- Ícones lucide: `Sparkles` (assinatura), `Gift` (indicação), `Copy`, `Share2`, `ArrowUpRight` (renovar).
- Responsivo: `grid md:grid-cols-2 gap-4` para os dois blocos.

## Fora de escopo (agora)

- Integração real com Kiwify (webhook, tabela `assinatura_app`, checagem server-side de expiração). Fica preparado para plugar no `db.ts` depois.
- Sistema de tracking de indicações (contagem de convites, recompensas). Por ora só o link estático.
- Bloqueio de acesso quando expirar — apenas exibição informativa.

-- Acompanhamento de parcelas na dívida (Nova dívida / Editar dívida).
-- Rodar no SQL Editor do Supabase. Colunas opcionais: dívidas sem
-- parcelamento definido (ex.: cartão rotativo) ficam com NULL.

alter table public.divida
  add column if not exists parcelas_total integer,
  add column if not exists parcelas_pagas integer;

comment on column public.divida.parcelas_total is 'Número total de parcelas do contrato (null = sem parcelamento fixo)';
comment on column public.divida.parcelas_pagas is 'Quantas parcelas já foram pagas';

// Mock data for "Família no Azul" — replace with real Supabase data later.
// Keep all sample values isolated here so screens can be wired to live data
// without touching component code.

export type Classificacao = "essenciais" | "estilo" | "reserva";

export interface CategoriaOrcamento {
  id: string;
  nome: string;
  classificacao: Classificacao;
  previsto: number;
  real: number;
  itens: { descricao: string; valor: number; data: string }[];
}

export interface Divida {
  id: string;
  nome: string;
  total: number;
  parcela: number;
  mesesRestantes: number;
  prioridade?: boolean;
}

export const resumoMes = {
  mes: "Junho de 2026",
  renda: 8500,
  gastos: 6120,
  saldo: 2380,
};

export const distribuicao = [
  { nome: "Essenciais", valor: 3850, meta: 4250, cor: "var(--color-chart-1)" },
  { nome: "Estilo de Vida", valor: 1620, meta: 2550, cor: "var(--color-chart-2)" },
  { nome: "Reserva/Dívidas", valor: 650, meta: 1700, cor: "var(--color-chart-3)" },
];

export const categorias: CategoriaOrcamento[] = [
  {
    id: "moradia",
    nome: "Moradia",
    classificacao: "essenciais",
    previsto: 2200,
    real: 2180,
    itens: [
      { descricao: "Aluguel", valor: 1800, data: "05/06" },
      { descricao: "Condomínio", valor: 380, data: "10/06" },
    ],
  },
  {
    id: "alimentacao",
    nome: "Alimentação",
    classificacao: "essenciais",
    previsto: 1200,
    real: 1340,
    itens: [
      { descricao: "Mercado mensal", valor: 980, data: "08/06" },
      { descricao: "Feira", valor: 360, data: "15/06" },
    ],
  },
  {
    id: "transporte",
    nome: "Transporte",
    classificacao: "essenciais",
    previsto: 500,
    real: 420,
    itens: [{ descricao: "Combustível", valor: 420, data: "12/06" }],
  },
  {
    id: "educacao",
    nome: "Educação",
    classificacao: "essenciais",
    previsto: 800,
    real: 800,
    itens: [{ descricao: "Escola filhos", valor: 800, data: "05/06" }],
  },
  {
    id: "lazer",
    nome: "Lazer",
    classificacao: "estilo",
    previsto: 600,
    real: 720,
    itens: [
      { descricao: "Cinema família", valor: 180, data: "11/06" },
      { descricao: "Restaurante", valor: 540, data: "18/06" },
    ],
  },
  {
    id: "assinaturas",
    nome: "Assinaturas",
    classificacao: "estilo",
    previsto: 200,
    real: 215,
    itens: [{ descricao: "Streamings", valor: 215, data: "01/06" }],
  },
  {
    id: "compras",
    nome: "Compras pessoais",
    classificacao: "estilo",
    previsto: 400,
    real: 685,
    itens: [{ descricao: "Roupas", valor: 685, data: "20/06" }],
  },
  {
    id: "reserva",
    nome: "Reserva de Emergência",
    classificacao: "reserva",
    previsto: 500,
    real: 400,
    itens: [{ descricao: "Aporte mensal", valor: 400, data: "05/06" }],
  },
  {
    id: "dividas",
    nome: "Dívidas",
    classificacao: "reserva",
    previsto: 700,
    real: 700,
    itens: [{ descricao: "Pagamentos do mês", valor: 700, data: "10/06" }],
  },
];

export const dividas: Divida[] = [
  {
    id: "1",
    nome: "Cartão de Crédito Nubank",
    total: 4200,
    parcela: 420,
    mesesRestantes: 10,
    prioridade: true,
  },
  {
    id: "2",
    nome: "Empréstimo Caixa",
    total: 8500,
    parcela: 280,
    mesesRestantes: 30,
  },
  {
    id: "3",
    nome: "Financiamento Geladeira",
    total: 1200,
    parcela: 200,
    mesesRestantes: 6,
  },
];

export const reserva = {
  guardado: 4800,
  meta: 18000,
  custoVidaMensal: 3000,
  multiplicador: 6,
  aporteMensal: 400,
  mesesParaAtingir: Math.ceil((18000 - 4800) / 400),
};

export const conquistas = {
  streakMeses: 4,
  badges: [
    { id: "b1", titulo: "4 meses no azul", ativo: true },
    { id: "b2", titulo: "Reserva iniciada", ativo: true },
    { id: "b3", titulo: "Quitou uma dívida", ativo: false },
  ],
};

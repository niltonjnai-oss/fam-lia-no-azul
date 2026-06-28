import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Wallet, Receipt, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Boas-vindas — Família no Azul" },
      {
        name: "description",
        content: "Configure sua família no app em 3 passos rápidos.",
      },
    ],
  }),
  component: OnboardingPage,
});

const passos = [
  {
    id: 0,
    titulo: "Bem-vindos à Família no Azul",
    descricao:
      "Um controle simples para acompanhar a renda, os gastos e as metas da sua família — sem planilhas confusas.",
    icon: ShieldCheck,
  },
  {
    id: 1,
    titulo: "Qual a renda mensal da família?",
    descricao: "Some todas as fontes de renda fixas do mês.",
    icon: Wallet,
    campo: { label: "Renda mensal", placeholder: "R$ 0,00" },
  },
  {
    id: 2,
    titulo: "Qual o custo de vida mensal?",
    descricao:
      "Contas fixas, mercado, transporte e tudo que é essencial para o mês.",
    icon: Receipt,
    campo: { label: "Custo de vida mensal", placeholder: "R$ 0,00" },
  },
];

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const total = passos.length;
  const atual = passos[step];
  const Icon = atual.icon;

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else navigate({ to: "/" });
  };
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">Família no Azul</span>
          </div>
          <Link
            to="/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Pular
          </Link>
        </div>

        {/* Progress */}
        <div className="mt-6 flex gap-2">
          {passos.map((p) => (
            <div
              key={p.id}
              className={[
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                p.id <= step ? "bg-primary" : "bg-muted",
              ].join(" ")}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Passo {step + 1} de {total}
        </p>

        {/* Conteúdo */}
        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            {atual.titulo}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {atual.descricao}
          </p>

          {atual.campo && (
            <label className="mt-6 block">
              <span className="block text-xs font-medium text-muted-foreground">
                {atual.campo.label}
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder={atual.campo.placeholder}
                className="tabular mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
          )}
          <button
            onClick={next}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
          >
            {step === total - 1 ? "Concluir" : "Avançar"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

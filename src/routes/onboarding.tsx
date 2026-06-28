import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Wallet, Receipt, ArrowRight, ArrowLeft } from "lucide-react";

import {
  inserirRenda,
  atualizarReservaConfig,
  fetchReservaConfig,
  mesAtual,
} from "@/lib/db";

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

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [renda, setRenda] = useState("");
  const [custoVida, setCustoVida] = useState("");
  const navigate = useNavigate();
  const total = 3;

  const concluirMut = useMutation({
    mutationFn: async () => {
      const valorRenda = Number(renda);
      const valorCusto = Number(custoVida);
      if (valorRenda > 0) {
        await inserirRenda({
          mes_ref: mesAtual(),
          descricao: "Renda mensal",
          valor: valorRenda,
        });
      }
      if (valorCusto > 0) {
        const cfg = await fetchReservaConfig();
        if (cfg) {
          await atualizarReservaConfig(cfg.id, { custo_vida_mensal: valorCusto });
        }
      }
    },
    onSuccess: () => navigate({ to: "/" }),
  });

  const passos = [
    {
      titulo: "Bem-vindos à Família no Azul",
      descricao:
        "Um controle simples para acompanhar a renda, os gastos e as metas da sua família — sem planilhas confusas.",
      Icon: ShieldCheck,
      campo: null,
    },
    {
      titulo: "Qual a renda mensal da família?",
      descricao: "Some todas as fontes de renda fixas do mês.",
      Icon: Wallet,
      campo: {
        label: "Renda mensal",
        placeholder: "0,00",
        value: renda,
        onChange: setRenda,
      },
    },
    {
      titulo: "Qual o custo de vida mensal?",
      descricao: "Contas fixas, mercado, transporte e tudo que é essencial para o mês.",
      Icon: Receipt,
      campo: {
        label: "Custo de vida mensal",
        placeholder: "0,00",
        value: custoVida,
        onChange: setCustoVida,
      },
    },
  ];

  const atual = passos[step];
  const Icon = atual.Icon;

  const next = () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      concluirMut.mutate();
    }
  };
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">Família no Azul</span>
          </div>
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Pular
          </Link>
        </div>

        <div className="mt-6 flex gap-2">
          {passos.map((_, i) => (
            <div
              key={i}
              className={[
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-muted",
              ].join(" ")}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Passo {step + 1} de {total}
        </p>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{atual.titulo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{atual.descricao}</p>

          {atual.campo && (
            <label className="mt-6 block">
              <span className="block text-xs font-medium text-muted-foreground">
                {atual.campo.label}
              </span>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={atual.campo.placeholder}
                  value={atual.campo.value}
                  onChange={(e) => atual.campo!.onChange(e.target.value)}
                  className="tabular w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>
          )}

          {concluirMut.isError && (
            <p className="mt-3 text-xs text-danger">
              Não foi possível salvar. Verifique a conexão e tente novamente.
            </p>
          )}
        </div>

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
            disabled={concluirMut.isPending}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
          >
            {step === total - 1 ? (concluirMut.isPending ? "Salvando…" : "Concluir") : "Avançar"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

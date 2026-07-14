import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { blogPosts } from "@/lib/blog-posts";
import { BlogLayout } from "@/components/BlogLayout";

const SITE_URL = "https://azul.educarbem.com.br";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Família no Azul" },
      {
        name: "description",
        content:
          "Artigos sobre organização financeira familiar, método 50-30-20, dívidas e reserva de emergência, sem jargão e sem planilha.",
      },
      { property: "og:title", content: "Blog — Família no Azul" },
      {
        property: "og:description",
        content:
          "Artigos sobre organização financeira familiar, método 50-30-20, dívidas e reserva de emergência, sem jargão e sem planilha.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => b.publishedISO.localeCompare(a.publishedISO));

  return (
    <BlogLayout>
      <header className="pt-6 text-center">
        <span className="t-eyebrow">Blog</span>
        <h1 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
          Educação financeira <em className="italic text-orange-500">pra família de verdade.</em>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#0F2A47]/75">
          Sem jargão de mercado financeiro, sem planilha. Artigos práticos pra organizar o dinheiro
          de casa, no ritmo de quem também tem filho, conta pra pagar e pouco tempo sobrando.
        </p>
      </header>

      <div className="mt-12 space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="block rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-2xl tracking-tight">{post.title}</h2>
            <p className="mt-2 text-sm text-[#0F2A47]/70">{post.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500">
              Ler artigo <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </BlogLayout>
  );
}

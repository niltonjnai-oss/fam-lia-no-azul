import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock } from "lucide-react";

import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import { BlogLayout } from "@/components/BlogLayout";
import { coverUrl } from "@/lib/blog-covers";

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
    links: [
      { rel: "canonical", href: `${SITE_URL}/blog` },
      { rel: "alternate", type: "application/rss+xml", title: "Blog — Família no Azul", href: "/blog/rss.xml" },
    ],
  }),
  component: BlogIndexPage,
});

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => b.publishedISO.localeCompare(a.publishedISO));
  const [featured, ...rest] = posts;

  return (
    <BlogLayout wide>
      {/* Hero */}
      <header className="border-b border-[#0F2A47]/10 pb-10">
        <nav className="text-xs text-[#0F2A47]/60">
          <Link to="/" className="hover:text-[#0F2A47]">Início</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#0F2A47]">Blog</span>
        </nav>
        <h1 className="font-display mt-4 text-4xl leading-tight tracking-tight md:text-5xl">
          Educação financeira <span className="italic text-orange-500">pra família de verdade.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#0F2A47]/70 md:text-lg">
          Sem jargão de mercado financeiro, sem planilha. Artigos práticos pra organizar
          o dinheiro de casa, no ritmo de quem também tem filho, conta pra pagar e pouco tempo sobrando.
        </p>
      </header>

      {/* Post em destaque */}
      {featured && <FeaturedCard post={featured} />}

      {/* Grid dos demais */}
      {rest.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display mb-6 text-2xl tracking-tight text-[#0F2A47]">
            Mais artigos
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </BlogLayout>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group mt-12 grid overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#0F2A47]/5 transition-shadow hover:shadow-lg md:grid-cols-[1.15fr_1fr]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[#EAF2FB] md:aspect-auto">
        <img
          src={coverUrl(post.coverImage)}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="eager"
        />
      </div>
      <div className="flex flex-col justify-center p-8 md:p-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-orange-500">
          <span>Em destaque</span>
          <span className="h-px w-6 bg-orange-500/40" />
          <span className="text-[#0F2A47]/60">{post.category}</span>
        </div>
        <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight text-[#0F2A47] md:text-4xl">
          {post.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#0F2A47]/75">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#0F2A47]/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(post.publishedISO)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min de leitura
          </span>
        </div>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 group-hover:gap-2.5 transition-all">
          Ler artigo <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#0F2A47]/5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[#EAF2FB]">
        <img
          src={coverUrl(post.coverImage)}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
          {post.category}
        </span>
        <h3 className="font-display mt-2 text-xl leading-snug tracking-tight text-[#0F2A47] line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#0F2A47]/70 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-[#0F2A47]/5 pt-4 text-xs text-[#0F2A47]/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(post.publishedISO)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}

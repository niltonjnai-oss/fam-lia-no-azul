import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlogLayout, InlineText } from "@/components/BlogLayout";
import {
  blogPosts,
  getBlogPost,
  type BlogPost,
  type BlogSection,
  type BlogFaqItem,
} from "@/lib/blog-posts";
import { coverUrl } from "@/lib/blog-covers";
import logoHorizontal from "@/assets/familia-no-azul-horizontal-claro.png.asset.json";
import { assetUrl } from "@/lib/asset-url";

const SITE_URL = "https://azul.educarbem.com.br";
const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const logoHorizontalUrl = assetUrl(logoHorizontal);

function buildJsonLdScripts(post: BlogPost, coverUrlValue: string) {
  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: coverUrlValue ? [coverUrlValue] : undefined,
    datePublished: post.publishedISO,
    dateModified: post.updatedISO ?? post.publishedISO,
    author: { "@type": "Organization", name: "Família no Azul" },
    publisher: {
      "@type": "Organization",
      name: "Família no Azul",
      logo: { "@type": "ImageObject", url: logoHorizontalUrl },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const schemas: object[] = [articleSchema, breadcrumbSchema];

  if (post.faq && post.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return schemas.map((schema) => ({
    type: "application/ld+json",
    children: JSON.stringify(schema),
  }));
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) return { meta: [{ title: "Artigo não encontrado — Família no Azul" }] };
    const url = `${SITE_URL}/blog/${post.slug}`;
    const cover = coverUrl(post.coverImage);
    return {
      meta: [
        { title: `${post.title} — Família no Azul` },
        { name: "description", content: post.metaDescription },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        ...(cover ? [{ property: "og:image", content: cover }] : []),
        { property: "article:published_time", content: post.publishedISO },
        { name: "twitter:card", content: "summary_large_image" },
        ...(cover ? [{ name: "twitter:image", content: cover }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: buildJsonLdScripts(post, cover),
    };
  },
  component: BlogPostPage,
});

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BlogPostPage() {
  const post = Route.useLoaderData();
  const cover = coverUrl(post.coverImage);
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <BlogLayout>
      {/* Breadcrumb */}
      <nav className="text-xs text-[#0F2A47]/60">
        <Link to="/" className="hover:text-[#0F2A47]">Início</Link>
        <span className="mx-1.5">/</span>
        <Link to="/blog" className="hover:text-[#0F2A47]">Blog</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#0F2A47]/80">{post.category}</span>
      </nav>

      <article className="mt-6">
        {/* Header */}
        <header className="border-b border-[#0F2A47]/10 pb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
            {post.category}
          </span>
          <h1 className="font-display mt-3 text-4xl leading-[1.15] tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[#0F2A47]/75">
            {post.metaDescription}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#0F2A47]/60">
            <span className="font-medium text-[#0F2A47]/80">Família no Azul</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(post.publishedISO)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min de leitura
            </span>
          </div>
        </header>

        {/* Cover */}
        {cover && (
          <figure className="mt-8">
            <img
              src={cover}
              alt={post.title}
              className="aspect-[16/9] w-full rounded-2xl object-cover shadow-sm ring-1 ring-[#0F2A47]/5"
              width={1600}
              height={900}
            />
          </figure>
        )}

        {/* Direct answer */}
        <div className="mt-10 rounded-xl border-l-4 border-orange-500 bg-white p-6 shadow-sm ring-1 ring-[#0F2A47]/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
            Resumo rápido
          </p>
          <p className="mt-2 text-base leading-relaxed text-[#0F2A47]">
            <InlineText text={post.directAnswer} />
          </p>
        </div>

        {/* Body */}
        <div className="mt-10 space-y-10">
          {post.sections.map((section: BlogSection) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl leading-tight tracking-tight text-[#0F2A47] md:text-3xl">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[17px] leading-[1.75] text-[#0F2A47]/85">
                {section.paragraphs.map((p: string, i: number) => (
                  <p key={i}>
                    <InlineText text={p} />
                  </p>
                ))}
              </div>
              {section.list && (
                <ul
                  className={`mt-4 space-y-2.5 text-[17px] leading-[1.7] text-[#0F2A47]/85 ${
                    section.list.ordered ? "list-decimal" : "list-disc"
                  } marker:text-orange-500 marker:font-semibold pl-6`}
                >
                  {section.list.items.map((item: string, i: number) => (
                    <li key={i} className="pl-1">
                      <InlineText text={item} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-[#0F2A47] p-8 text-center text-white">
          <p className="font-display text-2xl leading-tight">
            Quer aplicar isso sem montar nada sozinho?
          </p>
          <p className="mt-2 text-sm text-white/75">
            O Família no Azul já faz a divisão 50-30-20 automaticamente, sem planilha.
          </p>
          <a
            href="/#planos"
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Quero ver meu dinheiro no azul <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* FAQ */}
        {post.faq && post.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">
              Perguntas frequentes
            </h2>
            <Accordion type="single" collapsible className="mt-5 space-y-2.5">
              {post.faq.map((f: BlogFaqItem, i: number) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-[#0F2A47]/10 bg-white px-5"
                >
                  <AccordionTrigger className="text-left text-base font-semibold text-[#0F2A47] hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-[#0F2A47]/75">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Continue lendo */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-[#0F2A47]/10 pt-10">
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">Continue lendo</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#0F2A47]/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-square w-28 flex-shrink-0 overflow-hidden bg-[#EAF2FB] sm:w-36">
                    <img
                      src={coverUrl(p.coverImage)}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-500">
                      {p.category}
                    </span>
                    <h3 className="font-display mt-1 text-base leading-snug tracking-tight text-[#0F2A47] line-clamp-2 sm:text-lg">
                      {p.title}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
                      Ler artigo <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Ver todos os artigos
          </Link>
        </div>
      </article>
    </BlogLayout>
  );
}

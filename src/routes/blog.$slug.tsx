import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlogLayout, InlineText } from "@/components/BlogLayout";
import { getBlogPost, type BlogPost, type BlogSection, type BlogFaqItem } from "@/lib/blog-posts";
import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";
import { assetUrl } from "@/lib/asset-url";

const SITE_URL = "https://azul.educarbem.com.br";
const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const logoHorizontalUrl = assetUrl(logoHorizontal);

function buildJsonLdScripts(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
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
    return {
      meta: [
        { title: `${post.title} — Família no Azul` },
        { name: "description", content: post.metaDescription },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: post.publishedISO },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: buildJsonLdScripts(post),
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();
  const dataFormatada = new Date(`${post.publishedISO}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <BlogLayout>
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F2A47]/70 hover:text-[#0F2A47]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Blog
      </Link>

      <article className="mt-4">
        <h1 className="font-display text-3xl leading-tight tracking-tight md:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-xs text-[#0F2A47]/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {dataFormatada}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min de leitura
          </span>
        </div>

        <p className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-base leading-relaxed text-[#0F2A47]">
          <InlineText text={post.directAnswer} />
        </p>

        <div className="mt-8 space-y-8">
          {post.sections.map((section: BlogSection) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl tracking-tight">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-base leading-relaxed text-[#0F2A47]/85">
                {section.paragraphs.map((p: string, i: number) => (
                  <p key={i}>
                    <InlineText text={p} />
                  </p>
                ))}
              </div>
              {section.list && (
                <ul
                  className={`mt-3 space-y-2 text-base leading-relaxed text-[#0F2A47]/85 ${
                    section.list.ordered ? "list-decimal" : "list-disc"
                  } pl-5`}
                >
                  {section.list.items.map((item: string, i: number) => (
                    <li key={i}>
                      <InlineText text={item} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* CTA no meio do artigo */}
        <div className="mt-10 rounded-2xl bg-[#0F2A47] p-6 text-center text-white">
          <p className="text-lg font-semibold">
            Quer aplicar isso sem precisar montar nada sozinho?
          </p>
          <p className="mt-1 text-sm text-white/75">
            O Família no Azul já faz a divisão 50-30-20 automaticamente, sem planilha.
          </p>
          <a
            href="/#planos"
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Quero ver meu dinheiro no azul <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {post.faq && post.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl tracking-tight">Perguntas frequentes</h2>
            <Accordion type="single" collapsible className="mt-4 space-y-2">
              {post.faq.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-[#0F2A47]/10 bg-white/70 px-4"
                >
                  <AccordionTrigger className="text-left text-base font-semibold text-[#0F2A47] hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-[#0F2A47]/75">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Ver outros artigos do blog
          </Link>
        </div>
      </article>
    </BlogLayout>
  );
}

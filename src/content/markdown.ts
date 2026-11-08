import { Marked, type Tokens } from "marked";

/**
 * Markdown → HTML for blog articles (server pages and the editor preview).
 *
 * - Raw HTML in the Markdown is escaped (no script injection).
 * - "# Heading" inside an article becomes <h2>: the page title is the only <h1>.
 * - H2/H3 get ids for the table of contents and deep links.
 * - Link options: [text](url){nofollow newtab sponsored ugc}
 *   External links open in a new tab with rel="noopener noreferrer" by default.
 */

export interface LinkInfo {
  href: string;
  text: string;
  external: boolean;
  rel: string[];
}

export interface RenderedArticle {
  html: string;
  headings: { id: string; text: string; depth: 2 | 3 }[];
  links: LinkInfo[];
  images: { src: string; alt: string }[];
  /** Plain text (for word counts and keyword checks). */
  text: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "section";

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;
const LINK_OPTIONS = new Set(["nofollow", "newtab", "sponsored", "ugc"]);

export function isExternal(href: string, siteUrl: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).host !== new URL(siteUrl).host;
  } catch {
    return true;
  }
}

interface AttrLinkToken extends Tokens.Generic {
  type: "attrLink";
  href: string;
  title?: string;
  options: string[];
  tokens: Tokens.Generic[];
}

export function renderMarkdown(markdown: string, siteUrl: string): RenderedArticle {
  const headings: RenderedArticle["headings"] = [];
  const links: LinkInfo[] = [];
  const images: RenderedArticle["images"] = [];
  const usedIds = new Map<string, number>();

  const linkHtml = (
    href: string,
    title: string | null | undefined,
    inner: string,
    plain: string,
    options: string[] = [],
  ) => {
    if (!SAFE_URL.test(href)) return inner; // drop javascript: and friends
    const external = isExternal(href, siteUrl);
    const rel = new Set<string>(options.filter((o) => o !== "newtab"));
    const newTab = external || options.includes("newtab");
    if (newTab) {
      rel.add("noopener");
      rel.add("noreferrer");
    }
    links.push({ href, text: plain, external, rel: [...rel] });
    return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${newTab ? ' target="_blank"' : ""}${
      rel.size ? ` rel="${[...rel].join(" ")}"` : ""
    }>${inner}</a>`;
  };

  const md = new Marked({ gfm: true, breaks: false });
  md.use({
    extensions: [
      {
        name: "attrLink",
        level: "inline",
        start: (src: string) => src.indexOf("["),
        tokenizer(src: string) {
          const m = /^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\{([a-z ]+)\}/.exec(src);
          if (!m) return undefined;
          const options = m[4].split(/\s+/).filter((o) => LINK_OPTIONS.has(o));
          return {
            type: "attrLink",
            raw: m[0],
            href: m[2],
            title: m[3],
            options,
            tokens: this.lexer.inlineTokens(m[1]),
          } satisfies AttrLinkToken;
        },
        renderer(token) {
          const t = token as AttrLinkToken;
          const inner = this.parser.parseInline(t.tokens);
          return linkHtml(t.href, t.title, inner, inner.replace(/<[^>]+>/g, ""), t.options);
        },
      },
    ],
    renderer: {
      html({ text }) {
        return escapeHtml(text);
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const level = Math.min(Math.max(depth, 2), 4) as 2 | 3 | 4;
        const plain = inner.replace(/<[^>]+>/g, "");
        let id = headingId(plain);
        const n = usedIds.get(id) ?? 0;
        usedIds.set(id, n + 1);
        if (n) id = `${id}-${n + 1}`;
        if (level <= 3) headings.push({ id, text: plain, depth: level as 2 | 3 });
        return `<h${level} id="${id}"><a href="#${id}" class="heading-anchor" aria-hidden="true" tabindex="-1">#</a>${inner}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        return linkHtml(href, title, inner, inner.replace(/<[^>]+>/g, ""));
      },
      image({ href, title, text }) {
        if (!SAFE_URL.test(href)) return "";
        images.push({ src: href, alt: text });
        const img = `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />`;
        return title ? `<figure>${img}<figcaption>${escapeHtml(title)}</figcaption></figure>` : img;
      },
    },
  });

  const html = md.parse(markdown, { async: false });
  const text = html
    .replace(/<a [^>]*class="heading-anchor"[^>]*>#<\/a>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { html, headings, links, images, text };
}

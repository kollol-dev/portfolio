import { getContent, getLivePosts } from "@/content/store";
import { SITE_URL } from "@/config/site";
import { postDescription, postPath } from "@/data/blog";

/** llms.txt: a plain-text site summary for AI search tools (see llmstxt.org). */
export async function GET() {
  const [content, posts] = await Promise.all([getContent(), getLivePosts()]);
  const { profile, experience, skills } = content;
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.title} based in ${profile.location}. ${profile.summary}`,
    "",
    "## Pages",
    `- [Portfolio](${SITE_URL}/): experience, projects, certifications, education and contact`,
    `- [Blog](${SITE_URL}/blog): articles on backend engineering`,
    `- [Resume (PDF)](${SITE_URL}${profile.resumePath})`,
    "",
    "## Experience",
    ...experience.map((r) => `- ${r.role}, ${r.company} (${r.start} – ${r.end})`),
    "",
    "## Skills",
    ...skills.map((g) => `- ${g.label}: ${g.items.join(", ")}`),
    "",
    "## Articles",
    ...(posts.length
      ? posts.map((p) => `- [${p.title}](${SITE_URL}${postPath(p)}): ${postDescription(p)}`)
      : ["- None yet"]),
    "",
    "## Contact",
    `- Email: ${profile.email}`,
    ...profile.socials.filter((s) => s.kind !== "email").map((s) => `- ${s.label}: ${s.href}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

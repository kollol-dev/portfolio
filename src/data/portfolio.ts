/**
 * Single source of content for the site.
 *
 * Everything here comes from Kollol-Backend-Developer-Resume.pdf.
 * Anything the resume does not contain is marked with PLACEHOLDER and
 * rendered with a visible dashed style, so gaps are never mistaken for facts.
 * Replace a placeholder by swapping the string (or adding the URL).
 */

export const PLACEHOLDER_PREFIX = "[PLACEHOLDER]";
export const placeholder = (hint: string) => `${PLACEHOLDER_PREFIX} ${hint}`;
export const isPlaceholder = (value: string | undefined | null): boolean =>
  !value || value.startsWith(PLACEHOLDER_PREFIX);

/* ------------------------------------------------------------------ types */

export interface Link {
  label: string;
  /** Omit when unknown — the UI renders a disabled placeholder. */
  href?: string;
}

export interface SocialLink extends Required<Link> {
  kind: "github" | "linkedin" | "email";
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  availability: string;
  headline: string;
  summary: string;
  email: string;
  resumePath: string;
  socials: SocialLink[];
}

export interface Role {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
  stack: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  period: string;
  credentialId: string;
  verifyUrl?: string;
}

export interface Project {
  name: string;
  context: string;
  role: string;
  summary: string;
  architecture: string[];
  challenges: string[];
  stack: string[];
  github?: string;
  live?: string;
  /** Private / proprietary work — explains why links are absent. */
  confidential?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  period: string;
  achievements: string[];
}

export interface Activity {
  kind: "leadership" | "volunteering" | "award";
  title: string;
  organisation: string;
  period: string;
  description: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Portfolio {
  profile: Profile;
  skills: SkillGroup[];
  experience: Role[];
  certifications: Certification[];
  projects: Project[];
  education: Education[];
  activities: Activity[];
  closingStatement: string;
}

/* ------------------------------------------------------------------ data */

const email = "kollol.work@gmail.com";

export const portfolio: Portfolio = {
  profile: {
    name: "Kollol Chakraborty",
    firstName: "Kollol",
    lastName: "Chakraborty",
    title: "Senior Software Engineer",
    location: "Sylhet, Bangladesh",
    availability: placeholder("Availability, e.g. “Open to senior backend roles”"),
    headline: "Backend systems that carry real-world data.",
    summary:
      "Senior software engineer building APIs, data pipelines and event-driven services since 2019, with Node.js, TypeScript, Python and Go. Currently working remotely for a UK team on a platform for real-time and historical disaster data.",
    email,
    resumePath: "/resume.pdf",
    socials: [
      { kind: "github", label: "GitHub", href: "https://www.github.com/kollol-dev" },
      { kind: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/kollol-dev" },
      { kind: "email", label: "Email", href: `mailto:${email}` },
    ],
  },

  skills: [
    {
      label: "Technologies",
      items: ["Node.js", "TypeScript", "Python", "Go", "MongoDB", "MySQL", "PostgreSQL", "GraphQL", "Elasticsearch", "Nuxt", "PHP"],
    },
    { label: "DevOps", items: ["AWS", "Docker", "Linux VPS"] },
    { label: "CI/CD", items: ["GitHub Actions"] },
    { label: "Other", items: ["RabbitMQ", "Socket.io", "DSA"] },
  ],

  experience: [
    {
      company: "Technovative Solutions Limited",
      role: "Senior Software Engineer",
      location: "United Kingdom (Remote)",
      start: "Feb 2023",
      end: "Present",
      highlights: [
        "Built a centralized database for real-time and historical disaster data, using Python and GDAL in ETL pipelines to transform GIS files.",
        "Designed an event-driven architecture that supports both legacy and modern services, improving scalability.",
        "Implemented a large-file upload service (up to 500 MB) that streams to cloud storage and decompresses asynchronously via message queues.",
        "Integrated an ontology-based virtual knowledge graph with the centralized database for real-time data access.",
        "Created a SPARQL query builder so end users can build queries dynamically.",
      ],
      stack: ["Python", "GDAL", "ETL", "Message queues", "Cloud storage", "SPARQL", "Knowledge graphs"],
    },
    {
      company: "Dorik, Inc.",
      role: "Software Engineer",
      location: "Sylhet, Bangladesh",
      start: "Feb 2022",
      end: "Mar 2023",
      highlights: [
        "Developed REST and GraphQL APIs with Node.js and MongoDB, reducing bugs by 80% through end-to-end test coverage.",
        "Implemented Elasticsearch, reducing search query time by 30–35%.",
        "Built CMS features including custom RSS feeds, sitemaps, membership management and client billing.",
        "Created serverless AWS Lambda functions to handle webhooks, improving platform automation.",
      ],
      stack: ["Node.js", "MongoDB", "GraphQL", "REST", "Elasticsearch", "AWS Lambda"],
    },
    {
      company: "Syntaxive",
      role: "Software Engineer",
      location: "Sylhet, Bangladesh",
      start: "Jan 2021",
      end: "Jan 2022",
      highlights: [
        "Designed and developed web applications with Nuxt.js, Adonis.js and MySQL.",
        "Reduced query time by 20% through refactoring and optimization.",
        "Developed real-time chat applications using Socket.io.",
        "Configured remote servers for deployment on a LEMP stack.",
      ],
      stack: ["Nuxt.js", "Adonis.js", "MySQL", "Socket.io", "LEMP"],
    },
    {
      company: "Appifylab",
      role: "Software Engineer",
      location: "Sylhet, Bangladesh",
      start: "Mar 2019",
      end: "Dec 2020",
      highlights: [
        "Built interactive websites with Nuxt.js on the frontend, Adonis.js on the backend and MySQL for data.",
        "Implemented REST APIs for mobile apps and websites, and monitored their performance.",
      ],
      stack: ["Nuxt.js", "Adonis.js", "MySQL", "REST"],
    },
  ],

  certifications: [
    {
      name: "LICT Top-Up IT Training on Android Development",
      issuer: "NESSCOM IT-ITES Sector Skill Council",
      period: "Oct 2017 – Feb 2018",
      credentialId: placeholder("Credential ID"),
    },
    {
      name: "Young Bangla Internship Program",
      issuer: "Microsoft",
      period: "Jan 2018 – Mar 2018",
      credentialId: placeholder("Credential ID"),
    },
  ],

  projects: [
    {
      name: "Disaster Data Platform",
      context: "Technovative Solutions · 2023 – present",
      role: "Senior Software Engineer",
      summary:
        "A centralized store for real-time and historical disaster data, fed by GIS ETL pipelines and exposed through a virtual knowledge graph.",
      architecture: [
        "Event-driven design that lets legacy and modern services run side by side.",
        "Python + GDAL ETL jobs transform GIS files before storage.",
        "Uploads stream straight to cloud storage; decompression runs asynchronously off a message queue.",
        "Ontology-based virtual knowledge graph over the database, queried through a SPARQL builder.",
      ],
      challenges: [
        "Accepting files up to 500 MB without tying up the API.",
        "Letting non-specialist users build SPARQL queries.",
      ],
      stack: ["Python", "GDAL", "Message queues", "SPARQL", "Knowledge graphs"],
      confidential: true,
    },
    {
      name: "Real-time Bus Tracker",
      context: "Leading University · Academic project",
      role: "Developer",
      summary:
        "A real-time bus tracking system that shows live vehicle positions on a map.",
      architecture: [
        "Node.js server pushes location updates to clients over Socket.io.",
        "Positions are rendered with the Google Maps API.",
      ],
      challenges: [placeholder("Main technical challenge on this project")],
      stack: ["Node.js", "Socket.io", "Google Maps API"],
      github: undefined, // PLACEHOLDER: repository URL
    },
    {
      name: placeholder("Project name"),
      context: placeholder("Company or personal · year"),
      role: placeholder("Your role"),
      summary: placeholder("One or two sentences on what it does and for whom."),
      architecture: [placeholder("Key architecture decision")],
      challenges: [placeholder("Hard problem you solved")],
      stack: [],
    },
  ],

  education: [
    {
      institution: "Leading University",
      degree: "B.Sc (Hons.) in Computer Science & Engineering",
      location: "Sylhet, Bangladesh",
      period: "Jan 2015 – Jan 2019",
      achievements: [
        "CGPA 3.35 out of 4.",
        "Developed a real-time bus tracking system using Node.js, Socket.io and the Google Maps API.",
      ],
    },
  ],

  activities: [
    {
      kind: "leadership",
      title: "Vice President & ACM Workshop Coordinator",
      organisation: "Leading University Computer Club",
      period: "May 2018 – Oct 2019",
      description:
        "Organised programming activities including workshops, tech lectures, hackathons and coding challenges.",
    },
    {
      kind: "award",
      title: placeholder("Award or recognition"),
      organisation: placeholder("Issuer"),
      period: placeholder("Year"),
      description: placeholder("What it was for."),
    },
    {
      kind: "volunteering",
      title: placeholder("Volunteering or community role"),
      organisation: placeholder("Organisation"),
      period: placeholder("Period"),
      description: placeholder("What you did."),
    },
  ],

  closingStatement:
    "I like the unglamorous parts of software: the pipelines, queues and schemas that keep working long after launch.",
};

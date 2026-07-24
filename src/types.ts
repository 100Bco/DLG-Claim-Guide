export interface ArticleFrontmatter {
  title: string;
  slug: string;
  topic: string;
  short_answer: string;
  excerpt: string;
  related?: string[];
  sources?: {
    name: string;
    url: string;
  }[];
  statute?: {
    citation: string;
    text: string;
  };
  outbound_link?: {
    url: string;
    anchor: string;
  };
  author: string;
  published: boolean;
  date: string;
  updated?: string;
}

export interface Article {
  content: string;
  data: ArticleFrontmatter;
}

export const TOPICS = [
  {
    id: "personal-injury",
    title: "Personal injury",
    description: "How lawsuits proceed, negligence, and the mechanics of civil injury claims.",
  },
  {
    id: "workers-comp",
    title: "Workers' compensation",
    description: "Navigating workplace injury benefits, claim denials, and the appeals process.",
  },
  {
    id: "insurance-claims",
    title: "Insurance claims",
    description: "Property damage, policy coverage, bad faith, and the claims process.",
  },
  {
    id: "small-claims",
    title: "Small claims & civil procedure",
    description: "Navigating local courts, evidence, hearings, and judgment collection.",
  },
];

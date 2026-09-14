export interface ArticleFrontmatter {
  title: string;
  slug: string;
  topic: string;
  /** Optional accident-type / sub-topic clusters this article surfaces in. */
  clusters?: string[];
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

export interface Cluster {
  /** URL segment, unique within its topic. */
  id: string;
  /** Parent topic id. */
  topic: string;
  title: string;
  description: string;
  /** Slug of the pillar (hub) article for this cluster, if one exists. */
  pillar?: string;
}

/**
 * Accident-type / sub-topic clusters within a parent topic. A cluster page
 * lives at /topic/:topic/:cluster and groups the pillar plus related spokes.
 * Articles opt in via the `cluster` frontmatter field; anything without a
 * matching cluster is shown under a general section on the topic page.
 */
export const CLUSTERS: Cluster[] = [
  {
    id: "car-accidents",
    topic: "personal-injury",
    title: "Car accidents",
    description: "How car accident injury claims work — fault, insurance coverage, and the path to compensation.",
    pillar: "car-accident-claims",
  },
  {
    id: "truck-accidents",
    topic: "personal-injury",
    title: "Truck accidents",
    description: "What makes commercial truck accident claims different, from federal safety rules to multiple responsible parties.",
    pillar: "truck-accident-claims",
  },
  {
    id: "slip-and-fall",
    topic: "personal-injury",
    title: "Slip & fall",
    description: "Premises liability and slip-and-fall claims — when a property owner may be responsible for an injury.",
    pillar: "what-is-premises-liability",
  },
  {
    id: "dog-bites",
    topic: "personal-injury",
    title: "Dog bites",
    description: "How dog bite and animal attack injury claims work, and how owner-liability rules differ by state.",
    pillar: "dog-bite-claims",
  },
  {
    id: "wrongful-death",
    topic: "personal-injury",
    title: "Wrongful death",
    description: "Claims that let a deceased person's survivors seek compensation when a death was caused by another party's wrongful act.",
    pillar: "what-is-a-wrongful-death-claim",
  },
];

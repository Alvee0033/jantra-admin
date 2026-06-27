import "server-only";

import { unstable_cache } from "next/cache";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "https://jontro-backend.onrender.com";

const WORK_ENDPOINT = `${API_ORIGIN}/api/work`;

export interface WorkProject {
  id: string;
  title: string;
  slug: string;
  category: string[] | string;
  description: string;
  thumbnail?: string;
  tags?: string[];
  challenge?: string;
  approach?: string;
  features?: string[];
  techStack?: string[];
  results?: string;
  duration?: string;
  liveUrl?: string;
}

type RawProject = Record<string, unknown>;

function normalizeProject(project: RawProject): WorkProject | null {
  const slug = typeof project.slug === "string" ? project.slug : "";
  const title =
    typeof project.title === "string"
      ? project.title
      : typeof project.name === "string"
        ? project.name
        : "";
  if (!slug || !title) return null;

  return {
    ...project,
    id: String((project.id as string | number | undefined) ?? slug),
    title,
    slug,
    description:
      typeof project.description === "string"
        ? project.description
        : typeof project.summary === "string"
          ? project.summary
          : "",
    category: (project.category as string[] | string | undefined) || [],
    tags: Array.isArray(project.tags)
      ? (project.tags as string[])
      : Array.isArray(project.techStack)
        ? (project.techStack as string[])
        : [],
  };
}

const getCachedWorkProjects = unstable_cache(
  async (): Promise<WorkProject[]> => {
    const response = await fetch(WORK_ENDPOINT, {
      next: { revalidate: 300, tags: ["work-projects"] },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const json = await response.json();
    const raw = json?.data || json || [];
    if (!Array.isArray(raw)) return [];

    return (raw as RawProject[]).map(normalizeProject).filter(Boolean) as WorkProject[];
  },
  ["work-projects"],
  { revalidate: 300 }
);

export async function getWorkProjects(): Promise<WorkProject[]> {
  try {
    return await getCachedWorkProjects();
  } catch {
    return [];
  }
}

export async function getWorkProjectBySlug(slug: string): Promise<WorkProject | null> {
  const projects = await getWorkProjects();
  return projects.find((project) => project.slug === slug) || null;
}

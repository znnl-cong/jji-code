import { DocumentProject } from '@/types';

const STORAGE_KEY = 'jji_projects_v2';

export function getProjects(): DocumentProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return parsed.filter((p: DocumentProject) => p?.businessInput?.itemName);
  } catch {
    return [];
  }
}

export function getProject(id: string): DocumentProject | null {
  return getProjects().find((p) => p.id === id) || null;
}

export function saveProject(project: DocumentProject): void {
  if (typeof window === 'undefined') return;
  const projects = getProjects().filter((p) => p.id !== project.id);
  const updated = [{ ...project, updatedAt: new Date().toISOString() }, ...projects];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 10)));
}

export function deleteProject(id: string): void {
  if (typeof window === 'undefined') return;
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

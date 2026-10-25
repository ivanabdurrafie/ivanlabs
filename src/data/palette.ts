/**
 * ⌘K palette index (server-rendered once, used by both shells).
 * `prefix` routes page/section/project hrefs into the /alt variant.
 */
import { getCollection } from 'astro:content';
import { nav, site, withBase } from './site';

export type PaletteItem = { href: string; label: string; kind: string; idx: string };

/** Sections that live on the About page (both variants use the same ids). */
const aboutSections = [
  { id: 'expertise', label: 'Expertise' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'education', label: 'Education' },
  { id: 'faq', label: 'FAQ' },
];

export async function getPaletteItems(basePath: string, prefix = ''): Promise<PaletteItem[]> {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  const pages: PaletteItem[] = nav.map((n) => ({
    href: withBase(`${prefix}${n.href}`),
    label: n.label,
    kind: 'Page',
    idx: n.index,
  }));

  const sections: PaletteItem[] = aboutSections.map((s, i) => ({
    href: `${basePath}${prefix}/about#${s.id}`,
    label: s.label,
    kind: 'Section',
    idx: String(i + 1).padStart(2, '0'),
  }));

  const projectItems: PaletteItem[] = projects.map((p, i) => ({
    href: `${basePath}${prefix}/work/${p.id}`,
    label: p.data.title,
    kind: 'Project',
    idx: String(i + 1).padStart(2, '0'),
  }));

  const actions: PaletteItem[] = [
    { href: withBase(site.resumeFile), label: 'Download CV', kind: 'Action', idx: '—' },
    { href: `mailto:${site.email}`, label: site.email, kind: 'Contact', idx: '—' },
    { href: site.github, label: '@ivanabdurrafie', kind: 'GitHub', idx: '—' },
    { href: site.linkedin, label: 'Ivan Abdurrafie', kind: 'LinkedIn', idx: '—' },
  ];

  return [...pages, ...sections, ...projectItems, ...actions];
}

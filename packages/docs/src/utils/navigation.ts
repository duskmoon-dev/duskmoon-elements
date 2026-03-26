import type { CollectionEntry } from 'astro:content';

export interface NavItem {
  title: string;
  slug: string;
  order: number;
}

export interface NavSection {
  id: string;
  label: string;
  order: number;
  items: NavItem[];
}

export const sectionConfig: Record<string, { order: number; label: string }> = {
  'getting-started': { order: 1, label: 'Getting Started' },
  'theming': { order: 2, label: 'Theming' },
  'components': { order: 3, label: 'Components' },
  'api': { order: 4, label: 'API' },
};

export function buildNavigation(docs: CollectionEntry<'docs'>[]): NavSection[] {
  // Group docs by section
  const sections: Record<string, NavItem[]> = {};

  docs.forEach((doc) => {
    const section = doc.data.section;
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push({
      title: doc.data.title,
      slug: doc.id,
      order: doc.data.order || 999,
    });
  });

  // Sort items within each section
  Object.keys(sections).forEach((section) => {
    sections[section].sort((a, b) => a.order - b.order);
  });

  // Build sorted section array
  const navSections: NavSection[] = Object.keys(sections)
    .map((sectionId) => ({
      id: sectionId,
      label: sectionConfig[sectionId]?.label || sectionId,
      order: sectionConfig[sectionId]?.order || 999,
      items: sections[sectionId],
    }))
    .sort((a, b) => a.order - b.order);

  return navSections;
}

export function findPrevNext(
  docs: CollectionEntry<'docs'>[],
  currentSlug: string
): { prev: NavItem | null; next: NavItem | null } {
  const navigation = buildNavigation(docs);

  // Flatten all items in order
  const allItems: NavItem[] = navigation.flatMap((section) => section.items);

  const currentIndex = allItems.findIndex((item) => item.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? allItems[currentIndex - 1] : null,
    next: currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null,
  };
}

export function isActivePath(currentPath: string, itemSlug: string): boolean {
  const normalizedCurrent = currentPath.replace(/\/$/, '');
  const normalizedItem = `/docs/${itemSlug}`.replace(/\/$/, '');
  return normalizedCurrent === normalizedItem || normalizedCurrent.endsWith(normalizedItem);
}

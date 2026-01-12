import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional().default(999),
    section: z.enum(['getting-started', 'theming', 'input', 'feedback', 'navigation', 'surfaces', 'data-display', 'api']),
    component: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  docs: docsCollection,
};

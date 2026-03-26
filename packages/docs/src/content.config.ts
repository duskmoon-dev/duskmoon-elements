import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docsCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional().default(999),
    section: z.enum(['getting-started', 'theming', 'input', 'feedback', 'navigation', 'surfaces', 'data-display', 'api', 'art-elements']),
    component: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  docs: docsCollection,
};

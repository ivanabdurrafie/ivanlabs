import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    type: z.string(),
    stack: z.string(),
    metric: z.string(),
    metricLabel: z.string(),
    summary: z.string(),
    impact: z.string(),
    tech: z.array(z.string()),
    icon: z.string(),
    order: z.number(),
  }),
});

export const collections = { projects };

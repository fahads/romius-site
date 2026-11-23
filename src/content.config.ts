import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const base = z.object({
  name: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  draft: z.boolean(), archived: z.boolean(), webflowId: z.string(),
  updatedOn: z.string(), publishedOn: z.string()
});
const location = base.extend({
  address: z.string(), phone: z.string(), website: z.string(), mapUrl: z.string(),
  northwest: z.boolean(), order: z.number(), city: z.string(), image: z.string()
});
export const collections = {
  clinics: defineCollection({loader: glob({pattern:'*.json', base:'./src/content/clinics'}), schema:location.extend({fax:z.string()})}),
  surgeryLocations: defineCollection({loader: glob({pattern:'*.json', base:'./src/content/surgeryLocations'}), schema:location.extend({metro:z.boolean()})}),
  providers: defineCollection({loader: glob({pattern:'*.json', base:'./src/content/providers'}), schema:base.extend({
    type:z.string(), location:z.string(), bio:z.string(), image:z.string(), thumbnail:z.string(),
    order:z.number(), education:z.record(z.string(),z.string()), homeImage:z.string().optional()
  })}),
  conditions: defineCollection({loader: glob({pattern:'*.json', base:'./src/content/conditions'}), schema:base.extend({
    category:z.enum(['Men','Women','']), shortDescription:z.string(), body:z.string()
  })})
};

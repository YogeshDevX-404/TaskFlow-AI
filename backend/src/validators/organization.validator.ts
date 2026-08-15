import { z } from 'zod';

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Automatically generates a clean, URL-safe slug from an organization name
 */
export function generateSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // strip special non-alphanumeric chars
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // strip leading/trailing hyphens
}

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name cannot exceed 100 characters')
    .trim(),
  slug: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toLowerCase() : undefined))
    .refine((val) => !val || SLUG_REGEX.test(val), {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens (e.g. acme-corp)',
    }),
  logo: z.string().optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  timezone: z.string().optional(),
  country: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name cannot exceed 100 characters')
    .trim()
    .optional(),
  slug: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toLowerCase() : undefined))
    .refine((val) => !val || SLUG_REGEX.test(val), {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens (e.g. acme-corp)',
    }),
  logo: z.string().optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  timezone: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['active', 'archived', 'suspended']).optional(),
  isArchived: z.boolean().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

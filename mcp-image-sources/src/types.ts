import { z } from 'zod';

// Common image metadata schema
export const ImageMetadataSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().url().optional(),
  license: z.string(),
  licenseUrl: z.string().url().optional(),
  source: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  tags: z.array(z.string()).optional(),
  downloadUrl: z.string().url().optional(),
});

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;

// Search parameters schema
export const SearchParamsSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).default(1),
  license: z.enum(['public-domain', 'cc0', 'cc-by', 'cc-by-sa', 'any']).optional(),
  orientation: z.enum(['landscape', 'portrait', 'square', 'any']).optional(),
  color: z.string().optional(),
  minWidth: z.number().optional(),
  minHeight: z.number().optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

// Image source interface
export interface ImageSource {
  name: string;
  description: string;
  requiresAuth: boolean;
  supportedLicenses: string[];
  search(params: SearchParams): Promise<ImageMetadata[]>;
  getImage(id: string): Promise<ImageMetadata | null>;
}

// API configuration
export interface ApiConfig {
  unsplash?: {
    accessKey: string;
  };
  pexels?: {
    apiKey: string;
  };
  pixabay?: {
    apiKey: string;
  };
  flickr?: {
    apiKey: string;
  };
}

// License mappings
export const LICENSE_MAPPINGS = {
  'public-domain': ['pd', 'publicdomain', 'cc0', 'no-rights-reserved'],
  'cc0': ['cc0', 'cc-0', 'publicdomain'],
  'cc-by': ['cc-by', 'by', 'attribution'],
  'cc-by-sa': ['cc-by-sa', 'by-sa', 'attribution-sharealike'],
} as const;
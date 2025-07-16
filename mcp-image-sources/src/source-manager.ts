import { ImageSource, ImageMetadata, SearchParams, ApiConfig } from './types.js';
import {
  UnsplashSource,
  PexelsSource,
  PixabaySource,
  WikimediaSource,
  OpenLibrarySource,
  MetMuseumSource,
  SmithsonianSource,
} from './sources/index.js';
import pLimit from 'p-limit';
import NodeCache from 'node-cache';

export class SourceManager {
  private sources: Map<string, ImageSource> = new Map();
  private cache: NodeCache;
  
  constructor(config?: ApiConfig) {
    // Initialize cache with 1 hour TTL
    this.cache = new NodeCache({ stdTTL: 3600 });
    
    // Initialize sources based on config
    this.initializeSources(config);
  }
  
  private initializeSources(config?: ApiConfig) {
    // Always available sources (no auth required)
    this.sources.set('wikimedia', new WikimediaSource());
    this.sources.set('openlibrary', new OpenLibrarySource());
    this.sources.set('metmuseum', new MetMuseumSource());
    this.sources.set('smithsonian', new SmithsonianSource());
    
    // Conditional sources (require API keys)
    if (config?.unsplash?.accessKey) {
      this.sources.set('unsplash', new UnsplashSource(config.unsplash.accessKey));
    }
    
    if (config?.pexels?.apiKey) {
      this.sources.set('pexels', new PexelsSource(config.pexels.apiKey));
    }
    
    if (config?.pixabay?.apiKey) {
      this.sources.set('pixabay', new PixabaySource(config.pixabay.apiKey));
    }
  }
  
  getAvailableSources(): Array<{ id: string; name: string; description: string; requiresAuth: boolean }> {
    return Array.from(this.sources.entries()).map(([id, source]) => ({
      id,
      name: source.name,
      description: source.description,
      requiresAuth: source.requiresAuth,
    }));
  }
  
  async searchSingle(sourceId: string, params: SearchParams): Promise<ImageMetadata[]> {
    const cacheKey = `search:${sourceId}:${JSON.stringify(params)}`;
    const cached = this.cache.get<ImageMetadata[]>(cacheKey);
    if (cached) return cached;
    
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source ${sourceId} not found`);
    }
    
    const results = await source.search(params);
    this.cache.set(cacheKey, results);
    return results;
  }
  
  async searchAll(params: SearchParams, sourceIds?: string[]): Promise<{
    results: ImageMetadata[];
    errors: Array<{ source: string; error: string }>;
  }> {
    const targetSources = sourceIds 
      ? sourceIds.filter(id => this.sources.has(id))
      : Array.from(this.sources.keys());
    
    const limit = pLimit(3); // Limit concurrent requests
    const results: ImageMetadata[] = [];
    const errors: Array<{ source: string; error: string }> = [];
    
    const searchPromises = targetSources.map(sourceId => 
      limit(async () => {
        try {
          const sourceResults = await this.searchSingle(sourceId, params);
          results.push(...sourceResults);
        } catch (error) {
          errors.push({
            source: sourceId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })
    );
    
    await Promise.all(searchPromises);
    
    // Sort by relevance (simple approach - sources that returned results first are considered more relevant)
    return { results, errors };
  }
  
  async getImage(sourceId: string, imageId: string): Promise<ImageMetadata | null> {
    const cacheKey = `image:${sourceId}:${imageId}`;
    const cached = this.cache.get<ImageMetadata>(cacheKey);
    if (cached) return cached;
    
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source ${sourceId} not found`);
    }
    
    const result = await source.getImage(imageId);
    if (result) {
      this.cache.set(cacheKey, result);
    }
    return result;
  }
  
  filterByLicense(images: ImageMetadata[], license?: string): ImageMetadata[] {
    if (!license || license === 'any') return images;
    
    return images.filter(image => {
      const imageLicense = image.license.toLowerCase();
      
      switch (license) {
        case 'public-domain':
          return imageLicense.includes('public domain') || 
                 imageLicense.includes('cc0') ||
                 imageLicense.includes('pd');
        case 'cc0':
          return imageLicense.includes('cc0') || 
                 imageLicense.includes('cc-0');
        case 'cc-by':
          return imageLicense.includes('cc by') && 
                 !imageLicense.includes('cc by-sa');
        case 'cc-by-sa':
          return imageLicense.includes('cc by-sa');
        default:
          return true;
      }
    });
  }
}
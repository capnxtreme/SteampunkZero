import axios from 'axios';
import { ImageSource, ImageMetadata, SearchParams } from '../types.js';

export class PexelsSource implements ImageSource {
  name = 'Pexels';
  description = 'Free stock photos from Pexels';
  requiresAuth = true;
  supportedLicenses = ['pexels', 'cc0'];
  
  private baseUrl = 'https://api.pexels.com/v1';
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async search(params: SearchParams): Promise<ImageMetadata[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: {
          Authorization: this.apiKey,
        },
        params: {
          query: params.query,
          per_page: params.limit,
          page: params.page,
          orientation: params.orientation !== 'any' ? params.orientation : undefined,
          color: params.color,
          size: this.getSizeParam(params.minWidth, params.minHeight),
        },
      });
      
      return response.data.photos.map((photo: any) => this.mapToImageMetadata(photo));
    } catch (error) {
      console.error('Pexels search error:', error);
      return [];
    }
  }
  
  async getImage(id: string): Promise<ImageMetadata | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/photos/${id}`, {
        headers: {
          Authorization: this.apiKey,
        },
      });
      
      return this.mapToImageMetadata(response.data);
    } catch (error) {
      console.error('Pexels get image error:', error);
      return null;
    }
  }
  
  private getSizeParam(minWidth?: number, minHeight?: number): string | undefined {
    if (!minWidth && !minHeight) return undefined;
    
    const maxDimension = Math.max(minWidth || 0, minHeight || 0);
    if (maxDimension > 4000) return 'large';
    if (maxDimension > 2000) return 'medium';
    return 'small';
  }
  
  private mapToImageMetadata(photo: any): ImageMetadata {
    return {
      id: photo.id.toString(),
      url: photo.src.large,
      thumbnailUrl: photo.src.tiny,
      title: photo.alt || undefined,
      description: photo.alt || undefined,
      author: photo.photographer,
      authorUrl: photo.photographer_url,
      license: 'Pexels License',
      licenseUrl: 'https://www.pexels.com/license/',
      source: 'Pexels',
      width: photo.width,
      height: photo.height,
      tags: [],
      downloadUrl: photo.src.original,
    };
  }
}
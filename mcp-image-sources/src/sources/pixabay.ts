import axios from 'axios';
import { ImageSource, ImageMetadata, SearchParams } from '../types.js';

export class PixabaySource implements ImageSource {
  name = 'Pixabay';
  description = 'Free images and videos from Pixabay';
  requiresAuth = true;
  supportedLicenses = ['pixabay', 'cc0', 'public-domain'];
  
  private baseUrl = 'https://pixabay.com/api/';
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async search(params: SearchParams): Promise<ImageMetadata[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: params.query,
          per_page: params.limit,
          page: params.page,
          orientation: this.mapOrientation(params.orientation),
          colors: params.color,
          min_width: params.minWidth,
          min_height: params.minHeight,
          image_type: 'photo',
          safesearch: true,
        },
      });
      
      return response.data.hits.map((image: any) => this.mapToImageMetadata(image));
    } catch (error) {
      console.error('Pixabay search error:', error);
      return [];
    }
  }
  
  async getImage(id: string): Promise<ImageMetadata | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          id: id,
        },
      });
      
      if (response.data.hits && response.data.hits.length > 0) {
        return this.mapToImageMetadata(response.data.hits[0]);
      }
      return null;
    } catch (error) {
      console.error('Pixabay get image error:', error);
      return null;
    }
  }
  
  private mapOrientation(orientation?: string): string | undefined {
    if (!orientation || orientation === 'any') return 'all';
    if (orientation === 'landscape') return 'horizontal';
    if (orientation === 'portrait') return 'vertical';
    return 'all';
  }
  
  private mapToImageMetadata(image: any): ImageMetadata {
    return {
      id: image.id.toString(),
      url: image.webformatURL,
      thumbnailUrl: image.previewURL,
      title: undefined,
      description: image.tags,
      author: image.user,
      authorUrl: `https://pixabay.com/users/${image.user}-${image.user_id}/`,
      license: 'Pixabay License',
      licenseUrl: 'https://pixabay.com/service/license/',
      source: 'Pixabay',
      width: image.imageWidth,
      height: image.imageHeight,
      tags: image.tags.split(', '),
      downloadUrl: image.largeImageURL,
    };
  }
}
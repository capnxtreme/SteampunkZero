import axios from 'axios';
import { ImageSource, ImageMetadata, SearchParams } from '../types.js';

export class UnsplashSource implements ImageSource {
  name = 'Unsplash';
  description = 'High-quality photos from Unsplash with flexible licensing';
  requiresAuth = true;
  supportedLicenses = ['unsplash', 'cc0'];
  
  private baseUrl = 'https://api.unsplash.com';
  private accessKey: string;
  
  constructor(accessKey: string) {
    this.accessKey = accessKey;
  }
  
  async search(params: SearchParams): Promise<ImageMetadata[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search/photos`, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
        params: {
          query: params.query,
          per_page: params.limit,
          page: params.page,
          orientation: params.orientation !== 'any' ? params.orientation : undefined,
          color: params.color,
        },
      });
      
      return response.data.results.map((photo: any) => this.mapToImageMetadata(photo));
    } catch (error) {
      console.error('Unsplash search error:', error);
      return [];
    }
  }
  
  async getImage(id: string): Promise<ImageMetadata | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/photos/${id}`, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      });
      
      return this.mapToImageMetadata(response.data);
    } catch (error) {
      console.error('Unsplash get image error:', error);
      return null;
    }
  }
  
  private mapToImageMetadata(photo: any): ImageMetadata {
    return {
      id: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.thumb,
      title: photo.description || photo.alt_description,
      description: photo.description,
      author: photo.user.name,
      authorUrl: photo.user.links.html,
      license: 'Unsplash License',
      licenseUrl: 'https://unsplash.com/license',
      source: 'Unsplash',
      width: photo.width,
      height: photo.height,
      tags: photo.tags?.map((tag: any) => tag.title) || [],
      downloadUrl: photo.urls.full,
    };
  }
}
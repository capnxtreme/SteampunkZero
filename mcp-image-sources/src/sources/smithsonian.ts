import axios from 'axios';
import { ImageSource, ImageMetadata, SearchParams } from '../types.js';

export class SmithsonianSource implements ImageSource {
  name = 'Smithsonian Open Access';
  description = 'Millions of images from Smithsonian museums, research centers, libraries, and archives';
  requiresAuth = false;
  supportedLicenses = ['cc0', 'public-domain'];
  
  private baseUrl = 'https://api.si.edu/openaccess/api/v1.0';
  private apiKey = '0000'; // Default public key
  
  async search(params: SearchParams): Promise<ImageMetadata[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          api_key: this.apiKey,
          q: params.query,
          rows: params.limit,
          start: (params.page - 1) * params.limit,
          type: 'edanmdm',
          fq: 'online_media_type:Images'
        },
      });
      
      if (!response.data.response || !response.data.response.rows) {
        return [];
      }
      
      const images: ImageMetadata[] = [];
      
      for (const row of response.data.response.rows) {
        const metadata = this.extractMetadata(row);
        if (metadata) {
          images.push(metadata);
        }
      }
      
      return images;
    } catch (error) {
      console.error('Smithsonian search error:', error);
      return [];
    }
  }
  
  async getImage(id: string): Promise<ImageMetadata | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/content/${id}`, {
        params: {
          api_key: this.apiKey,
        },
      });
      
      if (response.data.response) {
        return this.extractMetadata(response.data.response);
      }
      
      return null;
    } catch (error) {
      console.error('Smithsonian get image error:', error);
      return null;
    }
  }
  
  private extractMetadata(data: any): ImageMetadata | null {
    // Extract content data
    const content = data.content || data;
    const descriptiveNonRepeating = content.descriptiveNonRepeating || {};
    const freeText = content.freetext || {};
    
    // Find image media
    let imageUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    
    if (descriptiveNonRepeating.online_media && descriptiveNonRepeating.online_media.media) {
      const media = descriptiveNonRepeating.online_media.media;
      const imageMedia = Array.isArray(media) ? media[0] : media;
      
      if (imageMedia && imageMedia.type === 'Images') {
        imageUrl = imageMedia.content;
        thumbnailUrl = imageMedia.thumbnail || imageMedia.content;
      }
    }
    
    if (!imageUrl) return null;
    
    // Extract metadata fields
    const title = this.extractField(descriptiveNonRepeating.title) || 
                  this.extractField(freeText.title) || 
                  'Untitled';
    
    const description = this.extractField(freeText.notes) || 
                       this.extractField(descriptiveNonRepeating.notes) ||
                       undefined;
    
    const author = this.extractField(freeText.name) || 
                  this.extractField(descriptiveNonRepeating.data_source) ||
                  'Smithsonian Institution';
    
    const tags: string[] = [];
    
    // Add topics as tags
    if (freeText.topic) {
      const topics = Array.isArray(freeText.topic) ? freeText.topic : [freeText.topic];
      tags.push(...topics.map((t: any) => t.content || t).filter(Boolean));
    }
    
    // Add place as tags
    if (freeText.place) {
      const places = Array.isArray(freeText.place) ? freeText.place : [freeText.place];
      tags.push(...places.map((p: any) => p.content || p).filter(Boolean));
    }
    
    return {
      id: data.id || content.id,
      url: imageUrl,
      thumbnailUrl: thumbnailUrl,
      title: title,
      description: description,
      author: author,
      authorUrl: undefined,
      license: 'CC0 - Public Domain',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      source: 'Smithsonian Open Access',
      width: undefined,
      height: undefined,
      tags: tags.slice(0, 10),
      downloadUrl: imageUrl,
    };
  }
  
  private extractField(field: any): string | undefined {
    if (!field) return undefined;
    
    if (typeof field === 'string') return field;
    
    if (Array.isArray(field)) {
      const firstItem = field[0];
      if (typeof firstItem === 'string') return firstItem;
      if (firstItem && firstItem.content) return firstItem.content;
      if (firstItem && firstItem.label) return firstItem.label;
    }
    
    if (field.content) return field.content;
    if (field.label) return field.label;
    
    return undefined;
  }
}
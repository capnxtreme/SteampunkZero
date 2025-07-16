import axios from 'axios';
import { ImageSource, ImageMetadata, SearchParams } from '../types.js';

export class MetMuseumSource implements ImageSource {
  name = 'Metropolitan Museum of Art';
  description = 'Public domain artworks from the Met Museum collection';
  requiresAuth = false;
  supportedLicenses = ['public-domain', 'cc0'];
  
  private baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
  
  async search(params: SearchParams): Promise<ImageMetadata[]> {
    try {
      // Search for objects
      const searchResponse = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: params.query,
          hasImages: true,
          isPublicDomain: true,
        },
      });
      
      if (!searchResponse.data.objectIDs || searchResponse.data.objectIDs.length === 0) {
        return [];
      }
      
      // Get details for each object (limited by pagination)
      const startIdx = (params.page - 1) * params.limit;
      const endIdx = startIdx + params.limit;
      const objectIds = searchResponse.data.objectIDs.slice(startIdx, endIdx);
      
      const images: ImageMetadata[] = [];
      
      // Fetch details for each object in parallel
      const objectPromises = objectIds.map((id: number) => 
        this.getObjectDetails(id).catch(() => null)
      );
      
      const objects = await Promise.all(objectPromises);
      
      for (const object of objects) {
        if (object && object.primaryImage) {
          const metadata = this.createArtworkMetadata(object);
          images.push(metadata);
        }
      }
      
      return images;
    } catch (error) {
      console.error('Met Museum search error:', error);
      return [];
    }
  }
  
  async getImage(id: string): Promise<ImageMetadata | null> {
    try {
      const object = await this.getObjectDetails(parseInt(id));
      if (object && object.primaryImage) {
        return this.createArtworkMetadata(object);
      }
      return null;
    } catch (error) {
      console.error('Met Museum get image error:', error);
      return null;
    }
  }
  
  private async getObjectDetails(objectId: number): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/objects/${objectId}`);
    return response.data;
  }
  
  private createArtworkMetadata(object: any): ImageMetadata {
    const tags: string[] = [];
    
    // Add various metadata as tags
    if (object.culture) tags.push(object.culture);
    if (object.period) tags.push(object.period);
    if (object.medium) tags.push(object.medium);
    if (object.department) tags.push(object.department);
    if (object.objectName) tags.push(object.objectName);
    
    return {
      id: object.objectID.toString(),
      url: object.primaryImage,
      thumbnailUrl: object.primaryImageSmall || object.primaryImage,
      title: object.title || 'Untitled',
      description: this.buildDescription(object),
      author: object.artistDisplayName || 'Unknown Artist',
      authorUrl: object.artistWikidata_URL || undefined,
      license: 'Public Domain (CC0)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      source: 'Metropolitan Museum of Art',
      width: undefined,
      height: undefined,
      tags: tags.filter(Boolean).slice(0, 10),
      downloadUrl: object.primaryImage,
    };
  }
  
  private buildDescription(object: any): string {
    const parts: string[] = [];
    
    if (object.objectName) parts.push(object.objectName);
    if (object.objectDate) parts.push(object.objectDate);
    if (object.medium) parts.push(`Medium: ${object.medium}`);
    if (object.dimensions) parts.push(`Dimensions: ${object.dimensions}`);
    if (object.creditLine) parts.push(`Credit: ${object.creditLine}`);
    
    return parts.join('. ') || 'Artwork from the Metropolitan Museum of Art collection';
  }
}
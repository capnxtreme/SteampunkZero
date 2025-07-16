import axios from 'axios';
import { ImageSource, ImageMetadata, SearchParams } from '../types.js';

export class WikimediaSource implements ImageSource {
  name = 'Wikimedia Commons';
  description = 'Free media repository with millions of public domain and freely licensed files';
  requiresAuth = false;
  supportedLicenses = ['public-domain', 'cc0', 'cc-by', 'cc-by-sa'];
  
  private baseUrl = 'https://commons.wikimedia.org/w/api.php';
  
  async search(params: SearchParams): Promise<ImageMetadata[]> {
    try {
      // First, search for files
      const searchResponse = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          format: 'json',
          generator: 'search',
          gsrsearch: `${params.query} filetype:bitmap`,
          gsrnamespace: '6', // File namespace
          gsrlimit: params.limit,
          gsroffset: (params.page - 1) * params.limit,
          prop: 'imageinfo|pageprops',
          iiprop: 'url|size|mime|extmetadata',
          iiurlwidth: 300, // Thumbnail width
        },
      });
      
      const pages = searchResponse.data.query?.pages || {};
      const images: ImageMetadata[] = [];
      
      for (const pageId in pages) {
        const page = pages[pageId];
        if (page.imageinfo && page.imageinfo[0]) {
          const imageInfo = page.imageinfo[0];
          const metadata = this.extractMetadata(imageInfo, page);
          if (this.matchesLicenseFilter(metadata.license, params.license)) {
            images.push(metadata);
          }
        }
      }
      
      return images;
    } catch (error) {
      console.error('Wikimedia search error:', error);
      return [];
    }
  }
  
  async getImage(id: string): Promise<ImageMetadata | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          format: 'json',
          pageids: id,
          prop: 'imageinfo',
          iiprop: 'url|size|mime|extmetadata',
        },
      });
      
      const pages = response.data.query?.pages || {};
      const page = pages[id];
      
      if (page && page.imageinfo && page.imageinfo[0]) {
        return this.extractMetadata(page.imageinfo[0], page);
      }
      
      return null;
    } catch (error) {
      console.error('Wikimedia get image error:', error);
      return null;
    }
  }
  
  private extractMetadata(imageInfo: any, page: any): ImageMetadata {
    const extmetadata = imageInfo.extmetadata || {};
    const license = this.extractLicense(extmetadata);
    
    return {
      id: page.pageid.toString(),
      url: imageInfo.url,
      thumbnailUrl: imageInfo.thumburl || imageInfo.url,
      title: page.title?.replace('File:', '') || undefined,
      description: extmetadata.ImageDescription?.value || undefined,
      author: extmetadata.Artist?.value || extmetadata.Author?.value || 'Unknown',
      authorUrl: undefined,
      license: license.name,
      licenseUrl: license.url,
      source: 'Wikimedia Commons',
      width: imageInfo.width,
      height: imageInfo.height,
      tags: extmetadata.Categories?.value?.split('|') || [],
      downloadUrl: imageInfo.url,
    };
  }
  
  private extractLicense(extmetadata: any): { name: string; url: string } {
    const licenseShortName = extmetadata.LicenseShortName?.value || '';
    const licenseUrl = extmetadata.LicenseUrl?.value || '';
    
    // Map common licenses
    if (licenseShortName.toLowerCase().includes('cc0') || 
        licenseShortName.toLowerCase().includes('public domain')) {
      return { name: 'Public Domain', url: licenseUrl || 'https://creativecommons.org/publicdomain/zero/1.0/' };
    }
    
    if (licenseShortName.includes('CC BY-SA')) {
      return { name: 'CC BY-SA', url: licenseUrl || 'https://creativecommons.org/licenses/by-sa/4.0/' };
    }
    
    if (licenseShortName.includes('CC BY')) {
      return { name: 'CC BY', url: licenseUrl || 'https://creativecommons.org/licenses/by/4.0/' };
    }
    
    return { name: licenseShortName || 'Unknown', url: licenseUrl || '' };
  }
  
  private matchesLicenseFilter(imageLicense: string, filterLicense?: string): boolean {
    if (!filterLicense || filterLicense === 'any') return true;
    
    const normalizedLicense = imageLicense.toLowerCase();
    
    switch (filterLicense) {
      case 'public-domain':
      case 'cc0':
        return normalizedLicense.includes('public domain') || 
               normalizedLicense.includes('cc0') ||
               normalizedLicense.includes('pd');
      case 'cc-by':
        return normalizedLicense.includes('cc by') && !normalizedLicense.includes('cc by-sa');
      case 'cc-by-sa':
        return normalizedLicense.includes('cc by-sa');
      default:
        return true;
    }
  }
}
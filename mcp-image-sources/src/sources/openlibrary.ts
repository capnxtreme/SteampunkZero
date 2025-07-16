import axios from 'axios';
import { ImageSource, ImageMetadata, SearchParams } from '../types.js';

export class OpenLibrarySource implements ImageSource {
  name = 'Open Library';
  description = 'Book covers and author photos from the Internet Archive\'s Open Library';
  requiresAuth = false;
  supportedLicenses = ['public-domain', 'cc0', 'fair-use'];
  
  private baseUrl = 'https://openlibrary.org';
  
  async search(params: SearchParams): Promise<ImageMetadata[]> {
    try {
      // Search for books
      const response = await axios.get(`${this.baseUrl}/search.json`, {
        params: {
          q: params.query,
          limit: params.limit,
          page: params.page,
          fields: 'key,title,author_name,first_publish_year,cover_i,isbn',
        },
      });
      
      const images: ImageMetadata[] = [];
      
      for (const doc of response.data.docs) {
        if (doc.cover_i) {
          const metadata = this.createBookCoverMetadata(doc);
          images.push(metadata);
        }
      }
      
      return images;
    } catch (error) {
      console.error('Open Library search error:', error);
      return [];
    }
  }
  
  async getImage(id: string): Promise<ImageMetadata | null> {
    try {
      // Try to get book by key or ISBN
      const bookResponse = await axios.get(`${this.baseUrl}/api/books`, {
        params: {
          bibkeys: id.startsWith('ISBN:') ? id : `OLID:${id}`,
          jscmd: 'data',
          format: 'json',
        },
      });
      
      const bookData = Object.values(bookResponse.data)[0] as any;
      if (bookData && bookData.cover) {
        return this.createBookCoverMetadataFromApi(bookData, id);
      }
      
      return null;
    } catch (error) {
      console.error('Open Library get image error:', error);
      return null;
    }
  }
  
  private createBookCoverMetadata(doc: any): ImageMetadata {
    const coverId = doc.cover_i;
    const coverSizes = ['L', 'M', 'S'];
    
    return {
      id: doc.key.replace('/works/', ''),
      url: `https://covers.openlibrary.org/b/id/${coverId}-${coverSizes[1]}.jpg`,
      thumbnailUrl: `https://covers.openlibrary.org/b/id/${coverId}-${coverSizes[2]}.jpg`,
      title: doc.title,
      description: `Book cover for "${doc.title}"${doc.author_name ? ` by ${doc.author_name.join(', ')}` : ''}`,
      author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
      authorUrl: undefined,
      license: 'Fair Use / Public Domain',
      licenseUrl: 'https://openlibrary.org/help/faq/about#copyrights',
      source: 'Open Library',
      width: undefined,
      height: undefined,
      tags: ['book cover', 'literature', ...(doc.subject || []).slice(0, 5)],
      downloadUrl: `https://covers.openlibrary.org/b/id/${coverId}-${coverSizes[0]}.jpg`,
    };
  }
  
  private createBookCoverMetadataFromApi(bookData: any, id: string): ImageMetadata {
    return {
      id: id,
      url: bookData.cover.medium || bookData.cover.large,
      thumbnailUrl: bookData.cover.small || bookData.cover.medium,
      title: bookData.title,
      description: `Book cover for "${bookData.title}"${bookData.authors ? ` by ${bookData.authors.map((a: any) => a.name).join(', ')}` : ''}`,
      author: bookData.authors ? bookData.authors.map((a: any) => a.name).join(', ') : 'Unknown',
      authorUrl: bookData.authors?.[0]?.url,
      license: 'Fair Use / Public Domain',
      licenseUrl: 'https://openlibrary.org/help/faq/about#copyrights',
      source: 'Open Library',
      width: undefined,
      height: undefined,
      tags: ['book cover', 'literature', ...(bookData.subjects || []).slice(0, 5)],
      downloadUrl: bookData.cover.large,
    };
  }
}
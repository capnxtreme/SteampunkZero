import { describe, it, expect } from 'vitest';
import { WikimediaSource } from '../src/sources/wikimedia.js';
import { OpenLibrarySource } from '../src/sources/openlibrary.js';
import { MetMuseumSource } from '../src/sources/metmuseum.js';
import { SearchParams } from '../src/types.js';

describe('Image Sources', () => {
  const testParams: SearchParams = {
    query: 'test',
    limit: 5,
    page: 1,
  };

  describe('WikimediaSource', () => {
    it('should be instantiable', () => {
      const source = new WikimediaSource();
      expect(source.name).toBe('Wikimedia Commons');
      expect(source.requiresAuth).toBe(false);
    });

    it('should support expected licenses', () => {
      const source = new WikimediaSource();
      expect(source.supportedLicenses).toContain('public-domain');
      expect(source.supportedLicenses).toContain('cc0');
      expect(source.supportedLicenses).toContain('cc-by');
      expect(source.supportedLicenses).toContain('cc-by-sa');
    });
  });

  describe('OpenLibrarySource', () => {
    it('should be instantiable', () => {
      const source = new OpenLibrarySource();
      expect(source.name).toBe('Open Library');
      expect(source.requiresAuth).toBe(false);
    });
  });

  describe('MetMuseumSource', () => {
    it('should be instantiable', () => {
      const source = new MetMuseumSource();
      expect(source.name).toBe('Metropolitan Museum of Art');
      expect(source.requiresAuth).toBe(false);
    });

    it('should only support public domain licenses', () => {
      const source = new MetMuseumSource();
      expect(source.supportedLicenses).toContain('public-domain');
      expect(source.supportedLicenses).toContain('cc0');
    });
  });
});
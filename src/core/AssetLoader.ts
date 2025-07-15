// Asset loader for managing game resources
export interface AssetStorage {
  images: Map<string, HTMLImageElement>;
  audio: Map<string, HTMLAudioElement>;
  fonts: Map<string, FontFace>;
}

export class AssetLoader {
  private assets: AssetStorage;
  private loadedCount: number;
  private totalCount: number;
  public onProgress: ((progress: number) => void) | null;
  public onComplete: (() => void) | null;

  constructor() {
    this.assets = {
      images: new Map(),
      audio: new Map(),
      fonts: new Map(),
    };

    this.loadedCount = 0;
    this.totalCount = 0;
    this.onProgress = null;
    this.onComplete = null;
  }

  async loadInitialAssets(): Promise<void> {
    console.log('Loading initial assets...');
    // No sprites are currently used - all rendering is generated
    // Keeping method for future expansion
    console.log('No assets to load - using generated content');
  }

  loadImage(key: string, src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.assets.images.set(key, img);
        this.updateProgress();
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }

  loadAudio(key: string, src: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.addEventListener(
        'canplaythrough',
        () => {
          this.assets.audio.set(key, audio);
          this.updateProgress();
          resolve(audio);
        },
        { once: true }
      );

      audio.addEventListener(
        'error',
        () => {
          reject(new Error(`Failed to load audio: ${src}`));
        },
        { once: true }
      );

      audio.src = src;
    });
  }

  async loadFont(key: string, src: string): Promise<FontFace> {
    try {
      const font = new FontFace(key, `url(${src})`);
      await font.load();
      document.fonts.add(font);
      this.assets.fonts.set(key, font);
      this.updateProgress();
      return font;
    } catch (error) {
      throw new Error(`Failed to load font: ${src}`);
    }
  }

  getImage(key: string): HTMLImageElement | undefined {
    return this.assets.images.get(key);
  }

  getAudio(key: string): HTMLAudioElement | undefined {
    return this.assets.audio.get(key);
  }

  getFont(key: string): FontFace | undefined {
    return this.assets.fonts.get(key);
  }

  private updateProgress(): void {
    this.loadedCount++;
    const progress =
      this.totalCount > 0 ? this.loadedCount / this.totalCount : 0;

    if (this.onProgress) {
      this.onProgress(progress);
    }

    if (this.loadedCount === this.totalCount && this.onComplete) {
      this.onComplete();
    }
  }
}

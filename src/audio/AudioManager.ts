/**
 * AudioManager - Handles all audio playback for the SteampunkZero racing game
 *
 * Features:
 * - Engine sound with dynamic pitch based on speed
 * - Collision/impact sounds
 * - Boost pad activation sounds
 * - Background music support
 * - Graceful handling of missing audio files
 *
 * Audio Sources (Public Domain):
 * - Engine sounds: Can be sourced from freesound.org, opengameart.org, pixabay.com
 * - All audio files should be CC0/Public Domain for free use
 */

export interface AudioConfig {
  volume: number;
  muted: boolean;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private config: AudioConfig;
  private engineSource: AudioBufferSourceNode | null = null;
  private engineGainNode: GainNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGainNode: GainNode | null = null;
  private isInitialized: boolean = false;

  // Sound file paths
  private readonly soundPaths = {
    engineLoop: '/assets/audio/engine_loop.mp3',
    steamHiss: '/assets/audio/steam_hiss.mp3',
    collision: '/assets/audio/collision.mp3',
    boost: '/assets/audio/boost.mp3',
    backgroundMusic: '/assets/audio/background_music.mp3',
  };

  constructor(config: AudioConfig = { volume: 0.7, muted: false }) {
    this.config = config;
  }

  /**
   * Initialize the audio system
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();

      // Load all sound files
      await this.loadSounds();

      this.isInitialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize AudioManager:', error);
      // Continue without audio rather than breaking the game
    }
  }

  /**
   * Load all sound files into memory
   */
  private async loadSounds(): Promise<void> {
    if (!this.audioContext) return;

    const loadPromises = Object.entries(this.soundPaths).map(
      async ([key, path]) => {
        try {
          const response = await fetch(path);
          if (!response.ok) {
            console.warn(`Audio file not found: ${path}`);
            return;
          }

          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer =
            await this.audioContext!.decodeAudioData(arrayBuffer);
          this.sounds.set(key, audioBuffer);
          console.log(`Loaded audio: ${key}`);
        } catch (error) {
          console.warn(`Failed to load audio ${key} from ${path}:`, error);
          // Continue without this specific sound
        }
      }
    );

    await Promise.all(loadPromises);
  }

  /**
   * Play the engine sound loop with dynamic pitch
   * @param speed - Current vehicle speed (0-maxSpeed)
   * @param maxSpeed - Maximum vehicle speed
   */
  playEngineSound(speed: number, maxSpeed: number): void {
    if (!this.isInitialized || !this.audioContext || this.config.muted) return;

    const engineBuffer = this.sounds.get('engineLoop');
    const steamBuffer = this.sounds.get('steamHiss');

    if (!engineBuffer) return;

    // If engine is already playing, just update the pitch
    if (this.engineSource && this.engineGainNode) {
      this.updateEnginePitch(speed, maxSpeed);
      return;
    }

    // Create new engine sound
    this.engineSource = this.audioContext.createBufferSource();
    this.engineGainNode = this.audioContext.createGain();

    this.engineSource.buffer = engineBuffer;
    this.engineSource.loop = true;

    // Set initial volume
    this.engineGainNode.gain.value = this.config.volume * 0.5;

    // Connect nodes
    this.engineSource.connect(this.engineGainNode);
    this.engineGainNode.connect(this.audioContext.destination);

    // Start playing
    this.engineSource.start(0);

    // Store reference for later updates
    this.sources.set('engine', this.engineSource);
    this.gainNodes.set('engine', this.engineGainNode);

    // Optionally layer steam hiss sound for steampunk effect
    if (steamBuffer && speed > maxSpeed * 0.3) {
      this.playSound('steamHiss', { volume: 0.3, pitch: 1.0 });
    }
  }

  /**
   * Update engine pitch based on speed
   */
  private updateEnginePitch(speed: number, maxSpeed: number): void {
    if (!this.engineSource || !this.engineGainNode) return;

    // Calculate pitch based on speed (0.5 to 2.0)
    const speedRatio = speed / maxSpeed;
    const pitch = 0.5 + speedRatio * 1.5;

    // Update playback rate for pitch change
    this.engineSource.playbackRate.value = pitch;

    // Adjust volume based on speed
    const volumeMultiplier = 0.3 + speedRatio * 0.7;
    this.engineGainNode.gain.value =
      this.config.volume * volumeMultiplier * 0.5;
  }

  /**
   * Stop the engine sound
   */
  stopEngineSound(): void {
    if (this.engineSource) {
      this.engineSource.stop();
      this.engineSource = null;
      this.engineGainNode = null;
      this.sources.delete('engine');
      this.gainNodes.delete('engine');
    }
  }

  /**
   * Play a one-shot sound effect
   * @param soundName - Name of the sound to play
   * @param options - Playback options
   */
  playSound(
    soundName: string,
    options: { volume?: number; pitch?: number } = {}
  ): void {
    if (!this.isInitialized || !this.audioContext || this.config.muted) return;

    const buffer = this.sounds.get(soundName);
    if (!buffer) {
      console.warn(`Sound not loaded: ${soundName}`);
      return;
    }

    // Create source and gain nodes
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.playbackRate.value = options.pitch || 1.0;
    gainNode.gain.value = this.config.volume * (options.volume || 1.0);

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start playing
    source.start(0);

    // Clean up when finished
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * Play collision/impact sound
   */
  playCollisionSound(): void {
    this.playSound('collision', {
      volume: 0.8,
      pitch: 0.9 + Math.random() * 0.2,
    });
  }

  /**
   * Play boost pad activation sound
   */
  playBoostSound(): void {
    this.playSound('boost', { volume: 0.6, pitch: 1.0 });
  }

  /**
   * Start playing background music
   */
  playBackgroundMusic(): void {
    if (!this.isInitialized || !this.audioContext || this.config.muted) return;

    const musicBuffer = this.sounds.get('backgroundMusic');
    if (!musicBuffer) return;

    // Stop existing music if playing
    this.stopBackgroundMusic();

    // Create new music source
    this.musicSource = this.audioContext.createBufferSource();
    this.musicGainNode = this.audioContext.createGain();

    this.musicSource.buffer = musicBuffer;
    this.musicSource.loop = true;

    // Set music volume (lower than sound effects)
    this.musicGainNode.gain.value = this.config.volume * 0.3;

    // Connect nodes
    this.musicSource.connect(this.musicGainNode);
    this.musicGainNode.connect(this.audioContext.destination);

    // Start playing
    this.musicSource.start(0);
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
      this.musicGainNode = null;
    }
  }

  /**
   * Set master volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));

    // Update all active gain nodes
    this.gainNodes.forEach((gainNode) => {
      gainNode.gain.value = this.config.volume;
    });

    if (this.engineGainNode) {
      this.engineGainNode.gain.value = this.config.volume * 0.5;
    }

    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.config.volume * 0.3;
    }
  }

  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    this.config.muted = muted;

    if (muted) {
      // Stop all sounds
      this.stopEngineSound();
      this.stopBackgroundMusic();
    }
  }

  /**
   * Clean up and release resources
   */
  dispose(): void {
    // Stop all sounds
    this.stopEngineSound();
    this.stopBackgroundMusic();

    // Clear all sources and gain nodes
    this.sources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch (_e) {
        // Source might already be stopped
      }
    });

    this.gainNodes.forEach((gainNode) => {
      gainNode.disconnect();
    });

    this.sources.clear();
    this.gainNodes.clear();
    this.sounds.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}

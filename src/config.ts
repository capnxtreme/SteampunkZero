// Game configuration constants
export interface PlayerConfig {
  MAX_SPEED: number;
  ACCELERATION: number;
  BRAKE_FORCE: number;
  TURN_SPEED: number;
  BOOST_MULTIPLIER: number;
  BOOST_DURATION: number;
  BOOST_COOLDOWN: number;
}

export interface TrackConfig {
  WIDTH: number;
  CHECKPOINT_SIZE: number;
  LAP_COUNT: number;
}

export interface CameraConfig {
  FOLLOW_SPEED: number;
  ZOOM_DEFAULT: number;
  ZOOM_MIN: number;
  ZOOM_MAX: number;
}

export interface DebugConfig {
  SHOW_FPS: boolean;
  SHOW_HITBOXES: boolean;
  SHOW_VECTORS: boolean;
  ENABLE_STATS: boolean;
}

export interface AssetImages {
  PLAYER_VEHICLE: string;
  TRACK_TILES: string;
  BACKGROUND: string;
  PARTICLES: string;
}

export interface AssetAudio {
  ENGINE_IDLE: string;
  ENGINE_ACCELERATE: string;
  BOOST: string;
  COLLISION: string;
  CHECKPOINT: string;
  LAP_COMPLETE: string;
}

export interface AssetFonts {
  MAIN: string;
}

export interface Assets {
  IMAGES: AssetImages;
  AUDIO: AssetAudio;
  FONTS: AssetFonts;
}

export interface Config {
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  TARGET_FPS: number;
  FIXED_TIME_STEP: number;
  MAX_DELTA_TIME: number;
  GRAVITY: number;
  AIR_RESISTANCE: number;
  GROUND_FRICTION: number;
  PLAYER: PlayerConfig;
  TRACK: TrackConfig;
  CAMERA: CameraConfig;
  DEBUG: DebugConfig;
  ASSETS: Assets;
}

export const CONFIG: Config = {
  // Canvas settings
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,

  // Game settings
  TARGET_FPS: 60,
  FIXED_TIME_STEP: 1000 / 60, // 16.67ms for 60 FPS
  MAX_DELTA_TIME: 100, // Maximum delta time to prevent spiral of death

  // Physics settings
  GRAVITY: 9.81,
  AIR_RESISTANCE: 0.98,
  GROUND_FRICTION: 0.95,

  // Player vehicle settings
  PLAYER: {
    MAX_SPEED: 300,
    ACCELERATION: 150,
    BRAKE_FORCE: 200,
    TURN_SPEED: 2.5,
    BOOST_MULTIPLIER: 1.5,
    BOOST_DURATION: 3000, // milliseconds
    BOOST_COOLDOWN: 5000, // milliseconds
  },

  // Track settings
  TRACK: {
    WIDTH: 200,
    CHECKPOINT_SIZE: 50,
    LAP_COUNT: 3,
  },

  // Visual settings
  CAMERA: {
    FOLLOW_SPEED: 0.1,
    ZOOM_DEFAULT: 1,
    ZOOM_MIN: 0.5,
    ZOOM_MAX: 2,
  },

  // Debug settings
  DEBUG: {
    SHOW_FPS: true,
    SHOW_HITBOXES: false,
    SHOW_VECTORS: false,
    ENABLE_STATS: true,
  },

  // Asset paths
  ASSETS: {
    IMAGES: {
      PLAYER_VEHICLE: 'assets/images/player-vehicle.png',
      TRACK_TILES: 'assets/images/track-tiles.png',
      BACKGROUND: 'assets/images/background.png',
      PARTICLES: 'assets/images/particles.png',
    },
    AUDIO: {
      ENGINE_IDLE: 'assets/audio/engine-idle.mp3',
      ENGINE_ACCELERATE: 'assets/audio/engine-accelerate.mp3',
      BOOST: 'assets/audio/boost.mp3',
      COLLISION: 'assets/audio/collision.mp3',
      CHECKPOINT: 'assets/audio/checkpoint.mp3',
      LAP_COMPLETE: 'assets/audio/lap-complete.mp3',
    },
    FONTS: {
      MAIN: 'assets/fonts/steampunk.ttf',
    },
  },
};

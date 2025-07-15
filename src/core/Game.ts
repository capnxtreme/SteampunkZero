// Core Game class that manages the game loop and systems
import { InputManager } from '../systems/InputManager.js';
import { Renderer } from '../systems/Renderer.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { EntityManager } from './EntityManager.js';
import { CONFIG } from '../config.js';

export class Game {
  private ctx: CanvasRenderingContext2D;

  // Core systems
  private inputManager: InputManager;
  private renderer: Renderer;
  private physicsSystem: PhysicsSystem;
  private entityManager: EntityManager;

  // Game state
  private isRunning: boolean;
  private isPaused: boolean;
  private lastTimestamp: number;
  private accumulator: number;

  // Performance tracking
  private fps: number;
  private frameCount: number;
  private lastFpsUpdate: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;

    // Core systems
    this.inputManager = new InputManager();
    this.renderer = new Renderer(this.ctx);
    this.physicsSystem = new PhysicsSystem();
    this.entityManager = new EntityManager();

    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.lastTimestamp = 0;
    this.accumulator = 0;

    // Performance tracking
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;

    // Bind methods
    this.gameLoop = this.gameLoop.bind(this);
  }

  start(): void {
    console.log('Starting Steampunk Racing Game...');

    // Initialize systems
    this.inputManager.initialize();
    this.physicsSystem.initialize();

    // Start the game loop
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  stop(): void {
    this.isRunning = false;
    this.inputManager.cleanup();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.lastTimestamp = performance.now();
  }

  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;

    // Calculate delta time
    const deltaTime = Math.min(
      timestamp - this.lastTimestamp,
      CONFIG.MAX_DELTA_TIME
    );
    this.lastTimestamp = timestamp;

    // Update FPS counter
    this.updateFPS(timestamp);

    if (!this.isPaused) {
      // Fixed timestep with interpolation
      this.accumulator += deltaTime;

      while (this.accumulator >= CONFIG.FIXED_TIME_STEP) {
        this.fixedUpdate(CONFIG.FIXED_TIME_STEP);
        this.accumulator -= CONFIG.FIXED_TIME_STEP;
      }

      // Variable timestep update
      this.update(deltaTime);

      // Render with interpolation
      const interpolation = this.accumulator / CONFIG.FIXED_TIME_STEP;
      this.render(interpolation);
    }

    // Continue the game loop
    requestAnimationFrame(this.gameLoop);
  }

  private fixedUpdate(fixedDeltaTime: number): void {
    // Update physics at fixed timestep
    this.physicsSystem.update(this.entityManager.getEntities(), fixedDeltaTime);
  }

  private update(deltaTime: number): void {
    // Update input
    this.inputManager.update();

    // Update entities
    this.entityManager.update(deltaTime);
  }

  private render(interpolation: number): void {
    // Clear the canvas
    this.renderer.clear();

    // Render all entities
    this.renderer.renderEntities(
      this.entityManager.getEntities(),
      interpolation
    );

    // Render UI/HUD
    if (CONFIG.DEBUG.SHOW_FPS) {
      this.renderer.renderFPS(this.fps);
    }
  }

  private updateFPS(timestamp: number): void {
    this.frameCount++;

    if (timestamp - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = timestamp;
    }
  }
}

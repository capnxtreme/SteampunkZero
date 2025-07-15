import { SteampunkRacer } from './SteampunkRacer.js';
import './debug-client.js'; // Initialize debug bridge
import { ErrorMonitor } from './error-monitor.js';

console.log('Main.ts loaded');

// Initialize error monitoring
const errorMonitor = new ErrorMonitor();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  console.log('Canvas found:', canvas);

  // Set canvas size
  canvas.width = 800;
  canvas.height = 600;

  // Create and start game
  console.log('Creating SteampunkRacer instance...');
  const game = new SteampunkRacer(canvas);
  console.log('Game instance created:', game);

  // Add keyboard controls for game-level functions
  document.addEventListener('keydown', (e) => {
    game.handleKeyPress(e.key);
  });

  // Start button
  const startButton = document.getElementById('startButton');
  if (startButton) {
    startButton.addEventListener('click', async () => {
      await game.start();
      startButton.textContent = 'Restart';
    });
  }

  // Stop button
  const stopButton = document.getElementById('stopButton');
  if (stopButton) {
    stopButton.addEventListener('click', () => {
      game.stop();
    });
  }

  // Display loading complete
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }

  // Show game info
  const infoElement = document.getElementById('gameInfo');
  if (infoElement) {
    infoElement.style.display = 'block';
  }
});

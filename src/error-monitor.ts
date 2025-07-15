// Error monitoring utility
export class ErrorMonitor {
  private errors: Array<{
    message: string;
    stack?: string;
    timestamp: number;
  }> = [];
  private errorElement?: HTMLElement;

  constructor() {
    this.setupErrorHandlers();
    this.createErrorDisplay();
  }

  private setupErrorHandlers(): void {
    // Capture regular errors
    window.addEventListener('error', (event) => {
      this.logError(
        `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
        event.error?.stack
      );
      event.preventDefault();
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(`Unhandled Promise: ${event.reason}`, event.reason?.stack);
      event.preventDefault();
    });

    // Override console.error
    const originalError = console.error;
    console.error = (...args) => {
      this.logError(`Console Error: ${args.join(' ')}`);
      originalError.apply(console, args);
    };
  }

  private createErrorDisplay(): void {
    this.errorElement = document.createElement('div');
    this.errorElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(255, 0, 0, 0.1);
      border: 2px solid red;
      color: white;
      padding: 10px;
      max-width: 400px;
      max-height: 200px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      display: none;
    `;
    document.body.appendChild(this.errorElement);
  }

  private logError(message: string, stack?: string): void {
    const error = {
      message,
      stack,
      timestamp: Date.now(),
    };

    this.errors.push(error);
    console.log('🚨 Error caught:', message);

    if (this.errorElement) {
      this.errorElement.style.display = 'block';
      this.errorElement.innerHTML = this.errors
        .slice(-5) // Show last 5 errors
        .map(
          (
            e
          ) => `<div style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.2);">
          ${new Date(e.timestamp).toLocaleTimeString()}: ${e.message}
        </div>`
        )
        .join('');
    }
  }

  public getErrors(): Array<{
    message: string;
    stack?: string;
    timestamp: number;
  }> {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
      this.errorElement.innerHTML = '';
    }
  }
}

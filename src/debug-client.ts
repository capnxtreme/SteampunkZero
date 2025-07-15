// Debug Bridge Client - Captures console output and sends to WebSocket server
export class DebugBridge {
  private ws: WebSocket | null = null;
  private messageQueue: unknown[] = [];
  private isConnected = false;
  private reconnectInterval: number | null = null;
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  constructor(private url: string = 'ws://localhost:8889') {
    this.connect();
    this.interceptConsole();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.originalConsole.log('🔌 Debug bridge connected');

        // Send any queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.send(message);
        }

        // Clear reconnect interval if it exists
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.originalConsole.warn('🔌 Debug bridge disconnected');

        // Attempt to reconnect every 3 seconds
        if (!this.reconnectInterval) {
          this.reconnectInterval = window.setInterval(() => {
            this.originalConsole.log(
              '🔄 Attempting to reconnect debug bridge...'
            );
            this.connect();
          }, 3000);
        }
      };

      this.ws.onerror = (error) => {
        this.originalConsole.error('Debug bridge error:', error);
      };
    } catch (error) {
      this.originalConsole.error(
        'Failed to create WebSocket connection:',
        error
      );
    }
  }

  private interceptConsole(): void {
    // Intercept console methods
    const methods: Array<keyof typeof console> = [
      'log',
      'error',
      'warn',
      'info',
      'debug',
    ];

    methods.forEach((method) => {
      (console as { [key: string]: (...args: unknown[]) => void })[method] = (...args: unknown[]) => {
        // Call original console method
        this.originalConsole[method].apply(console, args);

        // Send to debug server
        this.send({
          type: method,
          args: this.serializeArgs(args),
          timestamp: Date.now(),
          stack: method === 'error' ? new Error().stack : undefined,
        });
      };
    });

    // Also capture unhandled errors
    window.addEventListener('error', (event) => {
      this.send({
        type: 'error',
        args: [
          `Unhandled error: ${event.message}`,
          `at ${event.filename}:${event.lineno}:${event.colno}`,
          event.error?.stack,
        ],
        timestamp: Date.now(),
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.send({
        type: 'error',
        args: ['Unhandled promise rejection:', event.reason],
        timestamp: Date.now(),
      });
    });
  }

  private serializeArgs(args: unknown[]): unknown[] {
    return args.map((arg) => {
      try {
        // Handle different types of arguments
        if (arg === null || arg === undefined) {
          return arg;
        }
        if (typeof arg === 'object') {
          // Handle circular references
          const cache = new Set();
          return JSON.parse(
            JSON.stringify(arg, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) {
                  return '[Circular Reference]';
                }
                cache.add(value);
              }
              return value;
            })
          );
        }
        return arg;
      } catch (_error) {
        return String(arg);
      }
    });
  }

  private send(message: unknown): void {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        this.originalConsole.error('Failed to send debug message:', error);
      }
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);

      // Limit queue size to prevent memory issues
      if (this.messageQueue.length > 100) {
        this.messageQueue.shift();
      }
    }
  }

  disconnect(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Auto-initialize if in development mode
if (import.meta.env?.DEV || window.location.hostname === 'localhost') {
  console.log('Initializing debug bridge...');
  (window as { __debugBridge?: DebugBridge }).__debugBridge = new DebugBridge();
  console.log('Debug bridge initialized');
}

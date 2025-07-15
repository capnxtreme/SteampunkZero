// Input manager for handling keyboard and mouse input
export interface MouseState {
    x: number;
    y: number;
    buttons: Map<number, boolean>;
    previousButtons: Map<number, boolean>;
}

export class InputManager {
    private keys: Map<string, boolean>;
    private previousKeys: Map<string, boolean>;
    private mouse: MouseState;
    
    constructor() {
        this.keys = new Map();
        this.previousKeys = new Map();
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Map(),
            previousButtons: new Map()
        };
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    
    initialize(): void {
        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        
        // Prevent context menu on right click
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    cleanup(): void {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }
    
    update(): void {
        // Update previous state
        this.previousKeys = new Map(this.keys);
        this.mouse.previousButtons = new Map(this.mouse.buttons);
    }
    
    // Keyboard input methods
    isKeyDown(key: string): boolean {
        return this.keys.get(key) || false;
    }
    
    isKeyPressed(key: string): boolean {
        return this.isKeyDown(key) && !this.wasKeyDown(key);
    }
    
    isKeyReleased(key: string): boolean {
        return !this.isKeyDown(key) && this.wasKeyDown(key);
    }
    
    wasKeyDown(key: string): boolean {
        return this.previousKeys.get(key) || false;
    }
    
    // Mouse input methods
    isMouseButtonDown(button: number): boolean {
        return this.mouse.buttons.get(button) || false;
    }
    
    isMouseButtonPressed(button: number): boolean {
        return this.isMouseButtonDown(button) && !this.wasMouseButtonDown(button);
    }
    
    isMouseButtonReleased(button: number): boolean {
        return !this.isMouseButtonDown(button) && this.wasMouseButtonDown(button);
    }
    
    wasMouseButtonDown(button: number): boolean {
        return this.mouse.previousButtons.get(button) || false;
    }
    
    getMousePosition(): { x: number; y: number } {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    // Event handlers
    private handleKeyDown(event: KeyboardEvent): void {
        this.keys.set(event.code, true);
        
        // Prevent default for game keys
        if (this.isGameKey(event.code)) {
            event.preventDefault();
        }
    }
    
    private handleKeyUp(event: KeyboardEvent): void {
        this.keys.set(event.code, false);
    }
    
    private handleMouseMove(event: MouseEvent): void {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Calculate mouse position relative to canvas
        this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
        this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
    }
    
    private handleMouseDown(event: MouseEvent): void {
        this.mouse.buttons.set(event.button, true);
        event.preventDefault();
    }
    
    private handleMouseUp(event: MouseEvent): void {
        this.mouse.buttons.set(event.button, false);
    }
    
    private isGameKey(code: string): boolean {
        // Define which keys are used by the game
        const gameKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'KeyW', 'KeyA', 'KeyS', 'KeyD',
            'Space', 'ShiftLeft', 'ShiftRight',
            'Enter', 'Escape'
        ];
        return gameKeys.includes(code);
    }
}
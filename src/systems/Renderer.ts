// Renderer system for drawing game objects
import { Entity, RenderComponent } from '../types/entity.js';
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';

export interface Camera {
    x: number;
    y: number;
    zoom: number;
}

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private camera: Camera;
    
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
    }
    
    clear(): void {
        this.ctx.fillStyle = '#1a0f08';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderEntities(entities: Entity[], interpolation: number): void {
        // Save context state
        this.ctx.save();
        
        // Apply camera transform
        this.applyCamera();
        
        // Sort entities by render layer
        const sortedEntities = entities
            .filter(entity => entity.components.has('render'))
            .sort((a, b) => {
                const layerA = (a.components.get('render') as RenderComponent).layer || 0;
                const layerB = (b.components.get('render') as RenderComponent).layer || 0;
                return layerA - layerB;
            });
        
        // Render each entity
        for (const entity of sortedEntities) {
            this.renderEntity(entity, interpolation);
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    private renderEntity(entity: Entity, interpolation: number): void {
        const render = entity.components.get('render') as RenderComponent | undefined;
        const transform = entity.components.get('transform') as Transform | undefined;
        
        if (!render || !transform) return;
        
        // Save context state
        this.ctx.save();
        
        // Apply entity transform
        this.ctx.translate(transform.x, transform.y);
        this.ctx.rotate(transform.rotation || 0);
        
        // Apply interpolation for smooth movement
        if (entity.components.has('physics')) {
            const physics = entity.components.get('physics') as Physics;
            const interpX = physics.vx * interpolation;
            const interpY = physics.vy * interpolation;
            this.ctx.translate(interpX, interpY);
        }
        
        // Render based on type
        switch (render.type) {
            case 'rectangle':
                this.renderRectangle(render);
                break;
            case 'circle':
                this.renderCircle(render);
                break;
            case 'sprite':
                this.renderSprite(render);
                break;
            case 'text':
                this.renderText(render);
                break;
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    private renderRectangle(render: RenderComponent): void {
        if (!render.width || !render.height) return;
        
        this.ctx.fillStyle = render.color || '#ffffff';
        this.ctx.fillRect(
            -render.width / 2,
            -render.height / 2,
            render.width,
            render.height
        );
        
        if (render.strokeColor) {
            this.ctx.strokeStyle = render.strokeColor;
            this.ctx.lineWidth = render.strokeWidth || 1;
            this.ctx.strokeRect(
                -render.width / 2,
                -render.height / 2,
                render.width,
                render.height
            );
        }
    }
    
    private renderCircle(render: RenderComponent): void {
        if (!render.radius) return;
        
        this.ctx.fillStyle = render.color || '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, render.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (render.strokeColor) {
            this.ctx.strokeStyle = render.strokeColor;
            this.ctx.lineWidth = render.strokeWidth || 1;
            this.ctx.stroke();
        }
    }
    
    private renderSprite(render: RenderComponent): void {
        if (!render.image || !render.width || !render.height) return;
        
        this.ctx.drawImage(
            render.image,
            -render.width / 2,
            -render.height / 2,
            render.width,
            render.height
        );
    }
    
    private renderText(render: RenderComponent): void {
        if (!render.text) return;
        
        this.ctx.font = render.font || '16px Arial';
        this.ctx.fillStyle = render.color || '#ffffff';
        this.ctx.textAlign = render.align || 'center';
        this.ctx.textBaseline = render.baseline || 'middle';
        this.ctx.fillText(render.text, 0, 0);
    }
    
    renderFPS(fps: number): void {
        this.ctx.save();
        this.ctx.font = '16px monospace';
        this.ctx.fillStyle = '#00ff00';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`FPS: ${fps}`, 10, 10);
        this.ctx.restore();
    }
    
    private applyCamera(): void {
        // Center the camera
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        // Apply zoom
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Apply camera position
        this.ctx.translate(-this.camera.x, -this.camera.y);
    }
    
    setCamera(x: number, y: number, zoom: number = 1): void {
        this.camera.x = x;
        this.camera.y = y;
        this.camera.zoom = zoom;
    }
    
    screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        const worldX = (screenX - this.canvas.width / 2) / this.camera.zoom + this.camera.x;
        const worldY = (screenY - this.canvas.height / 2) / this.camera.zoom + this.camera.y;
        return { x: worldX, y: worldY };
    }
    
    worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        const screenX = (worldX - this.camera.x) * this.camera.zoom + this.canvas.width / 2;
        const screenY = (worldY - this.camera.y) * this.camera.zoom + this.canvas.height / 2;
        return { x: screenX, y: screenY };
    }
}
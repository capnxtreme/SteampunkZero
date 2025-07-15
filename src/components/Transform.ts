// Transform component for entity position and rotation
export interface Scale {
    x: number;
    y: number;
}

export class Transform {
    public x: number;
    public y: number;
    public rotation: number;
    public scale: Scale;

    constructor(x: number = 0, y: number = 0, rotation: number = 0) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scale = { x: 1, y: 1 };
    }
    
    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    
    translate(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
    
    rotate(angle: number): void {
        this.rotation += angle;
    }
    
    setRotation(angle: number): void {
        this.rotation = angle;
    }
    
    setScale(scaleX: number, scaleY: number = scaleX): void {
        this.scale.x = scaleX;
        this.scale.y = scaleY;
    }
}
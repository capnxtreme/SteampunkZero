// 2D Vector utility class
export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    
    // Static methods
    static add(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x + b.x, a.y + b.y);
    }
    
    static subtract(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }
    
    static multiply(v: Vector2, scalar: number): Vector2 {
        return new Vector2(v.x * scalar, v.y * scalar);
    }
    
    static divide(v: Vector2, scalar: number): Vector2 {
        return new Vector2(v.x / scalar, v.y / scalar);
    }
    
    static distance(a: Vector2, b: Vector2): number {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static dot(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y;
    }
    
    static normalize(v: Vector2): Vector2 {
        const mag = v.magnitude();
        if (mag === 0) return new Vector2(0, 0);
        return new Vector2(v.x / mag, v.y / mag);
    }
    
    static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
        return new Vector2(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        );
    }
    
    static fromAngle(angle: number): Vector2 {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
    
    // Instance methods
    add(v: Vector2): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    subtract(v: Vector2): this {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    
    multiply(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    
    divide(scalar: number): this {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }
    
    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y;
    }
    
    normalize(): this {
        const mag = this.magnitude();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }
    
    angle(): number {
        return Math.atan2(this.y, this.x);
    }
    
    rotate(angle: number): this {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }
    
    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }
    
    equals(v: Vector2): boolean {
        return this.x === v.x && this.y === v.y;
    }
    
    toString(): string {
        return `Vector2(${this.x}, ${this.y})`;
    }
}
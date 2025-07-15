import { Point2D } from '../rendering/Mode7Renderer';

export interface TrackSegment {
  start: Point2D;
  end: Point2D;
  width: number;
  leftBoundary: Point2D;
  rightBoundary: Point2D;
}

export interface TrackBoundary {
  left: Point2D;
  right: Point2D;
}

export interface CollisionResult {
  collision: boolean;
  side?: 'left' | 'right' | 'out_of_bounds';
  penetration?: number;
  distanceToLeft?: number;
  distanceToRight?: number;
}

export interface NearestPointResult {
  point: Point2D;
  distance: number;
  segmentIndex: number;
}

export class Track {
  private segments: TrackSegment[];
  private totalLength: number;
  private segmentLengths: number[];

  constructor(segments: TrackSegment[]) {
    if (segments.length === 0) {
      throw new Error('Track must have at least one segment');
    }
    
    this.segments = segments;
    this.segmentLengths = [];
    this.totalLength = 0;
    
    // Calculate segment lengths and total length
    for (const segment of segments) {
      const length = this.calculateSegmentLength(segment);
      this.segmentLengths.push(length);
      this.totalLength += length;
    }
  }

  private calculateSegmentLength(segment: TrackSegment): number {
    const dx = segment.end.x - segment.start.x;
    const dy = segment.end.y - segment.start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getSegments(): TrackSegment[] {
    return [...this.segments];
  }

  getWidth(): number {
    // Return the width of the first segment (assuming uniform width for now)
    return this.segments[0].width;
  }

  getLength(): number {
    return this.totalLength;
  }

  getSegmentAt(distance: number): TrackSegment | null {
    if (distance < 0 || distance > this.totalLength) {
      return null;
    }

    let accumulatedDistance = 0;
    for (let i = 0; i < this.segments.length; i++) {
      accumulatedDistance += this.segmentLengths[i];
      if (distance <= accumulatedDistance) {
        return this.segments[i];
      }
    }

    return this.segments[this.segments.length - 1];
  }

  getBoundariesAt(position: Point2D): TrackBoundary | null {
    // For straight tracks, simply check if we're within track bounds
    if (this.segments.length === 1 && this.segments[0].start.x === this.segments[0].end.x) {
      // This is a straight track along Y axis
      const segment = this.segments[0];
      if (position.y < segment.start.y || position.y > segment.end.y) {
        return null;
      }
      
      // Return boundaries at this Y position
      const halfWidth = segment.width / 2;
      return {
        left: { x: position.x - halfWidth, y: position.y },
        right: { x: position.x + halfWidth, y: position.y }
      };
    }
    
    // Find the nearest point on track
    const nearest = this.getNearestPointOnTrack(position);
    const segment = this.segments[nearest.segmentIndex];
    
    if (!segment) {
      return null;
    }
    
    // Calculate the position along the segment (0 to 1)
    const segmentLength = this.calculateSegmentLength(segment);
    const dx = nearest.point.x - segment.start.x;
    const dy = nearest.point.y - segment.start.y;
    const distanceAlongSegment = Math.sqrt(dx * dx + dy * dy);
    const t = segmentLength > 0 ? distanceAlongSegment / segmentLength : 0;
    
    // Get the direction vector of the segment
    const dirX = segment.end.x - segment.start.x;
    const dirY = segment.end.y - segment.start.y;
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    if (length === 0) {
      return {
        left: segment.leftBoundary,
        right: segment.rightBoundary
      };
    }
    
    // Normalize direction
    const normalizedDirX = dirX / length;
    const normalizedDirY = dirY / length;
    
    // Calculate perpendicular vector (pointing left)
    const perpX = -normalizedDirY;
    const perpY = normalizedDirX;
    
    // Calculate boundary positions at this point
    const halfWidth = segment.width / 2;
    const centerX = segment.start.x + dirX * t;
    const centerY = segment.start.y + dirY * t;
    
    return {
      left: {
        x: centerX + perpX * halfWidth,
        y: centerY + perpY * halfWidth
      },
      right: {
        x: centerX - perpX * halfWidth,
        y: centerY - perpY * halfWidth
      }
    };
  }

  private isPositionInSegment(position: Point2D, segment: TrackSegment): boolean {
    // Check if position is near this segment
    const nearest = this.getNearestPointOnSegment(position, segment);
    const distance = this.calculateDistance(position, nearest);
    return distance <= segment.width;
  }

  checkCollision(position: Point2D): CollisionResult {
    const boundaries = this.getBoundariesAt(position);
    
    if (!boundaries) {
      return {
        collision: true,
        side: 'out_of_bounds'
      };
    }

    // Get nearest point on track to determine which side we're on
    const nearest = this.getNearestPointOnTrack(position);
    const segment = this.segments[nearest.segmentIndex];
    
    // Calculate vector from nearest point to position
    const toPositionX = position.x - nearest.point.x;
    const toPositionY = position.y - nearest.point.y;
    
    // Get track direction at this point
    const dirX = segment.end.x - segment.start.x;
    const dirY = segment.end.y - segment.start.y;
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    if (length === 0) {
      return {
        collision: false,
        distanceToLeft: segment.width / 2,
        distanceToRight: segment.width / 2
      };
    }
    
    // Normalize direction
    const normalizedDirX = dirX / length;
    const normalizedDirY = dirY / length;
    
    // Calculate perpendicular vector (pointing left)
    const perpX = -normalizedDirY;
    const perpY = normalizedDirX;
    
    // Dot product to determine which side of track
    const dotProduct = toPositionX * perpX + toPositionY * perpY;
    const distanceFromCenter = Math.abs(dotProduct);
    const halfWidth = segment.width / 2;
    
    // Check if we're outside track boundaries
    if (distanceFromCenter > halfWidth) {
      if (dotProduct > 0) {
        // Left side collision
        return {
          collision: true,
          side: 'left',
          penetration: distanceFromCenter - halfWidth,
          distanceToLeft: 0,
          distanceToRight: segment.width
        };
      } else {
        // Right side collision
        return {
          collision: true,
          side: 'right',
          penetration: distanceFromCenter - halfWidth,
          distanceToLeft: segment.width,
          distanceToRight: 0
        };
      }
    }
    
    // No collision - calculate distances to boundaries
    const distanceToLeft = halfWidth + dotProduct;
    const distanceToRight = halfWidth - dotProduct;
    
    return {
      collision: false,
      distanceToLeft: Math.max(0, distanceToLeft),
      distanceToRight: Math.max(0, distanceToRight)
    };
  }

  getPositionOnTrack(distance: number): Point2D {
    // Clamp distance to track length
    distance = Math.max(0, Math.min(distance, this.totalLength));

    let accumulatedDistance = 0;
    for (let i = 0; i < this.segments.length; i++) {
      const segmentLength = this.segmentLengths[i];
      
      if (distance <= accumulatedDistance + segmentLength) {
        const segment = this.segments[i];
        const t = (distance - accumulatedDistance) / segmentLength;
        
        // Interpolate position along segment
        return {
          x: segment.start.x + (segment.end.x - segment.start.x) * t,
          y: segment.start.y + (segment.end.y - segment.start.y) * t
        };
      }
      
      accumulatedDistance += segmentLength;
    }

    // Return end position if we somehow get here
    const lastSegment = this.segments[this.segments.length - 1];
    return { ...lastSegment.end };
  }

  getNearestPointOnTrack(position: Point2D): NearestPointResult {
    let nearestPoint: Point2D = { x: 0, y: 0 };
    let minDistance = Infinity;
    let nearestSegmentIndex = 0;

    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const point = this.getNearestPointOnSegment(position, segment);
      const distance = this.calculateDistance(position, point);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
        nearestSegmentIndex = i;
      }
    }

    return {
      point: nearestPoint,
      distance: minDistance,
      segmentIndex: nearestSegmentIndex
    };
  }

  private getNearestPointOnSegment(point: Point2D, segment: TrackSegment): Point2D {
    const dx = segment.end.x - segment.start.x;
    const dy = segment.end.y - segment.start.y;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      return { ...segment.start };
    }

    const t = Math.max(0, Math.min(1, 
      ((point.x - segment.start.x) * dx + (point.y - segment.start.y) * dy) / lengthSquared
    ));

    return {
      x: segment.start.x + dx * t,
      y: segment.start.y + dy * t
    };
  }

  private calculateDistance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Static factory methods for creating common track types
  static createStraightTrack(length: number, width: number): Track {
    const halfWidth = width / 2;
    const segments: TrackSegment[] = [{
      start: { x: 0, y: 0 },
      end: { x: 0, y: length },
      width: width,
      leftBoundary: { x: -halfWidth, y: 0 },
      rightBoundary: { x: halfWidth, y: 0 }
    }];
    
    return new Track(segments);
  }

  static createOvalTrack(length: number, width: number, trackWidth: number): Track {
    const segments: TrackSegment[] = [];
    const halfWidth = width / 2;
    const halfLength = length / 2;
    const numCurveSegments = 8; // Segments per curve
    
    // Top straight
    segments.push({
      start: { x: -halfWidth, y: -halfLength },
      end: { x: halfWidth, y: -halfLength },
      width: trackWidth,
      leftBoundary: { x: 0, y: -halfLength - trackWidth/2 },
      rightBoundary: { x: 0, y: -halfLength + trackWidth/2 }
    });
    
    // Right curve
    for (let i = 0; i <= numCurveSegments; i++) {
      const angle1 = -Math.PI/2 + (i * Math.PI / numCurveSegments);
      const angle2 = -Math.PI/2 + ((i + 1) * Math.PI / numCurveSegments);
      
      if (i < numCurveSegments) {
        segments.push({
          start: {
            x: halfWidth + halfLength * Math.cos(angle1),
            y: halfLength * Math.sin(angle1)
          },
          end: {
            x: halfWidth + halfLength * Math.cos(angle2),
            y: halfLength * Math.sin(angle2)
          },
          width: trackWidth,
          leftBoundary: {
            x: halfWidth + (halfLength - trackWidth/2) * Math.cos((angle1 + angle2) / 2),
            y: (halfLength - trackWidth/2) * Math.sin((angle1 + angle2) / 2)
          },
          rightBoundary: {
            x: halfWidth + (halfLength + trackWidth/2) * Math.cos((angle1 + angle2) / 2),
            y: (halfLength + trackWidth/2) * Math.sin((angle1 + angle2) / 2)
          }
        });
      }
    }
    
    // Bottom straight
    segments.push({
      start: { x: halfWidth, y: halfLength },
      end: { x: -halfWidth, y: halfLength },
      width: trackWidth,
      leftBoundary: { x: 0, y: halfLength + trackWidth/2 },
      rightBoundary: { x: 0, y: halfLength - trackWidth/2 }
    });
    
    // Left curve
    for (let i = 0; i <= numCurveSegments; i++) {
      const angle1 = Math.PI/2 + (i * Math.PI / numCurveSegments);
      const angle2 = Math.PI/2 + ((i + 1) * Math.PI / numCurveSegments);
      
      if (i < numCurveSegments) {
        segments.push({
          start: {
            x: -halfWidth + halfLength * Math.cos(angle1),
            y: halfLength * Math.sin(angle1)
          },
          end: {
            x: -halfWidth + halfLength * Math.cos(angle2),
            y: halfLength * Math.sin(angle2)
          },
          width: trackWidth,
          leftBoundary: {
            x: -halfWidth + (halfLength + trackWidth/2) * Math.cos((angle1 + angle2) / 2),
            y: (halfLength + trackWidth/2) * Math.sin((angle1 + angle2) / 2)
          },
          rightBoundary: {
            x: -halfWidth + (halfLength - trackWidth/2) * Math.cos((angle1 + angle2) / 2),
            y: (halfLength - trackWidth/2) * Math.sin((angle1 + angle2) / 2)
          }
        });
      }
    }
    
    return new Track(segments);
  }
}
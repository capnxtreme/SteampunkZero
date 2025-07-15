import { describe, it, expect, beforeEach } from 'vitest';
import { Track, TrackSegment, TrackBoundary, CollisionResult } from './Track';

describe('Track', () => {
  let track: Track;

  beforeEach(() => {
    // Create a simple straight track for testing
    const segments: TrackSegment[] = [
      {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1000 },
        width: 200,
        leftBoundary: { x: -100, y: 0 },
        rightBoundary: { x: 100, y: 0 }
      }
    ];
    track = new Track(segments);
  });

  describe('constructor', () => {
    it('should initialize with provided segments', () => {
      expect(track.getSegments()).toHaveLength(1);
      expect(track.getWidth()).toBe(200);
      expect(track.getLength()).toBe(1000);
    });

    it('should throw error if no segments provided', () => {
      expect(() => new Track([])).toThrow('Track must have at least one segment');
    });

    it('should calculate total length correctly for multiple segments', () => {
      const segments: TrackSegment[] = [
        {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 500 },
          width: 200,
          leftBoundary: { x: -100, y: 0 },
          rightBoundary: { x: 100, y: 0 }
        },
        {
          start: { x: 0, y: 500 },
          end: { x: 500, y: 500 },
          width: 200,
          leftBoundary: { x: 0, y: 400 },
          rightBoundary: { x: 0, y: 600 }
        }
      ];
      const multiTrack = new Track(segments);
      expect(multiTrack.getLength()).toBe(1000);
    });
  });

  describe('getSegmentAt', () => {
    it('should return correct segment for given distance', () => {
      const segment = track.getSegmentAt(500);
      expect(segment).toBeDefined();
      expect(segment?.start.y).toBe(0);
      expect(segment?.end.y).toBe(1000);
    });

    it('should return null for distance beyond track length', () => {
      expect(track.getSegmentAt(1500)).toBeNull();
    });

    it('should return null for negative distance', () => {
      expect(track.getSegmentAt(-100)).toBeNull();
    });
  });

  describe('getBoundariesAt', () => {
    it('should return track boundaries at given position', () => {
      const boundaries = track.getBoundariesAt({ x: 0, y: 500 });
      expect(boundaries).toBeDefined();
      expect(boundaries?.left.x).toBe(-100);
      expect(boundaries?.right.x).toBe(100);
    });

    it('should interpolate boundaries for positions between segments', () => {
      const segments: TrackSegment[] = [
        {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 500 },
          width: 200,
          leftBoundary: { x: -100, y: 0 },
          rightBoundary: { x: 100, y: 0 }
        },
        {
          start: { x: 0, y: 500 },
          end: { x: 0, y: 1000 },
          width: 300,
          leftBoundary: { x: -150, y: 500 },
          rightBoundary: { x: 150, y: 500 }
        }
      ];
      const variedTrack = new Track(segments);
      const boundaries = variedTrack.getBoundariesAt({ x: 0, y: 750 });
      expect(boundaries?.left.x).toBe(-150);
      expect(boundaries?.right.x).toBe(150);
    });
  });

  describe('checkCollision', () => {
    it('should detect no collision when position is within track', () => {
      const result = track.checkCollision({ x: 0, y: 500 });
      expect(result.collision).toBe(false);
      expect(result.distanceToLeft).toBeCloseTo(100);
      expect(result.distanceToRight).toBeCloseTo(100);
    });

    it('should detect left boundary collision', () => {
      const result = track.checkCollision({ x: -120, y: 500 });
      expect(result.collision).toBe(true);
      expect(result.side).toBe('left');
      expect(result.penetration).toBeCloseTo(20);
    });

    it('should detect right boundary collision', () => {
      const result = track.checkCollision({ x: 120, y: 500 });
      expect(result.collision).toBe(true);
      expect(result.side).toBe('right');
      expect(result.penetration).toBeCloseTo(20);
    });

    it('should detect out of bounds collision', () => {
      const result = track.checkCollision({ x: 0, y: 1500 });
      expect(result.collision).toBe(true);
      expect(result.side).toBe('out_of_bounds');
    });
  });

  describe('getPositionOnTrack', () => {
    it('should return normalized position on track center', () => {
      const position = track.getPositionOnTrack(500);
      expect(position.x).toBe(0);
      expect(position.y).toBe(500);
    });

    it('should handle positions at track start', () => {
      const position = track.getPositionOnTrack(0);
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    it('should handle positions at track end', () => {
      const position = track.getPositionOnTrack(1000);
      expect(position.x).toBe(0);
      expect(position.y).toBe(1000);
    });

    it('should clamp positions beyond track length', () => {
      const position = track.getPositionOnTrack(1500);
      expect(position.x).toBe(0);
      expect(position.y).toBe(1000);
    });
  });

  describe('getNearestPointOnTrack', () => {
    it('should find nearest point when position is off track', () => {
      const nearest = track.getNearestPointOnTrack({ x: 200, y: 500 });
      expect(nearest.point.x).toBe(0); // Track centerline
      expect(nearest.point.y).toBe(500);
      expect(nearest.distance).toBeCloseTo(200);
    });

    it('should return same point when on track center', () => {
      const nearest = track.getNearestPointOnTrack({ x: 0, y: 500 });
      expect(nearest.point.x).toBe(0);
      expect(nearest.point.y).toBe(500);
      expect(nearest.distance).toBe(0);
    });
  });
});

describe('Track.createStraightTrack', () => {
  it('should create a straight track with specified parameters', () => {
    const track = Track.createStraightTrack(2000, 250);
    expect(track.getLength()).toBe(2000);
    expect(track.getWidth()).toBe(250);
    
    const boundaries = track.getBoundariesAt({ x: 0, y: 1000 });
    expect(boundaries?.left.x).toBe(-125);
    expect(boundaries?.right.x).toBe(125);
  });
});

describe('Track.createOvalTrack', () => {
  it('should create an oval track with specified parameters', () => {
    const track = Track.createOvalTrack(1000, 500, 200);
    expect(track.getWidth()).toBe(200);
    expect(track.getSegments().length).toBeGreaterThan(4); // At least straight and curved sections
  });

  it('should have continuous boundaries', () => {
    const track = Track.createOvalTrack(1000, 500, 200);
    const segments = track.getSegments();
    
    // Check that segments connect properly
    for (let i = 1; i < segments.length; i++) {
      const prevEnd = segments[i - 1].end;
      const currStart = segments[i].start;
      expect(Math.abs(prevEnd.x - currStart.x)).toBeLessThan(0.01);
      expect(Math.abs(prevEnd.y - currStart.y)).toBeLessThan(0.01);
    }
  });
});
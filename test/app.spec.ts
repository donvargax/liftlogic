import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../src/app';

describe('LiftLogic Calculator', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  it('should initialize with default values', () => {
    expect(app.currentWeight).toBe(0);
    expect(app.oneRM).toBe(0);
    expect(app.tenRM).toBe(0);
    expect(app.twentyRM).toBe(0);
    expect(app.thirtyRM).toBe(0);
  });

  it('should not calculate RMs with zero or negative weight', () => {
    // Set initial values to ensure they don't change
    app.oneRM = 100;
    app.tenRM = 100;
    app.twentyRM = 100;
    app.thirtyRM = 100;
    
    // Test with zero weight
    app.currentWeight = 0;
    app.calculateRMs();
    
    expect(app.oneRM).toBe(100);
    expect(app.tenRM).toBe(100);
    expect(app.twentyRM).toBe(100);
    expect(app.thirtyRM).toBe(100);
    
    // Test with negative weight
    app.currentWeight = -10;
    app.calculateRMs();
    
    expect(app.oneRM).toBe(100);
    expect(app.tenRM).toBe(100);
    expect(app.twentyRM).toBe(100);
    expect(app.thirtyRM).toBe(100);
  });

  it('should correctly calculate all RMs for 225 lbs', () => {
    app.currentWeight = 225;
    app.calculateRMs();
    
    // Using Brzycki formula with coefficient 36 and assuming 5 reps
    // 1RM = weight * (1 + reps/36)
    // Expected 1RM = 225 * (1 + 5/36) ≈ 256.25
    expect(app.oneRM).toBeCloseTo(256.25, 1);
    
    // 10RM = 1RM / (1 + 10/36) ≈ 256.25 / 1.278 ≈ 200.5
    expect(app.tenRM).toBeCloseTo(200.5, 1);
    
    // 20RM = 1RM / (1 + 20/36) ≈ 256.25 / 1.556 ≈ 164.7
    expect(app.twentyRM).toBeCloseTo(164.7, 1);
    
    // 30RM = 1RM / (1 + 30/36) ≈ 256.25 / 1.833 ≈ 139.8
    expect(app.thirtyRM).toBeCloseTo(139.8, 1);
  });

  it('should correctly calculate all RMs for 100 kg', () => {
    app.currentWeight = 100;
    app.calculateRMs();
    
    // Using same formula as above
    // Expected 1RM = 100 * (1 + 5/36) ≈ 113.9
    expect(app.oneRM).toBeCloseTo(113.9, 1);
    
    // 10RM = 113.9 / (1 + 10/36) ≈ 89.1
    expect(app.tenRM).toBeCloseTo(89.1, 1);
    
    // 20RM = 113.9 / (1 + 20/36) ≈ 73.2
    expect(app.twentyRM).toBeCloseTo(73.2, 1);
    
    // 30RM = 113.9 / (1 + 30/36) ≈ 62.1
    expect(app.thirtyRM).toBeCloseTo(62.1, 1);
  });

  it('should round weights up to nearest 2.5 units', () => {
    expect(app.roundToPlate(100.1)).toBe(102.5);
    expect(app.roundToPlate(101.2)).toBe(102.5);
    expect(app.roundToPlate(101.3)).toBe(102.5);
    expect(app.roundToPlate(103.7)).toBe(105);
    expect(app.roundToPlate(99.9)).toBe(100);
    expect(app.roundToPlate(98.7)).toBe(100);
  });
});

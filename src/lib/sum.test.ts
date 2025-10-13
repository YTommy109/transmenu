import { describe, expect, it } from 'vitest';
import { sum } from './sum';

describe('sum function', () => {
  it('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('adds 5 + 7 to equal 12', () => {
    expect(sum(5, 7)).toBe(12);
  });

  it('adds negative numbers correctly', () => {
    expect(sum(-1, -2)).toBe(-3);
  });

  it('adds decimal numbers correctly', () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
});

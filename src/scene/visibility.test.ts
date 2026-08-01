import { describe, expect, it } from 'vitest';
import { isObjectUsablyVisible } from './visibility';

const canvas = { left: 0, top: 0, right: 1000, bottom: 700 };

describe('object visibility', () => {
  it('keeps a visible, unobstructed object in the current view', () => {
    expect(
      isObjectUsablyVisible({
        canvas,
        center: { x: 500, y: 350 },
        object: { left: 420, top: 260, right: 580, bottom: 440 },
        obstructions: [],
      }),
    ).toBe(true);
  });

  it('requests reframing when the object center leaves the canvas', () => {
    expect(
      isObjectUsablyVisible({
        canvas,
        center: { x: 1100, y: 350 },
        object: { left: 980, top: 260, right: 1180, bottom: 440 },
        obstructions: [],
      }),
    ).toBe(false);
  });

  it('requests reframing when a panel covers the object center', () => {
    expect(
      isObjectUsablyVisible({
        canvas,
        center: { x: 850, y: 220 },
        object: { left: 760, top: 130, right: 940, bottom: 310 },
        obstructions: [{ left: 720, top: 20, right: 980, bottom: 380 }],
      }),
    ).toBe(false);
  });

  it('allows a partial overlap while most of the object remains readable', () => {
    expect(
      isObjectUsablyVisible({
        canvas,
        center: { x: 500, y: 350 },
        object: { left: 350, top: 200, right: 650, bottom: 500 },
        obstructions: [{ left: 0, top: 0, right: 380, bottom: 700 }],
      }),
    ).toBe(true);
  });
});

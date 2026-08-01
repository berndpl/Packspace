import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SPACE_ID,
  SPACE_CATALOG,
  getSpace,
  resolveSpaceId,
} from './spaces';

describe('space catalog', () => {
  it('contains the six v1 spaces with unique IDs', () => {
    expect(SPACE_CATALOG.map((space) => space.id)).toEqual([
      'empty',
      'shinkansen-overhead',
      'shinkansen-oversized',
      'shinkansen-bulkhead',
      'plane-overhead',
      'plane-underseat',
    ]);
    expect(new Set(SPACE_CATALOG.map((space) => space.id)).size).toBe(6);
  });

  it('keeps evidence on every non-empty axis', () => {
    for (const space of SPACE_CATALOG.filter((candidate) => candidate.dimensions !== null)) {
      for (const axis of Object.values(space.dimensions!)) {
        expect(axis.value_cm).toBeGreaterThan(0);
        expect(['published', 'estimated', 'inferred']).toContain(axis.confidence);
        expect(new URL(axis.source).protocol).toMatch(/^https?:$/);
        if (axis.min_cm !== undefined) {
          expect(axis.min_cm).toBeLessThanOrEqual(axis.value_cm);
        }
        if (axis.max_cm !== undefined) {
          expect(axis.max_cm).toBeGreaterThanOrEqual(axis.value_cm);
        }
      }
    }
  });

  it('records the mixed-confidence shinkansen rack accurately', () => {
    expect(getSpace('shinkansen-overhead').dimensions).toMatchObject({
      width: { value_cm: 90, confidence: 'estimated' },
      height: { value_cm: 32, confidence: 'estimated' },
      depth: { value_cm: 42, confidence: 'published' },
    });
  });

  it('models the plane overhead bin as one 33–43 cm range', () => {
    expect(getSpace('plane-overhead').dimensions?.height).toMatchObject({
      value_cm: 33,
      min_cm: 33,
      max_cm: 43,
    });
  });

  it('resolves absent and unknown environment IDs safely', () => {
    expect(DEFAULT_SPACE_ID).toBe('shinkansen-overhead');
    expect(resolveSpaceId(undefined)).toBe(DEFAULT_SPACE_ID);
    expect(resolveSpaceId('plane-underseat')).toBe('plane-underseat');
    expect(resolveSpaceId('unknown-cabin')).toBe('empty');
  });
});

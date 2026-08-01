import { describe, expect, it } from 'vitest';
import { ORIENTATIONS, evaluatePolicy, fitObjectToSpace } from './fit';
import { getSpace, type SpaceDefinition } from './spaces';

function boundedSpace(
  width: number,
  height: number,
  depth: number,
  options: {
    confidence?: 'published' | 'estimated' | 'inferred';
    maxHeight?: number;
  } = {},
): SpaceDefinition {
  const confidence = options.confidence ?? 'published';
  const axis = (value_cm: number) => ({
    value_cm,
    confidence,
    source: 'https://example.com/space',
    note: 'test',
  });

  return {
    id: 'empty',
    category: 'Reference',
    name: 'Test space',
    shortName: 'Test',
    description: 'Test',
    kind: 'physical',
    dimensions: {
      width: axis(width),
      height: {
        ...axis(height),
        ...(options.maxHeight ? { min_cm: height, max_cm: options.maxHeight } : {}),
      },
      depth: axis(depth),
    },
    placement: [0, 0, 0],
    framing: {
      target: [0, 0, 0],
      views: {
        front: [0, 0, 1],
        side: [1, 0, 0],
        top: [0, 1, 0],
        free: [1, 1, 1],
      },
    },
  };
}

describe('physical fit', () => {
  it('defines all six unique axis-aligned permutations', () => {
    expect(ORIENTATIONS).toHaveLength(6);
    expect(new Set(ORIENTATIONS.map((orientation) => orientation.id)).size).toBe(6);
  });

  it('prefers the intrinsic orientation when it has practical clearance', () => {
    const result = fitObjectToSpace(
      { w: 40, h: 50, d: 20 },
      boundedSpace(60, 60, 60),
    );

    expect(result).toMatchObject({
      kind: 'fits',
      rotated: false,
      orientation: { id: 'w-h-d' },
      orientedDimensions: { width: 40, height: 50, depth: 20 },
    });
  });

  it('finds a rotated practical fit and reports the chosen mapping', () => {
    const result = fitObjectToSpace(
      { w: 40, h: 50, d: 20 },
      boundedSpace(52, 42, 25),
    );

    expect(result).toMatchObject({
      kind: 'rotated',
      rotated: true,
      orientation: { id: 'h-w-d' },
      orientedDimensions: { width: 50, height: 40, depth: 20 },
    });
  });

  it('calls a geometric-only fit tight rather than green', () => {
    const result = fitObjectToSpace(
      { w: 40, h: 55, d: 23 },
      boundedSpace(40, 55, 23),
    );

    expect(result).toMatchObject({
      kind: 'tight',
      rotated: false,
      clearance_cm: { width: 0, height: 0, depth: 0 },
    });
  });

  it('chooses the deterministic least-bad failed rotation and reports every overflow', () => {
    const result = fitObjectToSpace(
      { w: 50, h: 45, d: 35 },
      boundedSpace(60, 30, 40),
    );

    expect(result).toMatchObject({
      kind: 'fails',
      orientation: { id: 'w-d-h' },
      overflow_cm: { width: 0, height: 5, depth: 5 },
    });
  });

  it('returns configuration-dependent when only the larger envelope fits', () => {
    const result = fitObjectToSpace(
      { w: 48, h: 40, d: 28 },
      boundedSpace(50, 33, 30, { confidence: 'estimated', maxHeight: 43 }),
    );

    expect(result).toMatchObject({
      kind: 'varies',
      range: 'configuration',
      orientation: { id: 'w-h-d' },
    });
  });

  it('marks an estimated geometric-only fit uncertain', () => {
    const result = fitObjectToSpace(
      { w: 40, h: 55, d: 23 },
      boundedSpace(40, 55, 23, { confidence: 'estimated' }),
    );

    expect(result).toMatchObject({
      kind: 'tight',
      decisiveConfidence: 'estimated',
      uncertain: true,
    });
  });

  it('returns reference mode for the empty space', () => {
    expect(fitObjectToSpace({ w: 40, h: 55, d: 23 }, getSpace('empty'))).toEqual({
      kind: 'reference',
    });
  });
});

describe('operator policy', () => {
  const shinkansen = getSpace('shinkansen-overhead').policy;

  it.each([
    [{ w: 100, h: 40, d: 20 }, 'complies'],
    [{ w: 101, h: 40, d: 20 }, 'reservation-required'],
    [{ w: 190, h: 40, d: 20 }, 'reservation-required'],
    [{ w: 191, h: 40, d: 20 }, 'not-permitted'],
    [{ w: 201, h: 20, d: 20 }, 'not-permitted'],
  ] as const)('applies the shinkansen dimension bands to %j', (dimensions, status) => {
    expect(evaluatePolicy(dimensions, shinkansen)).toMatchObject({
      status,
      dimensionOnly: true,
    });
  });

  it('checks airline allowances in intrinsic orientation without rotating to game them', () => {
    const policy = getSpace('plane-overhead').policy;
    expect(evaluatePolicy({ w: 40, h: 50, d: 20 }, policy)).toMatchObject({
      status: 'exceeds',
      overflow_cm: { w: 4.4, h: 0, d: 0 },
    });
  });

  it('returns not-applicable without a policy', () => {
    expect(evaluatePolicy({ w: 40, h: 50, d: 20 }, undefined)).toEqual({
      status: 'not-applicable',
      dimensionOnly: true,
    });
  });
});

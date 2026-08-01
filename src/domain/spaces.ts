import type { Confidence } from './payload';

export type Position3 = readonly [number, number, number];
export type CameraView = 'front' | 'side' | 'top' | 'free';

export interface SceneFraming {
  target: Position3;
  views: Readonly<Record<CameraView, Position3>>;
}

export type SpaceId =
  | 'empty'
  | 'shinkansen-overhead'
  | 'shinkansen-oversized'
  | 'shinkansen-bulkhead'
  | 'plane-overhead'
  | 'plane-underseat';

export interface AxisEvidence {
  value_cm: number;
  min_cm?: number;
  max_cm?: number;
  confidence: Confidence;
  source: string;
  note: string;
}

export interface SpaceDimensions {
  width: AxisEvidence;
  height: AxisEvidence;
  depth: AxisEvidence;
}

export type OperatorPolicy =
  | {
      kind: 'shinkansen-dimensions';
      name: string;
      source: string;
    }
  | {
      kind: 'airline-box';
      name: string;
      source: string;
      limits_cm: {
        w: number;
        h: number;
        d: number;
      };
    };

export interface SpaceDefinition {
  id: SpaceId;
  category: 'Reference' | 'Shinkansen' | 'Plane';
  name: string;
  shortName: string;
  description: string;
  kind: 'reference' | 'physical' | 'policy-envelope';
  dimensions: SpaceDimensions | null;
  policy?: OperatorPolicy;
  placement: Position3;
  rotationY?: number;
  framing: SceneFraming;
}

const JR_SOURCE = 'https://global.jr-central.co.jp/en/info/oversized-baggage/';
const RESEARCH_SOURCE = 'https://github.com/berndpl/Packspace/issues/2';
const AA_SOURCE = 'https://www.aa.com/i18n/travel-info/baggage/carry-on-baggage.html';

export const DEFAULT_SPACE_ID: SpaceId = 'shinkansen-overhead';

export const SPACE_CATALOG: readonly SpaceDefinition[] = [
  {
    id: 'empty',
    category: 'Reference',
    name: 'Empty reference space',
    shortName: 'No environment',
    description: 'No fit boundary — use the grid and 168 cm human for scale.',
    kind: 'reference',
    dimensions: null,
    placement: [0, 0, 0],
    framing: {
      target: [0, 0.85, 0],
      views: {
        front: [0, 0.85, 3.2],
        side: [3.2, 0.85, 0],
        top: [0.001, 3.65, 0],
        free: [2.2, 1.55, 2.55],
      },
    },
  },
  {
    id: 'shinkansen-overhead',
    category: 'Shinkansen',
    name: 'Shinkansen overhead rack',
    shortName: 'Overhead rack',
    description:
      'Tokaido Shinkansen rack. JR publishes the depth; width and opening height are estimates.',
    kind: 'physical',
    dimensions: {
      width: {
        value_cm: 90,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: 'Secondary estimate; JR Central does not publish rack width.',
      },
      height: {
        value_cm: 32,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: 'Secondary estimate of the usable opening; not a JR specification.',
      },
      depth: {
        value_cm: 42,
        confidence: 'published',
        source: JR_SOURCE,
        note: 'JR Central says the Tokaido Shinkansen rack extends back approximately 42 cm.',
      },
    },
    policy: {
      kind: 'shinkansen-dimensions',
      name: 'Tokaido–Sanyo–Kyushu Shinkansen dimensional rule',
      source: JR_SOURCE,
    },
    placement: [1.28, 1.42, 0],
    rotationY: Math.PI / 2,
    framing: {
      target: [0.7, 1.2, 0],
      views: {
        front: [0.3, 1.35, 4.55],
        side: [-4.55, 1.35, 0],
        top: [0.001, 5.2, 0],
        free: [-3.7, 2.3, 3.85],
      },
    },
  },
  {
    id: 'shinkansen-oversized',
    category: 'Shinkansen',
    name: 'Shinkansen oversized baggage envelope',
    shortName: 'Oversized envelope',
    description:
      'The published 80 × 60 × 40 cm accepted-piece cap — a policy envelope, not a measured cavity.',
    kind: 'policy-envelope',
    dimensions: {
      width: {
        value_cm: 80,
        confidence: 'published',
        source: JR_SOURCE,
        note: 'Published component of JR Central’s 80 × 60 × 40 cm compartment limit.',
      },
      height: {
        value_cm: 60,
        confidence: 'published',
        source: JR_SOURCE,
        note: 'Published component; the source does not assign axes, so this orientation is visual.',
      },
      depth: {
        value_cm: 40,
        confidence: 'published',
        source: JR_SOURCE,
        note: 'Published component; this is an allowance box rather than measured interior geometry.',
      },
    },
    policy: {
      kind: 'shinkansen-dimensions',
      name: 'Tokaido–Sanyo–Kyushu Shinkansen dimensional rule',
      source: JR_SOURCE,
    },
    placement: [1.15, 0, -1.75],
    framing: {
      target: [0.65, 0.95, -0.45],
      views: {
        front: [0.3, 1.25, 4.55],
        side: [-4.55, 1.25, -0.45],
        top: [0.001, 5.2, -0.45],
        free: [-3.7, 2.3, 3.85],
      },
    },
  },
  {
    id: 'shinkansen-bulkhead',
    category: 'Shinkansen',
    name: 'Shinkansen front-row gap',
    shortName: 'Front-row gap',
    description:
      'An inferred bulkhead/front-row volume. JR publishes no cavity dimensions for this space.',
    kind: 'physical',
    dimensions: {
      width: {
        value_cm: 50,
        min_cm: 45,
        max_cm: 55,
        confidence: 'inferred',
        source: RESEARCH_SOURCE,
        note: 'Inferred 45–55 cm fore-aft range from seat pitch and photographs.',
      },
      height: {
        value_cm: 90,
        confidence: 'inferred',
        source: RESEARCH_SOURCE,
        note: 'Inferred usable height; no operator measurement was found.',
      },
      depth: {
        value_cm: 50,
        confidence: 'inferred',
        source: RESEARCH_SOURCE,
        note: 'Inferred cross-car width; use as a rough planning model only.',
      },
    },
    policy: {
      kind: 'shinkansen-dimensions',
      name: 'Tokaido–Sanyo–Kyushu Shinkansen dimensional rule',
      source: JR_SOURCE,
    },
    placement: [1.25, 0, 1.75],
    rotationY: Math.PI / 2,
    framing: {
      target: [0.65, 1.0, 0.45],
      views: {
        front: [0.3, 1.3, 4.55],
        side: [-4.55, 1.3, 0.45],
        top: [0.001, 5.2, 0.45],
        free: [-3.7, 2.3, 3.85],
      },
    },
  },
  {
    id: 'plane-overhead',
    category: 'Plane',
    name: 'Plane overhead bin',
    shortName: 'Overhead bin',
    description:
      'Common narrowbody estimate with a 33–43 cm height range across standard and Airspace cabins.',
    kind: 'physical',
    dimensions: {
      width: {
        value_cm: 88,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: 'Derived common A320 bin bay width; Airbus publishes no interior dimensions.',
      },
      height: {
        value_cm: 33,
        min_cm: 33,
        max_cm: 43,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: '33 cm conservative standard-cabin opening; 43 cm for larger Airspace bins.',
      },
      depth: {
        value_cm: 45,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: 'Common narrowbody estimate; not an Airbus or Boeing published interior dimension.',
      },
    },
    policy: {
      kind: 'airline-box',
      name: 'American Airlines carry-on dimensions',
      source: AA_SOURCE,
      limits_cm: { w: 35.6, h: 55.9, d: 22.9 },
    },
    placement: [1.28, 1.42, 0],
    rotationY: Math.PI / 2,
    framing: {
      target: [0.7, 1.2, 0],
      views: {
        front: [0.3, 1.35, 4.6],
        side: [-4.6, 1.35, 0],
        top: [0.001, 5.25, 0],
        free: [-3.75, 2.35, 3.9],
      },
    },
  },
  {
    id: 'plane-underseat',
    category: 'Plane',
    name: 'Plane under-seat space',
    shortName: 'Under seat',
    description:
      'A common A320 aisle/centre-seat estimate. Aircraft, airline, and seat hardware vary.',
    kind: 'physical',
    dimensions: {
      width: {
        value_cm: 42,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: 'Common passenger measurement, not an airline-guaranteed width.',
      },
      height: {
        value_cm: 28,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: 'Common passenger measurement; seat hardware can reduce usable height.',
      },
      depth: {
        value_cm: 47,
        confidence: 'estimated',
        source: RESEARCH_SOURCE,
        note: 'Common passenger measurement; usable depth varies by row and airline.',
      },
    },
    policy: {
      kind: 'airline-box',
      name: 'American Airlines personal-item dimensions',
      source: AA_SOURCE,
      limits_cm: { w: 45.7, h: 35.6, d: 20.3 },
    },
    placement: [0.94, 0, 0],
    framing: {
      target: [0.65, 0.9, 0],
      views: {
        front: [0.3, 1.2, 4.45],
        side: [-4.45, 1.2, 0],
        top: [0.001, 5.05, 0],
        free: [-3.6, 2.2, 3.75],
      },
    },
  },
];

const SPACES_BY_ID = new Map(SPACE_CATALOG.map((space) => [space.id, space]));

export function getSpace(id: SpaceId): SpaceDefinition {
  const space = SPACES_BY_ID.get(id);
  if (!space) throw new Error(`Unknown space: ${id}`);
  return space;
}

export function resolveSpaceId(id: string | undefined): SpaceId {
  if (!id) return DEFAULT_SPACE_ID;
  return SPACES_BY_ID.has(id as SpaceId) ? (id as SpaceId) : 'empty';
}

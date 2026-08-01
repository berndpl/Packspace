import type { Confidence } from './payload';
import type {
  AxisEvidence,
  OperatorPolicy,
  SpaceDefinition,
  SpaceDimensions,
} from './spaces';

export const PRACTICAL_CLEARANCE_CM = 2;

type ObjectAxis = 'w' | 'h' | 'd';
type SpaceAxis = 'width' | 'height' | 'depth';

export interface ObjectDimensions {
  w: number;
  h: number;
  d: number;
}

export interface OrientedDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Orientation {
  id: string;
  order: readonly [ObjectAxis, ObjectAxis, ObjectAxis];
  label: string;
}

export const ORIENTATIONS: readonly Orientation[] = [
  { id: 'w-h-d', order: ['w', 'h', 'd'], label: 'W × H × D (original)' },
  { id: 'w-d-h', order: ['w', 'd', 'h'], label: 'W × D × H' },
  { id: 'h-w-d', order: ['h', 'w', 'd'], label: 'H × W × D' },
  { id: 'h-d-w', order: ['h', 'd', 'w'], label: 'H × D × W' },
  { id: 'd-w-h', order: ['d', 'w', 'h'], label: 'D × W × H' },
  { id: 'd-h-w', order: ['d', 'h', 'w'], label: 'D × H × W' },
];

type AxisValues = Record<SpaceAxis, number>;

interface OrientationEvaluation {
  orientation: Orientation;
  orientedDimensions: OrientedDimensions;
  clearance_cm: AxisValues;
  practicalClearance_cm: AxisValues;
  overflow_cm: AxisValues;
  geometricFit: boolean;
  practicalFit: boolean;
  minimumClearance: number;
  maximumOverflow: number;
  totalOverflow: number;
}

export type FitResult =
  | { kind: 'reference' }
  | {
      kind: 'fits' | 'rotated' | 'tight' | 'varies' | 'fails';
      range: 'single' | 'all' | 'configuration';
      rotated: boolean;
      orientation: Orientation;
      orientedDimensions: OrientedDimensions;
      clearance_cm: AxisValues;
      practicalClearance_cm: AxisValues;
      overflow_cm: AxisValues;
      decisiveAxes: readonly SpaceAxis[];
      decisiveConfidence: Confidence;
      uncertain: boolean;
    };

export type PolicyResult =
  | { status: 'not-applicable'; dimensionOnly: true }
  | {
      status: 'complies' | 'reservation-required' | 'not-permitted';
      dimensionOnly: true;
      total_cm: number;
    }
  | {
      status: 'complies' | 'exceeds';
      dimensionOnly: true;
      overflow_cm: ObjectDimensions;
      limits_cm: ObjectDimensions;
    };

const AXES: readonly SpaceAxis[] = ['width', 'height', 'depth'];
const CONFIDENCE_WEIGHT: Record<Confidence, number> = {
  published: 0,
  estimated: 1,
  inferred: 2,
};

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function orientedDimensions(
  object: ObjectDimensions,
  orientation: Orientation,
): OrientedDimensions {
  return {
    width: object[orientation.order[0]],
    height: object[orientation.order[1]],
    depth: object[orientation.order[2]],
  };
}

function evaluateOrientation(
  object: ObjectDimensions,
  space: OrientedDimensions,
  orientation: Orientation,
): OrientationEvaluation {
  const oriented = orientedDimensions(object, orientation);
  const clearance: AxisValues = {
    width: round(space.width - oriented.width),
    height: round(space.height - oriented.height),
    depth: round(space.depth - oriented.depth),
  };
  const practicalClearance: AxisValues = {
    width: round(clearance.width - PRACTICAL_CLEARANCE_CM),
    height: round(clearance.height - PRACTICAL_CLEARANCE_CM),
    depth: round(clearance.depth - PRACTICAL_CLEARANCE_CM),
  };
  const overflow: AxisValues = {
    width: round(Math.max(0, -clearance.width)),
    height: round(Math.max(0, -clearance.height)),
    depth: round(Math.max(0, -clearance.depth)),
  };
  const clearanceValues = Object.values(clearance);
  const overflowValues = Object.values(overflow);

  return {
    orientation,
    orientedDimensions: oriented,
    clearance_cm: clearance,
    practicalClearance_cm: practicalClearance,
    overflow_cm: overflow,
    geometricFit: clearanceValues.every((value) => value >= 0),
    practicalFit: Object.values(practicalClearance).every((value) => value >= 0),
    minimumClearance: Math.min(...clearanceValues),
    maximumOverflow: Math.max(...overflowValues),
    totalOverflow: round(overflowValues.reduce((total, value) => total + value, 0)),
  };
}

function compareBestFit(a: OrientationEvaluation, b: OrientationEvaluation) {
  if (a.minimumClearance !== b.minimumClearance) {
    return b.minimumClearance - a.minimumClearance;
  }
  return (
    ORIENTATIONS.findIndex((orientation) => orientation.id === a.orientation.id) -
    ORIENTATIONS.findIndex((orientation) => orientation.id === b.orientation.id)
  );
}

function compareBestFailure(a: OrientationEvaluation, b: OrientationEvaluation) {
  if (a.maximumOverflow !== b.maximumOverflow) {
    return a.maximumOverflow - b.maximumOverflow;
  }
  if (a.totalOverflow !== b.totalOverflow) {
    return a.totalOverflow - b.totalOverflow;
  }
  return (
    ORIENTATIONS.findIndex((orientation) => orientation.id === a.orientation.id) -
    ORIENTATIONS.findIndex((orientation) => orientation.id === b.orientation.id)
  );
}

function evaluateEnvelope(object: ObjectDimensions, space: OrientedDimensions) {
  const evaluations = ORIENTATIONS.map((orientation) =>
    evaluateOrientation(object, space, orientation),
  );
  const original = evaluations[0];
  if (original.practicalFit) {
    return { classification: 'practical' as const, evaluation: original };
  }

  const practical = evaluations.filter((evaluation) => evaluation.practicalFit);
  if (practical.length) {
    return {
      classification: 'practical' as const,
      evaluation: practical.sort(compareBestFit)[0],
    };
  }

  const geometric = evaluations.filter((evaluation) => evaluation.geometricFit);
  if (geometric.length) {
    return {
      classification: 'tight' as const,
      evaluation: geometric.sort(compareBestFit)[0],
    };
  }

  return {
    classification: 'fails' as const,
    evaluation: evaluations.sort(compareBestFailure)[0],
  };
}

function envelope(dimensions: SpaceDimensions, edge: 'minimum' | 'maximum') {
  const value = (axis: AxisEvidence) =>
    edge === 'minimum'
      ? (axis.min_cm ?? axis.value_cm)
      : (axis.max_cm ?? axis.value_cm);
  return {
    width: value(dimensions.width),
    height: value(dimensions.height),
    depth: value(dimensions.depth),
  };
}

function hasRange(dimensions: SpaceDimensions) {
  return AXES.some((axis) => {
    const evidence = dimensions[axis];
    return (
      (evidence.min_cm !== undefined && evidence.min_cm !== evidence.value_cm) ||
      (evidence.max_cm !== undefined && evidence.max_cm !== evidence.value_cm)
    );
  });
}

function decisiveAxes(evaluation: OrientationEvaluation, kind: FitResult['kind']) {
  if (kind === 'fails') {
    return AXES.filter((axis) => evaluation.overflow_cm[axis] > 0);
  }

  const minimum = Math.min(...Object.values(evaluation.clearance_cm));
  return AXES.filter((axis) => evaluation.clearance_cm[axis] === minimum);
}

function weakestConfidence(dimensions: SpaceDimensions, axes: readonly SpaceAxis[]) {
  return axes
    .map((axis) => dimensions[axis].confidence)
    .sort((a, b) => CONFIDENCE_WEIGHT[b] - CONFIDENCE_WEIGHT[a])[0] ?? 'published';
}

function boundedResult(
  kind: Exclude<FitResult['kind'], 'reference'>,
  range: 'single' | 'all' | 'configuration',
  evaluation: OrientationEvaluation,
  dimensions: SpaceDimensions,
): FitResult {
  const axes =
    kind === 'varies'
      ? AXES.filter((axis) => {
          const evidence = dimensions[axis];
          return evidence.min_cm !== undefined || evidence.max_cm !== undefined;
        })
      : decisiveAxes(evaluation, kind);
  const confidence = weakestConfidence(dimensions, axes);

  return {
    kind,
    range,
    rotated: evaluation.orientation.id !== ORIENTATIONS[0].id,
    orientation: evaluation.orientation,
    orientedDimensions: evaluation.orientedDimensions,
    clearance_cm: evaluation.clearance_cm,
    practicalClearance_cm: evaluation.practicalClearance_cm,
    overflow_cm: evaluation.overflow_cm,
    decisiveAxes: axes,
    decisiveConfidence: confidence,
    uncertain:
      kind === 'varies' ||
      (kind === 'tight' && confidence !== 'published'),
  };
}

export function fitObjectToSpace(
  object: ObjectDimensions,
  space: SpaceDefinition,
): FitResult {
  if (!space.dimensions) return { kind: 'reference' };

  const minimum = evaluateEnvelope(object, envelope(space.dimensions, 'minimum'));
  if (!hasRange(space.dimensions)) {
    if (minimum.classification === 'practical') {
      return boundedResult(
        minimum.evaluation.orientation.id === ORIENTATIONS[0].id ? 'fits' : 'rotated',
        'single',
        minimum.evaluation,
        space.dimensions,
      );
    }
    return boundedResult(
      minimum.classification === 'tight' ? 'tight' : 'fails',
      'single',
      minimum.evaluation,
      space.dimensions,
    );
  }

  if (minimum.classification === 'practical') {
    return boundedResult(
      minimum.evaluation.orientation.id === ORIENTATIONS[0].id ? 'fits' : 'rotated',
      'all',
      minimum.evaluation,
      space.dimensions,
    );
  }

  const maximum = evaluateEnvelope(object, envelope(space.dimensions, 'maximum'));
  if (maximum.classification === 'practical') {
    return boundedResult(
      'varies',
      'configuration',
      maximum.evaluation,
      space.dimensions,
    );
  }
  return boundedResult(
    maximum.classification === 'tight' ? 'tight' : 'fails',
    'configuration',
    maximum.evaluation,
    space.dimensions,
  );
}

export function evaluatePolicy(
  object: ObjectDimensions,
  policy: OperatorPolicy | undefined,
): PolicyResult {
  if (!policy) return { status: 'not-applicable', dimensionOnly: true };

  if (policy.kind === 'shinkansen-dimensions') {
    const total = round(object.w + object.h + object.d);
    const longest = Math.max(object.w, object.h, object.d);
    if (total > 250 || longest > 200) {
      return { status: 'not-permitted', dimensionOnly: true, total_cm: total };
    }
    if (total > 160) {
      return {
        status: 'reservation-required',
        dimensionOnly: true,
        total_cm: total,
      };
    }
    return { status: 'complies', dimensionOnly: true, total_cm: total };
  }

  const overflow: ObjectDimensions = {
    w: round(Math.max(0, object.w - policy.limits_cm.w)),
    h: round(Math.max(0, object.h - policy.limits_cm.h)),
    d: round(Math.max(0, object.d - policy.limits_cm.d)),
  };
  const status = Object.values(overflow).some((value) => value > 0)
    ? 'exceeds'
    : 'complies';
  return {
    status,
    dimensionOnly: true,
    overflow_cm: overflow,
    limits_cm: policy.limits_cm,
  };
}

import type { FitResult, PolicyResult } from '../domain/fit';
import type { OperatorPolicy } from '../domain/spaces';

export type PoseMode = 'original' | 'best';

interface FitVerdictPanelProps {
  fit: FitResult;
  policy: PolicyResult;
  policyDefinition?: OperatorPolicy;
  poseMode: PoseMode;
  onPoseModeChange: (mode: PoseMode) => void;
}

const AXIS_LABELS = {
  width: 'wide',
  height: 'tall',
  depth: 'deep',
} as const;

function tone(fit: FitResult) {
  if (fit.kind === 'reference') return 'reference';
  if (fit.kind === 'fits') return 'pass';
  if (fit.kind === 'fails') return 'fail';
  return 'caution';
}

function physicalHeadline(fit: FitResult) {
  if (fit.kind === 'reference') return 'Reference only';
  if (fit.kind === 'varies') return 'May fit — depends on configuration';
  if (fit.kind === 'tight') {
    return fit.uncertain ? 'Uncertain — too close to the estimate' : 'Tight fit';
  }
  if (fit.kind === 'fails') {
    return fit.decisiveConfidence === 'published'
      ? 'Does not fit'
      : 'Likely does not fit';
  }

  const verb = fit.decisiveConfidence === 'published' ? 'Fits' : 'Likely fits';
  if (fit.kind === 'rotated') return `${verb} if rotated`;
  if (fit.range === 'all') return `${verb} across the modelled range`;
  return verb;
}

function physicalDetail(fit: FitResult) {
  if (fit.kind === 'reference') {
    return 'No boundary is selected; use the grid and human for scale.';
  }
  if (fit.kind === 'fails') {
    return Object.entries(fit.overflow_cm)
      .filter(([, value]) => value > 0)
      .map(([axis, value]) => `${value} cm too ${AXIS_LABELS[axis as keyof typeof AXIS_LABELS]}`)
      .join(' · ');
  }
  if (fit.kind === 'varies') {
    return `Best orientation ${fit.orientation.label}; it clears only the larger envelope.`;
  }
  if (fit.kind === 'tight') {
    return `${fit.orientation.label}; geometric fit, but below the 2 cm practical margin.`;
  }

  const tightest = Math.min(...Object.values(fit.clearance_cm));
  return `${fit.orientation.label} · tightest clearance ${tightest} cm.`;
}

function policyPresentation(policy: PolicyResult, definition?: OperatorPolicy) {
  if (policy.status === 'not-applicable') {
    return {
      headline: 'No operator policy',
      detail: 'Reference mode checks scale only.',
    };
  }

  if ('total_cm' in policy) {
    if (policy.status === 'complies') {
      return {
        headline: 'No oversized-space reservation required',
        detail: `${policy.total_cm} cm total · dimension policy only; weight not checked.`,
      };
    }
    if (policy.status === 'reservation-required') {
      return {
        headline: 'Reservation required',
        detail: `${policy.total_cm} cm total · dimension policy only; weight not checked.`,
      };
    }
    return {
      headline: 'Not permitted by dimensional rule',
      detail: `${policy.total_cm} cm total · dimension policy only; weight not checked.`,
    };
  }

  if (policy.status === 'complies') {
    return {
      headline: 'Within the example airline dimensions',
      detail: `${definition?.name ?? 'Allowance'} · dimension policy only; weight not checked.`,
    };
  }

  const overflow = Object.entries(policy.overflow_cm)
    .filter(([, value]) => value > 0)
    .map(([axis, value]) => `${axis.toUpperCase()} +${value} cm`)
    .join(' · ');
  return {
    headline: 'Exceeds the example airline dimensions',
    detail: `${overflow} · intrinsic dimensions; rotation does not change policy.`,
  };
}

export function FitVerdictPanel({
  fit,
  policy,
  policyDefinition,
  poseMode,
  onPoseModeChange,
}: FitVerdictPanelProps) {
  const policyText = policyPresentation(policy, policyDefinition);

  return (
    <aside className="verdict-panel" data-tone={tone(fit)} aria-label="Fit verdict">
      <div className="verdict-block physical-verdict">
        <span className="verdict-label">Physical fit</span>
        <strong>{physicalHeadline(fit)}</strong>
        <p>{physicalDetail(fit)}</p>
        {fit.kind !== 'reference' && (
          <span className="verdict-confidence">
            Decisive geometry: {fit.decisiveConfidence}
          </span>
        )}
      </div>

      <div className="verdict-block policy-verdict">
        <span className="verdict-label">Operator policy</span>
        <strong>{policyText.headline}</strong>
        <p>{policyText.detail}</p>
        {policyDefinition && (
          <a href={policyDefinition.source} target="_blank" rel="noreferrer">
            Policy source ↗
          </a>
        )}
      </div>

      {fit.kind !== 'reference' && (
        <div className="pose-toggle" aria-label="Object pose">
          <button
            type="button"
            aria-pressed={poseMode === 'original'}
            onClick={() => onPoseModeChange('original')}
          >
            Original
          </button>
          <button
            type="button"
            aria-pressed={poseMode === 'best'}
            onClick={() => onPoseModeChange('best')}
          >
            Best fit
          </button>
        </div>
      )}
    </aside>
  );
}

import type { AxisEvidence, SpaceDefinition } from '../domain/spaces';
import { confidencePrefix } from '../scene/confidenceStyle';

const AXES = [
  ['width', 'W'],
  ['height', 'H'],
  ['depth', 'D'],
] as const;

function valueLabel(axis: AxisEvidence) {
  const prefix = confidencePrefix(axis.confidence);
  if (axis.min_cm !== undefined || axis.max_cm !== undefined) {
    return `${prefix}${axis.min_cm ?? axis.value_cm}–${axis.max_cm ?? axis.value_cm} cm`;
  }
  return `${prefix}${axis.value_cm} cm`;
}

export function SpaceEvidencePanel({ space }: { space: SpaceDefinition }) {
  return (
    <details className="evidence-panel">
      <summary>Sources & assumptions</summary>
      <p className="space-description">{space.description}</p>
      {space.category !== 'Reference' && (
        <p className="environment-note">
          Cabin context is a representative cutaway. The highlighted volume carries the
          dimension evidence below.
        </p>
      )}

      {space.dimensions ? (
        <div className="evidence-list">
          {AXES.map(([key, label]) => {
            const axis = space.dimensions![key];
            return (
              <div className="evidence-row" data-confidence={axis.confidence} key={key}>
                <span className="evidence-axis">{label}</span>
                <span className="evidence-value">{valueLabel(axis)}</span>
                <span className="evidence-grade">{axis.confidence}</span>
                <p>{axis.note}</p>
                <a href={axis.source} target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="space-description">
          Reference mode has no boundary and therefore no fit evidence.
        </p>
      )}

      <div className="confidence-legend" aria-label="Dimension confidence legend">
        <span data-confidence="published">solid · published</span>
        <span data-confidence="estimated">dashed · estimated</span>
        <span data-confidence="inferred">dotted · inferred</span>
      </div>
    </details>
  );
}

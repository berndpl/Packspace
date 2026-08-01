import { SPACE_CATALOG, getSpace, type SpaceId } from '../domain/spaces';
import type {
  CameraProjection,
  CameraView,
} from '../scene/PackspaceScene';
import { SpaceGlyph } from './PreviewGlyphs';
import { SpaceEvidencePanel } from './SpaceEvidencePanel';

const CAMERA_VIEWS: ReadonlyArray<{
  id: Exclude<CameraView, 'free'>;
  label: string;
}> = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'top', label: 'Top' },
];

const SPACE_BUTTON_LABELS: Readonly<Record<SpaceId, string>> = {
  empty: 'No space',
  'shinkansen-overhead': 'Rack',
  'shinkansen-oversized': 'Oversize',
  'shinkansen-bulkhead': 'Front row',
  'plane-overhead': 'Bin',
  'plane-underseat': 'Under seat',
};

function glyphKind(category: (typeof SPACE_CATALOG)[number]['category']) {
  if (category === 'Shinkansen') return 'train';
  if (category === 'Plane') return 'plane';
  return 'none';
}

export function SpaceCameraPanel({
  activeView,
  projection,
  selectedSpaceId,
  onProjectionChange,
  onSpaceChange,
  onViewChange,
}: {
  activeView: CameraView;
  projection: CameraProjection;
  selectedSpaceId: SpaceId;
  onProjectionChange: (projection: CameraProjection) => void;
  onSpaceChange: (spaceId: SpaceId) => void;
  onViewChange: (view: CameraView) => void;
}) {
  const selectedSpace = getSpace(selectedSpaceId);

  return (
    <aside className="space-control-panel" aria-label="Space and camera controls">
      <header className="panel-heading">
        <span>Space / Camera</span>
        <strong>{selectedSpace.shortName}</strong>
      </header>

      <section className="control-section">
        <span className="control-label">Environment</span>
        <div className="space-option-grid">
          {SPACE_CATALOG.map((space) => (
            <button
              className="space-option"
              type="button"
              key={space.id}
              aria-label={`Show ${space.name}`}
              aria-pressed={selectedSpaceId === space.id}
              title={space.name}
              onClick={() => onSpaceChange(space.id)}
            >
              <SpaceGlyph kind={glyphKind(space.category)} />
              <span>
                <strong>{SPACE_BUTTON_LABELS[space.id]}</strong>
                <small>{space.category}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="camera-control-grid">
        <section className="control-section">
          <span className="control-label">Projection</span>
          <div className="segmented-control projection-buttons">
            <button
              type="button"
              aria-label="Perspective projection"
              aria-pressed={projection === 'perspective'}
              onClick={() => onProjectionChange('perspective')}
            >
              Persp
            </button>
            <button
              type="button"
              aria-label="Orthographic projection"
              aria-pressed={projection === 'orthographic'}
              onClick={() => onProjectionChange('orthographic')}
            >
              Ortho
            </button>
          </div>
        </section>

        <section className="control-section">
          <span className="control-label">Snap</span>
          <div className="segmented-control view-buttons">
            {CAMERA_VIEWS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activeView === id}
                onClick={() => onViewChange(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <SpaceEvidencePanel space={selectedSpace} />
    </aside>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CameraControls as CameraControlsRef } from '@react-three/drei';
import {
  parsePayloadFragment,
  parsePayloadJson,
  payloadToJson,
  payloadToUrl,
  type PackspacePayload,
  type PayloadError,
} from './domain/payload';
import { evaluatePolicy, fitObjectToSpace, type FitResult } from './domain/fit';
import {
  SPACE_CATALOG,
  getSpace,
  resolveSpaceId,
  type SpaceId,
} from './domain/spaces';
import { SpaceEvidencePanel } from './components/SpaceEvidencePanel';
import {
  FitVerdictPanel,
  type PoseMode,
} from './components/FitVerdictPanel';
import { SCENE_COLORS } from './design/tokens';
import {
  PackspaceScene,
  type CameraProjection,
  type CameraView,
} from './scene/PackspaceScene';
import {
  narrowViewportFraming,
  panelAwareFraming,
} from './scene/framing';

const DEFAULT_PAYLOAD: PackspacePayload = {
  schema: 'packspace.object/1',
  name: 'Brompton C Line Explore',
  dimensions_cm: { w: 58.5, h: 64.5, d: 27 },
  measured: 'folded',
  confidence: 'published',
  source: 'https://www.brompton.com/p/771/c-line-explore',
};

const VIEWS: ReadonlyArray<{ id: CameraView; label: string }> = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'top', label: 'Top' },
  { id: 'free', label: 'Free' },
];
const SPACE_CATEGORIES = ['Reference', 'Shinkansen', 'Plane'] as const;

interface PayloadState {
  payload: PackspacePayload | null;
  environment?: string;
  error: PayloadError | null;
  status: string;
}

function payloadStateFromHash(hash: string): PayloadState {
  const result = parsePayloadFragment(hash);
  if (result === null) {
    return {
      payload: DEFAULT_PAYLOAD,
      error: null,
      status: 'Showing an example payload.',
    };
  }
  if (!result.ok) {
    return {
      payload: null,
      error: result.error,
      status: 'The link payload was rejected.',
    };
  }
  return {
    payload: result.value.payload,
    environment: result.value.environment,
    error: null,
    status: 'Loaded from the link.',
  };
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export function App() {
  const controlsRef = useRef<CameraControlsRef>(null);
  const initial = payloadStateFromHash(window.location.hash);
  const [payloadState, setPayloadState] = useState(initial);
  const [jsonText, setJsonText] = useState(
    initial.payload ? payloadToJson(initial.payload) : '',
  );
  const [editorOpen, setEditorOpen] = useState(initial.payload === null);
  const [copyStatus, setCopyStatus] = useState('');
  const [activeView, setActiveView] = useState<CameraView>('free');
  const [projection, setProjection] =
    useState<CameraProjection>('perspective');
  const [poseMode, setPoseMode] = useState<PoseMode>('best');
  const [selectedSpaceId, setSelectedSpaceId] = useState<SpaceId>(
    resolveSpaceId(initial.environment),
  );
  const selectedSpace = getSpace(selectedSpaceId);
  const narrowViewport = useMediaQuery('(max-width: 680px)');
  const panelAwareViewport = useMediaQuery('(max-width: 1120px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const sceneFraming = useMemo(
    () => {
      if (narrowViewport) return narrowViewportFraming(selectedSpace.framing);
      if (panelAwareViewport) return panelAwareFraming(selectedSpace.framing);
      return selectedSpace.framing;
    },
    [narrowViewport, panelAwareViewport, selectedSpace],
  );
  const objectDimensions = payloadState.payload?.dimensions_cm;
  const fitResult = useMemo(
    () =>
      objectDimensions
        ? fitObjectToSpace(objectDimensions, selectedSpace)
        : null,
    [objectDimensions, selectedSpace],
  );
  const policyResult = useMemo(
    () =>
      objectDimensions
        ? evaluatePolicy(objectDimensions, selectedSpace.policy)
        : null,
    [objectDimensions, selectedSpace.policy],
  );

  useEffect(() => {
    setPoseMode('best');
  }, [payloadState.payload, selectedSpaceId]);

  useEffect(() => {
    const loadHash = () => {
      const next = payloadStateFromHash(window.location.hash);
      setPayloadState(next);
      setJsonText(next.payload ? payloadToJson(next.payload) : '');
      setEditorOpen(next.payload === null);
      setCopyStatus('');
      setSelectedSpaceId(resolveSpaceId(next.environment));
      setActiveView('free');
    };

    window.addEventListener('hashchange', loadHash);
    return () => window.removeEventListener('hashchange', loadHash);
  }, []);

  const changeView = (view: CameraView) => {
    setActiveView(view);
  };

  const changeSpace = (spaceId: SpaceId) => {
    setSelectedSpaceId(spaceId);
    setActiveView('free');
    setCopyStatus('');
    setPayloadState((current) => ({
      ...current,
      environment: spaceId,
      status: `Showing ${getSpace(spaceId).name}.`,
    }));

    if (payloadState.payload) {
      window.history.replaceState(
        null,
        '',
        payloadToUrl(payloadState.payload, spaceId, window.location.href),
      );
    }
  };

  const loadJson = () => {
    const result = parsePayloadJson(jsonText);
    if (!result.ok) {
      setPayloadState({
        payload: null,
        environment: selectedSpaceId,
        error: result.error,
        status: 'The pasted payload was rejected.',
      });
      setCopyStatus('');
      return;
    }

    const nextUrl = payloadToUrl(
      result.value,
      selectedSpaceId,
      window.location.href,
    );
    window.history.replaceState(null, '', nextUrl);
    setPayloadState({
      payload: result.value,
      environment: selectedSpaceId,
      error: null,
      status: 'Loaded from pasted JSON.',
    });
    setJsonText(payloadToJson(result.value));
    setEditorOpen(false);
    setCopyStatus('');
  };

  const shareUrl = payloadState.payload
    ? payloadToUrl(payloadState.payload, selectedSpaceId, window.location.href)
    : '';

  const copyLink = async () => {
    if (!shareUrl) return;

    try {
      if (!navigator.clipboard) throw new Error('Clipboard API is unavailable.');
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('Link copied.');
    } catch {
      setCopyStatus('Clipboard blocked — select the link below and copy it manually.');
    }
  };

  const sceneObject = payloadState.payload
    ? {
        name: payloadState.payload.name,
        dimensions: displayedDimensions(payloadState.payload, fitResult, poseMode),
        color: verdictColor(fitResult),
      }
    : null;

  return (
    <main className="app-shell">
      <PackspaceScene
        controlsRef={controlsRef}
        object={sceneObject}
        space={selectedSpace}
        framing={sceneFraming}
        projection={projection}
        reducedMotion={reducedMotion}
        view={activeView}
      />

      <section className="scene-info" aria-label="Payload and scene information">
        <p className="eyebrow">Packspace / {selectedSpace.category}</p>
        <label className="space-picker">
          <span>Space</span>
          <select
            aria-label="Space"
            value={selectedSpaceId}
            onChange={(event) => changeSpace(event.target.value as SpaceId)}
          >
            {SPACE_CATEGORIES.map((category) => (
              <optgroup label={category} key={category}>
                {SPACE_CATALOG.filter((space) => space.category === category).map((space) => (
                  <option value={space.id} key={space.id}>
                    {space.shortName}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <h1>{payloadState.payload?.name ?? 'Payload needs attention.'}</h1>

        {payloadState.payload ? (
          <>
            <p className="scene-description">
              {payloadState.payload.dimensions_cm.w} × {payloadState.payload.dimensions_cm.h} ×{' '}
              {payloadState.payload.dimensions_cm.d} cm ·{' '}
              {payloadState.payload.measured.replace('_', ' ')} ·{' '}
              {payloadState.payload.confidence}
            </p>
            <a
              className="source-link"
              href={payloadState.payload.source}
              target="_blank"
              rel="noreferrer"
            >
              View dimension source ↗
            </a>
          </>
        ) : (
          <p className="scene-description">
            Nothing is rendered until every required field is valid.
          </p>
        )}

        {payloadState.error && (
          <p className="payload-error" role="alert">
            <strong>{payloadState.error.field}</strong>: {payloadState.error.message}
          </p>
        )}

        <div className="payload-actions">
          <button
            className="secondary-action"
            type="button"
            aria-expanded={editorOpen}
            aria-controls="payload-editor"
            onClick={() => setEditorOpen((open) => !open)}
          >
            {editorOpen ? 'Close JSON' : 'Paste JSON'}
          </button>
          <button
            className="primary-action"
            type="button"
            onClick={copyLink}
            disabled={!payloadState.payload}
          >
            Copy link
          </button>
        </div>

        {shareUrl && (
          <details className="share-details">
            <summary>Manual link</summary>
            <label className="share-row">
              <span className="sr-only">Shareable link</span>
              <input
                aria-label="Shareable Packspace link"
                value={shareUrl}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          </details>
        )}

        <p className="payload-status" aria-live="polite">
          {copyStatus || payloadState.status}
        </p>

        <SpaceEvidencePanel space={selectedSpace} />

        {editorOpen && (
          <form
            id="payload-editor"
            className="payload-editor"
            onSubmit={(event) => {
              event.preventDefault();
              loadJson();
            }}
          >
            <label htmlFor="payload-json">Packspace JSON</label>
            <textarea
              id="payload-json"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              spellCheck={false}
              placeholder='{"schema":"packspace.object/1", ...}'
            />
            <button type="submit">Load object</button>
          </form>
        )}
      </section>

      <nav className="view-controls" aria-label="Camera views">
        <span className="projection-label">Projection</span>
        <div className="projection-buttons" aria-label="Camera projection">
          <button
            type="button"
            aria-label="Perspective projection"
            aria-pressed={projection === 'perspective'}
            onClick={() => setProjection('perspective')}
          >
            Persp
          </button>
          <button
            type="button"
            aria-label="Orthographic projection"
            aria-pressed={projection === 'orthographic'}
            onClick={() => setProjection('orthographic')}
          >
            Ortho
          </button>
        </div>
        <span className="view-label">View</span>
        <div className="view-buttons">
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={activeView === id}
              onClick={() => changeView(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {fitResult && policyResult && (
        <FitVerdictPanel
          fit={fitResult}
          policy={policyResult}
          policyDefinition={selectedSpace.policy}
          poseMode={poseMode}
          onPoseModeChange={setPoseMode}
        />
      )}
    </main>
  );
}

function displayedDimensions(
  payload: PackspacePayload,
  fit: FitResult | null,
  poseMode: PoseMode,
) {
  if (poseMode === 'best' && fit && fit.kind !== 'reference') {
    return fit.orientedDimensions;
  }
  return {
    width: payload.dimensions_cm.w,
    height: payload.dimensions_cm.h,
    depth: payload.dimensions_cm.d,
  };
}

function verdictColor(fit: FitResult | null) {
  if (!fit || fit.kind === 'reference') return SCENE_COLORS.accent;
  if (fit.kind === 'fits') return SCENE_COLORS.pass;
  if (fit.kind === 'fails') return SCENE_COLORS.fail;
  return SCENE_COLORS.caution;
}

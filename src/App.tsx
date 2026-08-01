import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
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
  getSpace,
  resolveSpaceId,
  type SpaceId,
} from './domain/spaces';
import {
  DEFAULT_OBJECT_PAYLOAD,
  findObjectPreset,
  type ObjectPreset,
} from './domain/objects';
import {
  FitVerdictPanel,
  type PoseMode,
} from './components/FitVerdictPanel';
import { ObjectPicker } from './components/ObjectPicker';
import { SpaceCameraPanel } from './components/SpaceCameraPanel';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import {
  getTheme,
  getTypography,
  resolveThemeId,
  resolveTypographyId,
  themeCssVariables,
  type ScenePalette,
  type ThemeId,
  type TypographyId,
} from './design/tokens';
import {
  PackspaceScene,
  type CameraProjection,
  type CameraView,
} from './scene/PackspaceScene';
import {
  narrowViewportFraming,
  panelAwareFraming,
} from './scene/framing';

const DEFAULT_PAYLOAD = DEFAULT_OBJECT_PAYLOAD;
const THEME_STORAGE_KEY = 'packspace.theme';
const TYPOGRAPHY_STORAGE_KEY = 'packspace.typography';

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

function readPreference(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Packspace could not read ${key}.`, error);
    return null;
  }
}

function storePreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Packspace could not store ${key}.`, error);
  }
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
  const [objectDetailsOpen, setObjectDetailsOpen] = useState(
    initial.payload === null,
  );
  const [editorOpen, setEditorOpen] = useState(initial.payload === null);
  const [copyStatus, setCopyStatus] = useState('');
  const [activeView, setActiveView] = useState<CameraView>('free');
  const [projection, setProjection] =
    useState<CameraProjection>('perspective');
  const [poseMode, setPoseMode] = useState<PoseMode>('best');
  const [themeId, setThemeId] = useState<ThemeId>(() =>
    resolveThemeId(readPreference(THEME_STORAGE_KEY)),
  );
  const [typographyId, setTypographyId] = useState<TypographyId>(() =>
    resolveTypographyId(readPreference(TYPOGRAPHY_STORAGE_KEY)),
  );
  const [selectedSpaceId, setSelectedSpaceId] = useState<SpaceId>(
    resolveSpaceId(initial.environment),
  );
  const selectedSpace = getSpace(selectedSpaceId);
  const selectedObjectPreset = useMemo(
    () => findObjectPreset(payloadState.payload),
    [payloadState.payload],
  );
  const activeTheme = useMemo(() => getTheme(themeId), [themeId]);
  const activeTypography = useMemo(
    () => getTypography(typographyId),
    [typographyId],
  );
  const cssVariables = useMemo(
    () => themeCssVariables(activeTheme, activeTypography),
    [activeTheme, activeTypography],
  );
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

  useLayoutEffect(() => {
    for (const [property, value] of Object.entries(cssVariables)) {
      document.documentElement.style.setProperty(property, value);
    }
    document.documentElement.style.setProperty(
      'color-scheme',
      activeTheme.appearance,
    );
    document.documentElement.dataset.packspaceTheme = themeId;
    document.documentElement.dataset.packspaceTypography = typographyId;
    storePreference(THEME_STORAGE_KEY, themeId);
    storePreference(TYPOGRAPHY_STORAGE_KEY, typographyId);
  }, [activeTheme.appearance, cssVariables, themeId, typographyId]);

  useEffect(() => {
    setPoseMode('best');
  }, [payloadState.payload, selectedSpaceId]);

  useEffect(() => {
    const loadHash = () => {
      const next = payloadStateFromHash(window.location.hash);
      setPayloadState(next);
      setJsonText(next.payload ? payloadToJson(next.payload) : '');
      setObjectDetailsOpen(next.payload === null);
      setEditorOpen(next.payload === null);
      setCopyStatus('');
      setSelectedSpaceId(resolveSpaceId(next.environment));
    };

    window.addEventListener('hashchange', loadHash);
    return () => window.removeEventListener('hashchange', loadHash);
  }, []);

  const changeView = (view: CameraView) => {
    setActiveView(view);
  };

  const changeProjection = (nextProjection: CameraProjection) => {
    setProjection(nextProjection);
    if (nextProjection === 'orthographic' && activeView === 'free') {
      setActiveView('front');
    }
  };

  const changeSpace = (spaceId: SpaceId) => {
    setSelectedSpaceId(spaceId);
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

  const applyPayload = (payload: PackspacePayload, status: string) => {
    const nextUrl = payloadToUrl(payload, selectedSpaceId, window.location.href);
    window.history.replaceState(null, '', nextUrl);
    setPayloadState({
      payload,
      environment: selectedSpaceId,
      error: null,
      status,
    });
    setJsonText(payloadToJson(payload));
    setEditorOpen(false);
    setCopyStatus('');
  };

  const selectObjectPreset = (preset: ObjectPreset) => {
    applyPayload(preset.payload, `Showing ${preset.payload.name}.`);
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
      setObjectDetailsOpen(true);
      setCopyStatus('');
      return;
    }

    applyPayload(result.value, 'Loaded from pasted JSON.');
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

  const sceneObject = useMemo(
    () =>
      payloadState.payload
        ? {
            name: payloadState.payload.name,
            dimensions: displayedDimensions(
              payloadState.payload,
              fitResult,
              poseMode,
            ),
            color: verdictColor(fitResult, activeTheme.scene),
          }
        : null,
    [activeTheme.scene, fitResult, payloadState.payload, poseMode],
  );

  return (
    <main
      className="app-shell"
      data-theme={themeId}
      data-typography={typographyId}
      style={cssVariables as CSSProperties}
    >
      <PackspaceScene
        controlsRef={controlsRef}
        object={sceneObject}
        palette={activeTheme.scene}
        space={selectedSpace}
        framing={sceneFraming}
        projection={projection}
        reducedMotion={reducedMotion}
        view={activeView}
        onFallbackView={setActiveView}
      />

      <section className="object-panel" aria-label="Object controls">
        <header className="panel-heading">
          <span>Packspace / Object</span>
          <strong>{selectedObjectPreset?.shortName ?? 'Custom payload'}</strong>
        </header>

        <ObjectPicker
          selectedId={selectedObjectPreset?.id}
          onSelect={selectObjectPreset}
        />

        <button
          className="object-details-toggle"
          type="button"
          aria-expanded={objectDetailsOpen}
          aria-controls="object-details"
          onClick={() => setObjectDetailsOpen((open) => !open)}
        >
          <span>Object details</span>
          <strong>{objectDetailsOpen ? 'Hide' : 'Show'}</strong>
        </button>

        {objectDetailsOpen && (
          <div className="object-details" id="object-details">
            <h1>{payloadState.payload?.name ?? 'Payload needs attention.'}</h1>

            {payloadState.payload ? (
              <>
                <p className="scene-description">
                  {payloadState.payload.dimensions_cm.w} ×{' '}
                  {payloadState.payload.dimensions_cm.h} ×{' '}
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
                <strong>{payloadState.error.field}</strong>:{' '}
                {payloadState.error.message}
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
          </div>
        )}
      </section>

      <SpaceCameraPanel
        activeView={activeView}
        projection={projection}
        selectedSpaceId={selectedSpaceId}
        onProjectionChange={changeProjection}
        onSpaceChange={changeSpace}
        onViewChange={changeView}
      />

      <ThemeSwitcher
        themeId={themeId}
        typographyId={typographyId}
        onThemeChange={setThemeId}
        onTypographyChange={setTypographyId}
      />

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

function verdictColor(fit: FitResult | null, palette: ScenePalette) {
  if (!fit || fit.kind === 'reference') return palette.accent;
  if (fit.kind === 'fits') return palette.pass;
  if (fit.kind === 'fails') return palette.fail;
  return palette.caution;
}

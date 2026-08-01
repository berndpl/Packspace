import { useRef, useState } from 'react';
import type { CameraControls as CameraControlsRef } from '@react-three/drei';
import { PackspaceScene, snapCamera, type CameraView } from './scene/PackspaceScene';
import type { DimensionsCm } from './scene/measurements';

const DEFAULT_OBJECT: DimensionsCm = {
  width: 40,
  height: 55,
  depth: 23,
};

const VIEWS: ReadonlyArray<{ id: CameraView; label: string }> = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'top', label: 'Top' },
  { id: 'free', label: 'Free' },
];

export function App() {
  const controlsRef = useRef<CameraControlsRef>(null);
  const [dimensions, setDimensions] = useState(DEFAULT_OBJECT);
  const [activeView, setActiveView] = useState<CameraView>('free');

  const updateDimension = (key: keyof DimensionsCm, rawValue: string) => {
    const value = Number(rawValue);
    if (!Number.isFinite(value)) return;

    setDimensions((current) => ({
      ...current,
      [key]: Math.min(300, Math.max(1, value)),
    }));
  };

  const changeView = (view: CameraView) => {
    setActiveView(view);
    void snapCamera(controlsRef.current, view);
  };

  return (
    <main className="app-shell">
      <PackspaceScene
        controlsRef={controlsRef}
        object={{
          name: 'Example object',
          dimensions,
        }}
      />

      <section className="scene-info" aria-label="Scene information">
        <p className="eyebrow">Packspace / empty space</p>
        <h1>Read the size from any angle.</h1>
        <p className="scene-description">
          The blueprint shell uses one world unit per metre. Every value you enter stays in
          centimetres and is converted at the scene boundary.
        </p>

        <fieldset className="dimension-controls">
          <legend>Object dimensions</legend>
          {(
            [
              ['width', 'W'],
              ['height', 'H'],
              ['depth', 'D'],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input
                aria-label={`${key} in centimetres`}
                type="number"
                min="1"
                max="300"
                step="1"
                value={dimensions[key]}
                onChange={(event) => updateDimension(key, event.target.value)}
              />
              <span className="unit">cm</span>
            </label>
          ))}
        </fieldset>
      </section>

      <nav className="view-controls" aria-label="Camera views">
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
      </nav>

      <p className="orbit-hint">Drag to orbit · Shift-drag to pan · Scroll to zoom</p>
    </main>
  );
}

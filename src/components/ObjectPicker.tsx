import { OBJECT_PRESETS, type ObjectPreset } from '../domain/objects';
import { ObjectGlyph } from './PreviewGlyphs';

export function ObjectPicker({
  selectedId,
  onSelect,
}: {
  selectedId?: ObjectPreset['id'];
  onSelect: (preset: ObjectPreset) => void;
}) {
  return (
    <div className="object-picker" aria-label="Object presets">
      {OBJECT_PRESETS.map((preset) => (
        <button
          className="object-option"
          type="button"
          key={preset.id}
          aria-label={`Check ${preset.payload.name}`}
          aria-pressed={selectedId === preset.id}
          title={preset.payload.name}
          onClick={() => onSelect(preset)}
        >
          <span className="object-preview">
            <ObjectGlyph kind={preset.glyph} />
          </span>
          <strong>{preset.shortName}</strong>
        </button>
      ))}
    </div>
  );
}

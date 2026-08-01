import { describe, expect, it } from 'vitest';
import { validatePayload } from './payload';
import {
  DEFAULT_OBJECT_PAYLOAD,
  OBJECT_PRESETS,
  findObjectPreset,
} from './objects';

describe('object presets', () => {
  it('contains the expected selectable objects with unique IDs', () => {
    expect(OBJECT_PRESETS.map((preset) => preset.id)).toEqual([
      'brompton-c-line',
      'macbook-air-13',
      'iphone-16-pro',
      'bike-rider',
      'alpaca',
    ]);
    expect(new Set(OBJECT_PRESETS.map((preset) => preset.id)).size).toBe(
      OBJECT_PRESETS.length,
    );
  });

  it('keeps every preset inside the public payload contract', () => {
    for (const preset of OBJECT_PRESETS) {
      expect(validatePayload(preset.payload)).toEqual({
        ok: true,
        value: preset.payload,
      });
    }
  });

  it('recognizes presets loaded from an equivalent URL payload', () => {
    expect(
      findObjectPreset({
        ...DEFAULT_OBJECT_PAYLOAD,
        dimensions_cm: { ...DEFAULT_OBJECT_PAYLOAD.dimensions_cm },
      })?.id,
    ).toBe('brompton-c-line');
  });
});

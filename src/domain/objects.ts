import {
  PACKSPACE_SCHEMA,
  type PackspacePayload,
} from './payload';

export type ObjectGlyphKind =
  | 'bike'
  | 'laptop'
  | 'phone'
  | 'rider'
  | 'alpaca';

export interface ObjectPreset {
  id:
    | 'brompton-c-line'
    | 'macbook-air-13'
    | 'iphone-16-pro'
    | 'bike-rider'
    | 'alpaca';
  shortName: string;
  glyph: ObjectGlyphKind;
  payload: PackspacePayload;
}

export const OBJECT_PRESETS: readonly ObjectPreset[] = [
  {
    id: 'brompton-c-line',
    shortName: 'Brompton',
    glyph: 'bike',
    payload: {
      schema: PACKSPACE_SCHEMA,
      name: 'Brompton C Line',
      dimensions_cm: { w: 58.5, h: 64.5, d: 27 },
      measured: 'folded',
      confidence: 'published',
      source: 'https://www.brompton.com/c-line',
    },
  },
  {
    id: 'macbook-air-13',
    shortName: 'MacBook Air',
    glyph: 'laptop',
    payload: {
      schema: PACKSPACE_SCHEMA,
      name: 'MacBook Air 13-inch (M4)',
      dimensions_cm: { w: 30.41, h: 1.13, d: 21.5 },
      measured: 'product',
      confidence: 'published',
      source: 'https://support.apple.com/en-us/122209',
    },
  },
  {
    id: 'iphone-16-pro',
    shortName: 'iPhone',
    glyph: 'phone',
    payload: {
      schema: PACKSPACE_SCHEMA,
      name: 'iPhone 16 Pro',
      dimensions_cm: { w: 7.15, h: 14.96, d: 0.825 },
      measured: 'product',
      confidence: 'published',
      source: 'https://support.apple.com/en-us/121031',
    },
  },
  {
    id: 'bike-rider',
    shortName: 'Bike rider',
    glyph: 'rider',
    payload: {
      schema: PACKSPACE_SCHEMA,
      name: 'Bike with rider reference',
      dimensions_cm: { w: 180, h: 175, d: 65 },
      measured: 'product',
      confidence: 'inferred',
      source: 'https://en.wikipedia.org/wiki/Bicycle',
    },
  },
  {
    id: 'alpaca',
    shortName: 'Alpaca',
    glyph: 'alpaca',
    payload: {
      schema: PACKSPACE_SCHEMA,
      name: 'Adult alpaca reference',
      dimensions_cm: { w: 150, h: 150, d: 50 },
      measured: 'product',
      confidence: 'estimated',
      source: 'https://animaldiversity.org/accounts/Vicugna_pacos/',
    },
  },
] as const;

export const DEFAULT_OBJECT_PAYLOAD = OBJECT_PRESETS[0].payload;

export function findObjectPreset(
  payload: PackspacePayload | null,
): ObjectPreset | undefined {
  if (!payload) return undefined;

  return OBJECT_PRESETS.find((preset) => {
    const candidate = preset.payload;
    return (
      candidate.name === payload.name &&
      candidate.measured === payload.measured &&
      candidate.dimensions_cm.w === payload.dimensions_cm.w &&
      candidate.dimensions_cm.h === payload.dimensions_cm.h &&
      candidate.dimensions_cm.d === payload.dimensions_cm.d
    );
  });
}

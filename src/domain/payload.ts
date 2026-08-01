export const PACKSPACE_SCHEMA = 'packspace.object/1' as const;

export type MeasuredState = 'product' | 'folded' | 'shipping_box';
export type Confidence = 'published' | 'estimated' | 'inferred';

export interface PackspacePayload {
  schema: typeof PACKSPACE_SCHEMA;
  name: string;
  dimensions_cm: {
    w: number;
    h: number;
    d: number;
  };
  measured: MeasuredState;
  confidence: Confidence;
  source: string;
}

export interface ParsedPayloadFragment {
  payload: PackspacePayload;
  environment?: string;
}

export interface PayloadError {
  field: string;
  message: string;
}

export type PayloadResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: PayloadError };

const MEASURED_STATES: readonly MeasuredState[] = ['product', 'folded', 'shipping_box'];
const CONFIDENCE_VALUES: readonly Confidence[] = ['published', 'estimated', 'inferred'];

function failure<T>(field: string, message: string): PayloadResult<T> {
  return { ok: false, error: { field, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string): PayloadResult<string> {
  if (typeof value !== 'string' || !value.trim()) {
    return failure(field, `${field} is required.`);
  }
  return { ok: true, value: value.trim() };
}

function positiveNumber(value: unknown, field: string): PayloadResult<number> {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return failure(field, `${field} must be a positive number.`);
  }
  return { ok: true, value: number };
}

function enumValue<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): PayloadResult<T> {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    return failure(field, `${field} must be one of: ${allowed.join(', ')}.`);
  }
  return { ok: true, value: value as T };
}

function sourceUrl(value: unknown): PayloadResult<string> {
  const text = requiredText(value, 'source');
  if (!text.ok) return text;

  let url: URL;
  try {
    url = new URL(text.value);
  } catch {
    return failure('source', 'source must be an absolute URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return failure('source', 'source must use http or https.');
  }

  return { ok: true, value: url.toString() };
}

export function validatePayload(value: unknown): PayloadResult<PackspacePayload> {
  if (!isRecord(value)) {
    return failure('payload', 'payload must be a JSON object.');
  }

  if (value.schema !== PACKSPACE_SCHEMA) {
    return failure(
      'schema',
      `Unsupported schema "${String(value.schema ?? '')}"; expected ${PACKSPACE_SCHEMA}.`,
    );
  }

  const name = requiredText(value.name, 'name');
  if (!name.ok) return name;

  if (!isRecord(value.dimensions_cm)) {
    return failure('dimensions_cm', 'dimensions_cm must be an object with w, h, and d.');
  }

  const width = positiveNumber(value.dimensions_cm.w, 'dimensions_cm.w');
  if (!width.ok) return width;
  const height = positiveNumber(value.dimensions_cm.h, 'dimensions_cm.h');
  if (!height.ok) return height;
  const depth = positiveNumber(value.dimensions_cm.d, 'dimensions_cm.d');
  if (!depth.ok) return depth;

  const measured = enumValue(value.measured, 'measured', MEASURED_STATES);
  if (!measured.ok) return measured;
  const confidence = enumValue(value.confidence, 'confidence', CONFIDENCE_VALUES);
  if (!confidence.ok) return confidence;
  const source = sourceUrl(value.source);
  if (!source.ok) return source;

  return {
    ok: true,
    value: {
      schema: PACKSPACE_SCHEMA,
      name: name.value,
      dimensions_cm: {
        w: width.value,
        h: height.value,
        d: depth.value,
      },
      measured: measured.value,
      confidence: confidence.value,
      source: source.value,
    },
  };
}

export function parsePayloadJson(json: string): PayloadResult<PackspacePayload> {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return failure('json', 'JSON is not valid.');
  }
  return validatePayload(value);
}

export function parsePayloadFragment(
  hash: string,
): PayloadResult<ParsedPayloadFragment> | null {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!fragment.trim()) return null;

  const params = new URLSearchParams(fragment);
  const version = params.get('v');
  if (version !== '1') {
    return failure('v', `Unsupported payload version "${version ?? ''}"; expected 1.`);
  }

  const payload = validatePayload({
    schema: PACKSPACE_SCHEMA,
    name: params.get('name'),
    dimensions_cm: {
      w: params.get('w'),
      h: params.get('h'),
      d: params.get('d'),
    },
    measured: params.get('measured'),
    confidence: params.get('confidence'),
    source: params.get('source'),
  });
  if (!payload.ok) return payload;

  const environment = params.get('env')?.trim() || undefined;
  return {
    ok: true,
    value: {
      payload: payload.value,
      ...(environment ? { environment } : {}),
    },
  };
}

export function payloadToFragment(payload: PackspacePayload, environment?: string): string {
  const params = new URLSearchParams([
    ['v', '1'],
    ['name', payload.name],
    ['w', String(payload.dimensions_cm.w)],
    ['h', String(payload.dimensions_cm.h)],
    ['d', String(payload.dimensions_cm.d)],
    ['measured', payload.measured],
    ['confidence', payload.confidence],
    ['source', payload.source],
  ]);
  if (environment) params.set('env', environment);
  return params.toString();
}

export function payloadToUrl(
  payload: PackspacePayload,
  environment: string | undefined,
  currentUrl: string,
): string {
  const url = new URL(currentUrl);
  url.search = '';
  url.hash = payloadToFragment(payload, environment);
  return url.toString();
}

export function payloadToJson(payload: PackspacePayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

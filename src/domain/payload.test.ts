import { describe, expect, it } from 'vitest';
import {
  parsePayloadFragment,
  parsePayloadJson,
  payloadToFragment,
  payloadToJson,
  payloadToUrl,
  type PackspacePayload,
} from './payload';

const PAYLOAD: PackspacePayload = {
  schema: 'packspace.object/1',
  name: 'Brompton C Line Explore',
  dimensions_cm: { w: 58.5, h: 64.5, d: 27 },
  measured: 'folded',
  confidence: 'published',
  source: 'https://www.brompton.com/p/771/c-line-explore',
};

describe('JSON payloads', () => {
  it('parses the locked v1 shape', () => {
    expect(parsePayloadJson(JSON.stringify(PAYLOAD))).toEqual({
      ok: true,
      value: PAYLOAD,
    });
  });

  it.each([
    [{ ...PAYLOAD, schema: 'packspace.object/2' }, 'schema', 'Unsupported schema'],
    [{ ...PAYLOAD, name: '  ' }, 'name', 'name is required'],
    [
      { ...PAYLOAD, dimensions_cm: { ...PAYLOAD.dimensions_cm, w: 0 } },
      'dimensions_cm.w',
      'must be a positive number',
    ],
    [{ ...PAYLOAD, measured: 'box' }, 'measured', 'must be one of'],
    [{ ...PAYLOAD, confidence: 'certain' }, 'confidence', 'must be one of'],
    [{ ...PAYLOAD, source: 'file:///tmp/spec' }, 'source', 'must use http or https'],
  ])('rejects invalid field %# with a specific error', (input, field, message) => {
    const result = parsePayloadJson(JSON.stringify(input));
    expect(result).toMatchObject({
      ok: false,
      error: { field },
    });
    if (!result.ok) expect(result.error.message).toContain(message);
  });

  it('rejects malformed JSON before field validation', () => {
    expect(parsePayloadJson('{ nope')).toMatchObject({
      ok: false,
      error: { field: 'json', message: 'JSON is not valid.' },
    });
  });

  it('formats a stable JSON fallback', () => {
    expect(payloadToJson(PAYLOAD)).toBe(`${JSON.stringify(PAYLOAD, null, 2)}\n`);
  });
});

describe('URL fragments', () => {
  it('returns null when there is no payload fragment', () => {
    expect(parsePayloadFragment('')).toBeNull();
    expect(parsePayloadFragment('#')).toBeNull();
  });

  it('parses the readable fragment and optional environment', () => {
    const result = parsePayloadFragment(
      '#v=1&name=Brompton+C+Line+Explore&w=58.5&h=64.5&d=27&measured=folded&confidence=published&source=https%3A%2F%2Fwww.brompton.com%2Fp%2F771%2Fc-line-explore&env=shinkansen-overhead',
    );

    expect(result).toEqual({
      ok: true,
      value: {
        payload: PAYLOAD,
        environment: 'shinkansen-overhead',
      },
    });
  });

  it('rejects an unsupported URL version', () => {
    expect(parsePayloadFragment('#v=2')).toMatchObject({
      ok: false,
      error: { field: 'v', message: 'Unsupported payload version "2"; expected 1.' },
    });
  });

  it('serializes in canonical readable order', () => {
    expect(payloadToFragment(PAYLOAD, 'plane-overhead')).toBe(
      'v=1&name=Brompton+C+Line+Explore&w=58.5&h=64.5&d=27&measured=folded&confidence=published&source=https%3A%2F%2Fwww.brompton.com%2Fp%2F771%2Fc-line-explore&env=plane-overhead',
    );
  });

  it('preserves the current origin and project path while removing query noise', () => {
    expect(
      payloadToUrl(
        PAYLOAD,
        'shinkansen-overhead',
        'https://plontsch.de/Packspace/?debug=1#old',
      ),
    ).toBe(
      'https://plontsch.de/Packspace/#v=1&name=Brompton+C+Line+Explore&w=58.5&h=64.5&d=27&measured=folded&confidence=published&source=https%3A%2F%2Fwww.brompton.com%2Fp%2F771%2Fc-line-explore&env=shinkansen-overhead',
    );
  });
});

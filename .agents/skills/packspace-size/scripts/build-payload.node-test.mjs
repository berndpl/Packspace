import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPackspaceUrl,
  buildPayload,
  renderPayload,
} from './build-payload.mjs';

const input = {
  name: 'Rimowa Essential Cabin S',
  width: 40,
  height: 55,
  depth: 23,
  measured: 'product',
  confidence: 'published',
  source: 'https://example.com/product?id=42',
};

test('builds the locked v1 payload shape', () => {
  assert.deepEqual(buildPayload(input), {
    schema: 'packspace.object/1',
    name: 'Rimowa Essential Cabin S',
    dimensions_cm: { w: 40, h: 55, d: 23 },
    measured: 'product',
    confidence: 'published',
    source: 'https://example.com/product?id=42',
  });
});

test('builds an encoded, readable fragment in canonical field order', () => {
  const url = new URL(buildPackspaceUrl(buildPayload(input)));
  assert.equal(url.origin + url.pathname, 'https://berndpl.github.io/Packspace/');
  assert.equal(
    url.hash,
    '#v=1&name=Rimowa+Essential+Cabin+S&w=40&h=55&d=23&measured=product&confidence=published&source=https%3A%2F%2Fexample.com%2Fproduct%3Fid%3D42',
  );
});

test('prints both the link and JSON fallback', () => {
  const output = renderPayload(input);
  assert.match(output, /^## Open in Packspace/m);
  assert.match(output, /^## JSON fallback/m);
  assert.match(output, /"schema": "packspace\.object\/1"/);
});

test('rejects missing, invalid, and unsafe values', () => {
  assert.throws(() => buildPayload({ ...input, width: 0 }), /width must be a positive/);
  assert.throws(() => buildPayload({ ...input, measured: 'box' }), /measured must be one of/);
  assert.throws(() => buildPayload({ ...input, confidence: 'certain' }), /confidence must be one of/);
  assert.throws(() => buildPayload({ ...input, source: 'file:///tmp/spec' }), /http or https/);
});

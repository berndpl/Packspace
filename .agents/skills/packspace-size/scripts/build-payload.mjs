#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

const SCHEMA = 'packspace.object/1';
const DEFAULT_ORIGIN = 'https://berndpl.github.io/Packspace/';
const MEASURED_VALUES = new Set(['product', 'folded', 'shipping_box']);
const CONFIDENCE_VALUES = new Set(['published', 'estimated', 'inferred']);

function requiredText(value, field) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${field} is required`);
  return text;
}

function positiveNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${field} must be a positive number`);
  }
  return number;
}

function enumValue(value, field, allowed) {
  const text = requiredText(value, field);
  if (!allowed.has(text)) {
    throw new Error(`${field} must be one of: ${[...allowed].join(', ')}`);
  }
  return text;
}

function sourceUrl(value) {
  const source = requiredText(value, 'source');
  let parsed;
  try {
    parsed = new URL(source);
  } catch {
    throw new Error('source must be an absolute URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('source must use http or https');
  }
  return parsed.toString();
}

export function buildPayload(input) {
  return {
    schema: SCHEMA,
    name: requiredText(input.name, 'name'),
    dimensions_cm: {
      w: positiveNumber(input.width, 'width'),
      h: positiveNumber(input.height, 'height'),
      d: positiveNumber(input.depth, 'depth'),
    },
    measured: enumValue(input.measured, 'measured', MEASURED_VALUES),
    confidence: enumValue(input.confidence, 'confidence', CONFIDENCE_VALUES),
    source: sourceUrl(input.source),
  };
}

export function buildPackspaceUrl(payload, origin = DEFAULT_ORIGIN) {
  const url = new URL(origin);
  const fragment = new URLSearchParams([
    ['v', '1'],
    ['name', payload.name],
    ['w', String(payload.dimensions_cm.w)],
    ['h', String(payload.dimensions_cm.h)],
    ['d', String(payload.dimensions_cm.d)],
    ['measured', payload.measured],
    ['confidence', payload.confidence],
    ['source', payload.source],
  ]);
  url.hash = fragment.toString();
  return url.toString();
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`expected --field value, received: ${key ?? '(end)'}`);
    }
    values[key.slice(2)] = value;
  }

  return {
    name: values.name,
    width: values.width,
    height: values.height,
    depth: values.depth,
    measured: values.measured,
    confidence: values.confidence,
    source: values.source,
    origin: values.origin,
  };
}

export function renderPayload(input) {
  const payload = buildPayload(input);
  const url = buildPackspaceUrl(payload, input.origin || DEFAULT_ORIGIN);
  return `## Open in Packspace\n\n${url}\n\n## JSON fallback\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  try {
    console.log(renderPayload(parseArguments(process.argv.slice(2))));
  } catch (error) {
    console.error(`Packspace payload error: ${error.message}`);
    process.exitCode = 1;
  }
}

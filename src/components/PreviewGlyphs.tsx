import type { ObjectGlyphKind } from '../domain/objects';

interface GlyphProps {
  className?: string;
}

export function ObjectGlyph({
  kind,
  className,
}: GlyphProps & { kind: ObjectGlyphKind }) {
  if (kind === 'rider') {
    return (
      <svg
        className={className}
        viewBox="0 0 64 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="14" cy="30" r="7" />
        <circle cx="49" cy="30" r="7" />
        <path d="m14 30 12-13 10 13H14Zm12-13 14 2 9 11M24 22h17" />
        <circle cx="32" cy="7" r="3" />
        <path d="m31 10-5 9 10 5m-5-14 9 7m-14 2-6 8" />
      </svg>
    );
  }

  if (kind === 'alpaca') {
    return (
      <svg
        className={className}
        viewBox="0 0 64 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 17c4-4 18-5 27 0v11H15c-3-3-3-8-1-11Z" />
        <path d="M39 19V8l5-5 6 2 2 5-5 4v14M19 27v9m7-9v9m10-9v9m10-9v9" />
        <path d="m45 4-1-3m5 4 3-3" />
      </svg>
    );
  }

  if (kind === 'laptop') {
    return (
      <svg
        className={className}
        viewBox="0 0 64 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="14" y="6" width="36" height="24" rx="2" />
        <path d="M9 33h46l-4 3H13l-4-3Z" />
      </svg>
    );
  }

  if (kind === 'phone') {
    return (
      <svg
        className={className}
        viewBox="0 0 64 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="24" y="3" width="16" height="34" rx="4" />
        <path d="M29 7h6M30 33h4" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="15" cy="29" r="8" />
      <circle cx="49" cy="29" r="8" />
      <path d="m15 29 12-15 10 15H15Zm12-15 13 2 9 13M25 19h18M24 12h8" />
    </svg>
  );
}

export function SpaceGlyph({
  kind,
  className,
}: GlyphProps & { kind: 'none' | 'train' | 'plane' }) {
  if (kind === 'plane') {
    return (
      <svg
        className={className}
        viewBox="0 0 48 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 18 21 14 28 4l4 1-4 10 13 3v3l-13 1 4 7-4 1-7-8-17-1Z" />
      </svg>
    );
  }

  if (kind === 'train') {
    return (
      <svg
        className={className}
        viewBox="0 0 48 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 25V9c0-4 4-6 13-6s13 2 13 6v16" />
        <path d="M14 11h20M16 16h16M9 25h30M15 29l3-4m15 4-3-4" />
        <circle cx="17" cy="21" r="1.5" />
        <circle cx="31" cy="21" r="1.5" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m24 3 15 8v12l-15 7-15-7V11l15-8Z" />
      <path d="m9 11 15 8 15-8M24 19v11" />
    </svg>
  );
}

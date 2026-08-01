import type { LineProps } from '@react-three/drei';
import type { Confidence } from '../domain/payload';

type ConfidenceLineProps = Pick<LineProps, 'dashed' | 'dashSize' | 'gapSize'>;

export function confidenceLineProps(confidence: Confidence): ConfidenceLineProps {
  switch (confidence) {
    case 'published':
      return { dashed: false };
    case 'estimated':
      return { dashed: true, dashSize: 0.045, gapSize: 0.026 };
    case 'inferred':
      return { dashed: true, dashSize: 0.008, gapSize: 0.024 };
  }
}

export function confidencePrefix(confidence: Confidence): string {
  switch (confidence) {
    case 'published':
      return '';
    case 'estimated':
      return '≈';
    case 'inferred':
      return '~';
  }
}

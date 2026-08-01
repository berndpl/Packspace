import { Billboard, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SCENE_COLORS } from '../design/tokens';
import type { Confidence } from '../domain/payload';
import { confidenceLineProps } from './confidenceStyle';

type Point3 = readonly [number, number, number];

interface DimensionGuideProps {
  start: Point3;
  end: Point3;
  label: string;
  color?: string;
  labelOffset?: Point3;
  tickLength?: number;
  confidence?: Confidence;
}

const UP = new THREE.Vector3(0, 1, 0);

function vector(point: Point3) {
  return new THREE.Vector3(...point);
}

export function DimensionGuide({
  start,
  end,
  label,
  color = SCENE_COLORS.accent,
  labelOffset = [0, 0, 0],
  tickLength = 0.025,
  confidence = 'published',
}: DimensionGuideProps) {
  const startVector = vector(start);
  const endVector = vector(end);
  const direction = endVector.clone().sub(startVector).normalize();
  const tick = new THREE.Vector3().crossVectors(direction, UP);

  if (tick.lengthSq() < 0.001) {
    tick.set(1, 0, 0);
  }

  tick.normalize().multiplyScalar(tickLength);
  const midpoint = startVector
    .clone()
    .add(endVector)
    .multiplyScalar(0.5)
    .add(vector(labelOffset));
  const linePattern = confidenceLineProps(confidence);

  return (
    <group>
      <Line
        points={[startVector, endVector]}
        color={color}
        lineWidth={1}
        {...linePattern}
      />
      {[startVector, endVector].map((point, index) => (
        <Line
          key={index}
          points={[point.clone().sub(tick), point.clone().add(tick)]}
          color={color}
          lineWidth={1}
          {...linePattern}
        />
      ))}
      <Billboard position={midpoint} follow>
        <Text
          color={color}
          fontSize={0.055}
          anchorX="center"
          anchorY="middle"
          renderOrder={20}
          material-depthTest={false}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

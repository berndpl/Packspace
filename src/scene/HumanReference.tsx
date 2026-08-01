import { DimensionGuide } from './DimensionGuide';
import { CM_TO_WORLD } from './measurements';

const HUMAN_HEIGHT_CM = 168;

export function HumanReference({
  color,
  positionX = -1.05,
  positionZ = 0,
}: {
  color: string;
  positionX?: number;
  positionZ?: number;
}) {
  return (
    <group position={[positionX, 0, positionZ]}>
      <mesh position-y={0.4}>
        <capsuleGeometry args={[0.09, 0.62, 4, 10]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <mesh position-y={1.08}>
        <capsuleGeometry args={[0.13, 0.44, 4, 12]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <mesh position-y={1.555}>
        <sphereGeometry args={[0.105, 18, 14]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <DimensionGuide
        start={[-0.28, 0, 0]}
        end={[-0.28, HUMAN_HEIGHT_CM * CM_TO_WORLD, 0]}
        label={`${HUMAN_HEIGHT_CM} cm`}
        color={color}
        labelOffset={[-0.08, 0, 0]}
      />
    </group>
  );
}

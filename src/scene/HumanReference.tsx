import { DimensionGuide } from './DimensionGuide';
import { CM_TO_WORLD } from './measurements';

const HUMAN_HEIGHT_CM = 168;
const HUMAN_COLOR = '#2a4a63';

export function HumanReference({ positionX = -1.05 }: { positionX?: number }) {
  return (
    <group position-x={positionX}>
      <mesh position-y={0.4}>
        <capsuleGeometry args={[0.09, 0.62, 4, 10]} />
        <meshBasicMaterial color={HUMAN_COLOR} wireframe />
      </mesh>
      <mesh position-y={1.08}>
        <capsuleGeometry args={[0.13, 0.44, 4, 12]} />
        <meshBasicMaterial color={HUMAN_COLOR} wireframe />
      </mesh>
      <mesh position-y={1.555}>
        <sphereGeometry args={[0.105, 18, 14]} />
        <meshBasicMaterial color={HUMAN_COLOR} wireframe />
      </mesh>
      <DimensionGuide
        start={[-0.28, 0, 0]}
        end={[-0.28, HUMAN_HEIGHT_CM * CM_TO_WORLD, 0]}
        label={`${HUMAN_HEIGHT_CM} cm`}
        color={HUMAN_COLOR}
        labelOffset={[-0.08, 0, 0]}
      />
    </group>
  );
}

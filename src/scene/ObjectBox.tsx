import { Billboard, Text } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { DimensionGuide } from './DimensionGuide';
import { dimensionsToWorld, type DimensionsCm } from './measurements';

export interface SceneObject {
  name: string;
  dimensions: DimensionsCm;
}

export function ObjectBox({ object }: { object: SceneObject }) {
  const { dimensions } = object;
  const world = dimensionsToWorld(dimensions);
  const geometry = useMemo(
    () => new THREE.BoxGeometry(world.width, world.height, world.depth),
    [world.width, world.height, world.depth],
  );
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useEffect(
    () => () => {
      geometry.dispose();
      edges.dispose();
    },
    [edges, geometry],
  );

  const halfWidth = world.width / 2;
  const halfDepth = world.depth / 2;
  const guideGap = 0.08;

  return (
    <group>
      <mesh position-y={world.height / 2} geometry={geometry}>
        <meshStandardMaterial color="#5ad2ff" transparent opacity={0.15} roughness={0.75} />
      </mesh>
      <lineSegments position-y={world.height / 2} geometry={edges}>
        <lineBasicMaterial color="#5ad2ff" />
      </lineSegments>

      <Billboard position={[0, world.height + 0.13, 0]} follow>
        <Text
          color="#9fd9f2"
          fontSize={0.06}
          anchorX="center"
          anchorY="middle"
          renderOrder={20}
          material-depthTest={false}
        >
          {object.name}
        </Text>
      </Billboard>

      <DimensionGuide
        start={[-halfWidth, 0, halfDepth + guideGap]}
        end={[halfWidth, 0, halfDepth + guideGap]}
        label={`${dimensions.width} cm`}
        labelOffset={[0, -0.055, 0]}
      />
      <DimensionGuide
        start={[halfWidth + guideGap, 0, halfDepth]}
        end={[halfWidth + guideGap, world.height, halfDepth]}
        label={`${dimensions.height} cm`}
        labelOffset={[0.07, 0, 0]}
      />
      <DimensionGuide
        start={[-halfWidth - guideGap, 0, -halfDepth]}
        end={[-halfWidth - guideGap, 0, halfDepth]}
        label={`${dimensions.depth} cm`}
        labelOffset={[-0.07, 0, 0]}
      />
    </group>
  );
}

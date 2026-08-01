import { Canvas } from '@react-three/fiber';
import { CameraControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

const PLACEHOLDER_BOX = new THREE.BoxGeometry(0.4, 0.32, 0.23);

/**
 * Scaffold placeholder. It exists to prove the deploy pipeline and the three
 * drei pieces the visual language depends on — CameraControls (orbit/pan plus
 * snap-to-view) and Grid. The real scene is built in issue #10.
 */
export function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas camera={{ position: [2, 1.5, 2.4], fov: 38 }}>
        <color attach="background" args={['#0a1622']} />
        <Grid
          args={[4, 4]}
          cellSize={0.1}
          cellColor="#2a4a63"
          sectionSize={0.5}
          sectionColor="#5ad2ff"
          fadeDistance={9}
          infiniteGrid
        />
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.4, 0.32, 0.23]} />
          <meshBasicMaterial color="#5ad2ff" transparent opacity={0.16} />
        </mesh>
        <lineSegments position={[0, 0.16, 0]}>
          <edgesGeometry args={[PLACEHOLDER_BOX]} />
          <lineBasicMaterial color="#5ad2ff" />
        </lineSegments>
        <CameraControls makeDefault />
      </Canvas>

      <div style={{ position: 'fixed', left: 20, top: 18, maxWidth: 340, lineHeight: 1.5 }}>
        <div style={{ fontSize: 11, letterSpacing: '.14em', opacity: 0.55 }}>PACKSPACE</div>
        <div style={{ fontSize: 15, margin: '2px 0 10px' }}>Scaffold is live.</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          React + Vite + react-three-fiber + drei, deployed to GitHub Pages. Drag to orbit. The real
          scene lands in <em>Build the 3D scene shell</em>.
        </div>
      </div>
    </div>
  );
}

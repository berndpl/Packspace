/**
 * Packspace's public contract is centimetres. Three.js scenes stay numerically
 * stable and camera-friendly when one world unit represents one metre, so all
 * conversion happens at this boundary.
 */
export const CM_TO_WORLD = 0.01;

export interface DimensionsCm {
  width: number;
  height: number;
  depth: number;
}

export interface DimensionsWorld {
  width: number;
  height: number;
  depth: number;
}

export function dimensionsToWorld(dimensions: DimensionsCm): DimensionsWorld {
  return {
    width: dimensions.width * CM_TO_WORLD,
    height: dimensions.height * CM_TO_WORLD,
    depth: dimensions.depth * CM_TO_WORLD,
  };
}

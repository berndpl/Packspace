import type { SceneFraming } from '../domain/spaces';

/**
 * On narrow screens the information panel occupies the upper half of the
 * viewport. Aim above the volume so it renders below that panel, and pull the
 * camera back to compensate for the narrower horizontal field of view.
 */
export function narrowViewportFraming(framing: SceneFraming): SceneFraming {
  const pullBack = 1.6;
  const [targetX, targetY, targetZ] = framing.target;

  return {
    target: [targetX, targetY + 0.5, targetZ],
    views: {
      front: [
        framing.views.front[0],
        framing.views.front[1],
        framing.views.front[2] * pullBack,
      ],
      side: [
        framing.views.side[0] * pullBack,
        framing.views.side[1],
        framing.views.side[2],
      ],
      top: [
        framing.views.top[0],
        framing.views.top[1] * 1.15,
        framing.views.top[2],
      ],
      free: [
        framing.views.free[0] * pullBack,
        framing.views.free[1],
        framing.views.free[2] * pullBack,
      ],
    },
  };
}

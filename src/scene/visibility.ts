export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function area(rect: ScreenRect) {
  return Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top);
}

function intersection(a: ScreenRect, b: ScreenRect): ScreenRect | null {
  const rect = {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  };

  return area(rect) > 0 ? rect : null;
}

function contains(rect: ScreenRect, point: ScreenPoint) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function isObjectUsablyVisible({
  canvas,
  center,
  object,
  obstructions,
}: {
  canvas: ScreenRect;
  center: ScreenPoint;
  object: ScreenRect;
  obstructions: readonly ScreenRect[];
}) {
  if (!contains(canvas, center)) return false;
  if (obstructions.some((rect) => contains(rect, center))) return false;

  const onCanvas = intersection(canvas, object);
  if (!onCanvas) return false;

  const onCanvasArea = area(onCanvas);
  const obstructedArea = Math.min(
    onCanvasArea,
    obstructions.reduce((total, rect) => {
      const overlap = intersection(onCanvas, rect);
      return total + (overlap ? area(overlap) : 0);
    }, 0),
  );

  return (onCanvasArea - obstructedArea) / onCanvasArea >= 0.35;
}

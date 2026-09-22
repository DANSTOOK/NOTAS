import type { Transform } from '../state/types';

export type Corner = 'tl' | 'tr' | 'bl' | 'br';

const MIN_SCALE = 0.05;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Rota un vector (dx, dy) por `angleDeg` grados. */
export function rotateVector(v: { x: number; y: number }, angleDeg: number): { x: number; y: number } {
  const rad = toRad(angleDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
}

/**
 * Redimensiona desde una esquina, ancla la esquina opuesta y opcionalmente
 * bloquea la relación de aspecto (tecla Shift). `pointerDelta` es el
 * desplazamiento del puntero en coordenadas de pantalla (mundo) desde que
 * comenzó el gesto.
 */
export function resizeFromCorner(
  start: Transform,
  baseSize: { w: number; h: number },
  corner: Corner,
  pointerDelta: { dx: number; dy: number },
  lockAspect: boolean
): Transform {
  // 1. Llevar el delta del puntero (espacio mundo) al espacio local del elemento
  //    (sin rotar), invirtiendo la rotación actual.
  const local = rotateVector({ x: pointerDelta.dx, y: pointerDelta.dy }, -start.rotation);

  // 2. El signo de cada eje depende de qué esquina se arrastra.
  const signX = corner === 'tl' || corner === 'bl' ? -1 : 1;
  const signY = corner === 'tl' || corner === 'tr' ? -1 : 1;

  let newScaleX = start.scaleX + (signX * local.x) / baseSize.w;
  let newScaleY = start.scaleY + (signY * local.y) / baseSize.h;

  if (lockAspect) {
    const ratio = Math.max(newScaleX / start.scaleX, newScaleY / start.scaleY);
    newScaleX = start.scaleX * ratio;
    newScaleY = start.scaleY * ratio;
  }

  newScaleX = Math.max(MIN_SCALE, newScaleX);
  newScaleY = Math.max(MIN_SCALE, newScaleY);

  // 3. El centro se desplaza la mitad del delta efectivo (en espacio mundo)
  //    para que la esquina OPUESTA a la arrastrada quede fija.
  const effectiveLocalDx = ((newScaleX - start.scaleX) * baseSize.w * signX) / 2;
  const effectiveLocalDy = ((newScaleY - start.scaleY) * baseSize.h * signY) / 2;
  const worldShift = rotateVector({ x: effectiveLocalDx, y: effectiveLocalDy }, start.rotation);

  return {
    ...start,
    scaleX: newScaleX,
    scaleY: newScaleY,
    x: start.x + worldShift.x,
    y: start.y + worldShift.y
  };
}

/**
 * Calcula la rotación continua a partir del ángulo puntero→centro, respecto
 * al ángulo en el que comenzó el gesto (para que no haya salto inicial).
 */
export function rotateFromHandle(
  start: Transform,
  center: { x: number; y: number },
  pointer: { x: number; y: number },
  startPointerAngleDeg: number
): Transform {
  const currentAngleDeg = (Math.atan2(pointer.y - center.y, pointer.x - center.x) * 180) / Math.PI;
  let rotation = (start.rotation + (currentAngleDeg - startPointerAngleDeg)) % 360;
  if (rotation < 0) rotation += 360;
  return { ...start, rotation };
}

export function moveBy(start: Transform, delta: { dx: number; dy: number }): Transform {
  return { ...start, x: start.x + delta.dx, y: start.y + delta.dy };
}

export function toCssTransform(t: Transform): string {
  return `translate3d(${t.x}px, ${t.y}px, 0) rotate(${t.rotation}deg)`;
}

/**
 * Igual que `toCssTransform`, pero ancla el wrapper (de tamaño baseWidth x
 * baseHeight sin escalar) para que `t.x, t.y` representen el CENTRO del
 * elemento en el canvas, no su esquina superior izquierda.
 */
export function toCenteredCssTransform(t: Transform, baseWidth: number, baseHeight: number): string {
  return `translate3d(${t.x - baseWidth / 2}px, ${t.y - baseHeight / 2}px, 0) rotate(${t.rotation}deg)`;
}

export function toCssScale(t: Transform): string {
  return `scale(${t.scaleX}, ${t.scaleY})`;
}

export function transformsEqual(a: Transform, b: Transform): boolean {
  return a.x === b.x && a.y === b.y && a.scaleX === b.scaleX && a.scaleY === b.scaleY && a.rotation === b.rotation;
}

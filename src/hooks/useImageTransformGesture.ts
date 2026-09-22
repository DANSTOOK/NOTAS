import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Transform } from '../state/types';
import { type Corner, moveBy, resizeFromCorner, rotateFromHandle, transformsEqual } from '../utils/transformMath';

export type GestureMode = { kind: 'move' } | { kind: 'resize'; corner: Corner } | { kind: 'rotate' };

interface UseImageTransformGestureParams {
  getTransform: () => Transform;
  baseSize: { w: number; h: number };
  /** Centro del elemento en coordenadas de pantalla (para el cálculo de rotación). */
  getCenterScreen: () => { x: number; y: number };
  /** Escritura imperativa al DOM en cada pointermove, sin pasar por React. */
  onLive: (t: Transform) => void;
  /** Se dispara una sola vez al soltar el puntero, si el transform cambió. */
  onCommit: (from: Transform, to: Transform) => void;
}

/**
 * Motor de arrastre/escalado/rotación por Pointer Events. Durante el gesto no
 * se despacha ninguna acción de estado (evita reflow y evita generar una
 * entrada de historial por frame); solo al soltar (`pointerup`) se llama a
 * `onCommit` una vez con el transform inicial y final del gesto completo.
 */
export function useImageTransformGesture({
  getTransform,
  baseSize,
  getCenterScreen,
  onLive,
  onCommit
}: UseImageTransformGestureParams) {
  const startTransform = useRef<Transform | null>(null);
  const startPointer = useRef<{ x: number; y: number } | null>(null);
  const startAngle = useRef(0);
  const modeRef = useRef<GestureMode | null>(null);
  const liveRef = useRef<Transform | null>(null);

  const beginGesture = useCallback(
    (mode: GestureMode, e: ReactPointerEvent) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      const start = getTransform();
      startTransform.current = start;
      liveRef.current = start;
      startPointer.current = { x: e.clientX, y: e.clientY };
      modeRef.current = mode;
      if (mode.kind === 'rotate') {
        const center = getCenterScreen();
        startAngle.current = (Math.atan2(e.clientY - center.y, e.clientX - center.x) * 180) / Math.PI;
      }
    },
    [getTransform, getCenterScreen]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const mode = modeRef.current;
      const start = startTransform.current;
      const startP = startPointer.current;
      if (!mode || !start || !startP) return;

      const dx = e.clientX - startP.x;
      const dy = e.clientY - startP.y;

      let next: Transform;
      if (mode.kind === 'move') {
        next = moveBy(start, { dx, dy });
      } else if (mode.kind === 'resize') {
        next = resizeFromCorner(start, baseSize, mode.corner, { dx, dy }, e.shiftKey);
      } else {
        next = rotateFromHandle(start, getCenterScreen(), { x: e.clientX, y: e.clientY }, startAngle.current);
      }

      liveRef.current = next;
      onLive(next);
    },
    [baseSize, getCenterScreen, onLive]
  );

  const onPointerUp = useCallback(() => {
    const start = startTransform.current;
    const live = liveRef.current;
    if (start && live && !transformsEqual(start, live)) onCommit(start, live);
    startTransform.current = null;
    startPointer.current = null;
    modeRef.current = null;
    liveRef.current = null;
  }, [onCommit]);

  const isDragging = useCallback(() => modeRef.current !== null, []);

  return { beginGesture, onPointerMove, onPointerUp, isDragging };
}

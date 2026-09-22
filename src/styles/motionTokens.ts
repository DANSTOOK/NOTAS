import type { Transition } from 'motion/react';

/**
 * Tokens de movimiento de Material 3 / M3 Expressive.
 *
 * M3 Expressive sustituyó el sistema de duración + curva por muelles físicos:
 * los tokens "spatial" (posición, tamaño, rotación) sobrepasan ligeramente el
 * valor final y rebotan; los "effects" (color, opacidad) nunca sobrepasan.
 * Las constantes exactas de androidx no están publicadas en la documentación,
 * así que estos muelles están calibrados para reproducir ese comportamiento:
 * spatial con rebote contenido, effects críticamente amortiguado.
 */

// Curvas clásicas M3, para lo que debe durar un tiempo fijo y no rebotar.
export const easing = {
  standard: [0.2, 0, 0, 1],
  standardDecelerate: [0, 0, 0, 1],
  standardAccelerate: [0.3, 0, 1, 1],
  emphasized: [0.2, 0, 0, 1],
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1],
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15]
} as const;

// Duraciones M3 en segundos (Motion las espera así).
export const duration = {
  short2: 0.1,
  short4: 0.2,
  medium1: 0.25,
  medium2: 0.3,
  medium4: 0.4,
  long2: 0.5
} as const;

/** Muelles espaciales: mueven cosas por la pantalla, con rebote. */
export const spatial = {
  fast: { type: 'spring', stiffness: 800, damping: 34, mass: 0.8 },
  default: { type: 'spring', stiffness: 480, damping: 30, mass: 1 },
  slow: { type: 'spring', stiffness: 280, damping: 28, mass: 1 }
} satisfies Record<string, Transition>;

/** Muelles de efecto: color y opacidad, sin rebote. */
export const effects = {
  fast: { type: 'spring', stiffness: 1200, damping: 60, mass: 1 },
  default: { type: 'spring', stiffness: 700, damping: 52, mass: 1 }
} satisfies Record<string, Transition>;

/** Entrada/salida de una tarjeta del tablero. */
export const cardMotion = {
  initial: { opacity: 0, scale: 0.92, y: -8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: duration.short4, ease: easing.emphasizedAccelerate } },
  transition: { ...spatial.default, opacity: effects.fast }
} as const;

/** Entrada/salida de una fila de la lista de tareas. */
export const listItemMotion = {
  initial: { opacity: 0, height: 0, x: -8 },
  animate: { opacity: 1, height: 'auto', x: 0 },
  exit: { opacity: 0, height: 0, x: -8 },
  transition: { ...spatial.fast, opacity: effects.fast }
} as const;

/** Realimentación táctil al pulsar, al estilo de Android. */
export const pressable = {
  whileHover: { scale: 1.06 },
  whileTap: { scale: 0.92 },
  transition: spatial.fast
} as const;

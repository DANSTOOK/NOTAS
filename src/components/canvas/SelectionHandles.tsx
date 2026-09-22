import React from 'react';
import * as m from 'motion/react-m';
import { effects, spatial } from '../../styles/motionTokens';
import type { Corner } from '../../utils/transformMath';

interface SelectionHandlesProps {
  baseWidth: number;
  baseHeight: number;
  scaleX: number;
  scaleY: number;
  onCornerDown: (corner: Corner, e: React.PointerEvent) => void;
  onRotateDown: (e: React.PointerEvent) => void;
}

const CORNERS: { corner: Corner; sx: number; sy: number; cursor: string }[] = [
  { corner: 'tl', sx: -1, sy: -1, cursor: 'nwse-resize' },
  { corner: 'tr', sx: 1, sy: -1, cursor: 'nesw-resize' },
  { corner: 'bl', sx: -1, sy: 1, cursor: 'nesw-resize' },
  { corner: 'br', sx: 1, sy: 1, cursor: 'nwse-resize' }
];

/**
 * Renderiza los tiradores de esquina y el tirador de rotación como hijos del
 * wrapper EXTERNO de la imagen (que solo lleva translate+rotate, sin scale),
 * así su tamaño visual no se distorsiona aunque la imagen tenga scaleX!=scaleY.
 */
export function SelectionHandles({
  baseWidth,
  baseHeight,
  scaleX,
  scaleY,
  onCornerDown,
  onRotateDown
}: SelectionHandlesProps): React.JSX.Element {
  const halfW = (baseWidth * scaleX) / 2;
  const halfH = (baseHeight * scaleY) / 2;

  return (
    <>
      <m.div
        className="pointer-events-none absolute border border-blue-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={effects.fast}
        style={{
          left: '50%',
          top: '50%',
          width: baseWidth * scaleX,
          height: baseHeight * scaleY,
          x: '-50%',
          y: '-50%'
        }}
      />
      {CORNERS.map(({ corner, sx, sy, cursor }, i) => (
        <m.div
          key={corner}
          onPointerDown={(e) => onCornerDown(corner, e)}
          className="selection-handle no-select"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...spatial.fast, delay: i * 0.02 }}
          style={{
            left: `calc(50% + ${sx * halfW}px)`,
            top: `calc(50% + ${sy * halfH}px)`,
            x: '-50%',
            y: '-50%',
            cursor
          }}
        />
      ))}
      <m.div
        onPointerDown={onRotateDown}
        className="selection-handle no-select"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={spatial.fast}
        style={{
          left: '50%',
          top: `calc(50% + ${-halfH - 24}px)`,
          x: '-50%',
          y: '-50%',
          cursor: 'grab'
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 w-px bg-blue-400"
        style={{ top: `calc(50% + ${-halfH - 24}px)`, height: 24, transform: 'translateX(-50%)' }}
      />
    </>
  );
}

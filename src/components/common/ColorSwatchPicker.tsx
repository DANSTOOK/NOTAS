import React from 'react';
import * as m from 'motion/react-m';
import type { NoteColor } from '../../state/types';
import { spatial } from '../../styles/motionTokens';

const COLORS: { key: NoteColor; label: string; value: string }[] = [
  { key: 'yellow', label: 'Amarillo', value: 'var(--note-yellow)' },
  { key: 'pink', label: 'Rosa', value: 'var(--note-pink)' },
  { key: 'blue', label: 'Azul', value: 'var(--note-blue)' },
  { key: 'green', label: 'Verde', value: 'var(--note-green)' },
  { key: 'purple', label: 'Morado', value: 'var(--note-purple)' },
  { key: 'gray', label: 'Gris', value: 'var(--note-gray)' }
];

interface ColorSwatchPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
}

export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps): React.JSX.Element {
  return (
    <div role="radiogroup" aria-label="Color de la nota" className="flex items-center gap-1.5">
      {COLORS.map(({ key, label, value: color }) => (
        <m.button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          aria-label={label}
          title={label}
          onClick={() => onChange(key)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={spatial.fast}
          className="relative flex h-5 w-5 items-center justify-center rounded-full"
        >
          <span className="h-3.5 w-3.5 rounded-full" style={{ background: color }} />
          {value === key && (
            <m.span
              layoutId="color-ring"
              transition={spatial.fast}
              className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-transparent"
              style={{ boxShadow: `0 0 0 2px ${color}` }}
            />
          )}
        </m.button>
      ))}
    </div>
  );
}

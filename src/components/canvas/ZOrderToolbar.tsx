import React from 'react';
import * as m from 'motion/react-m';
import type { Note } from '../../state/types';
import { useAppState } from '../../state/store';
import { useSelection } from '../../hooks/useSelection';
import { minZIndex, nextZIndex } from '../../state/selectors';
import { spatial } from '../../styles/motionTokens';
import { uuid } from '../../utils/uuid';
import { Icon, type IconName } from '../common/Icon';

function Tool({ label, icon, onClick, danger }: { label: string; icon: IconName; onClick: () => void; danger?: boolean }) {
  return (
    <m.button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      transition={spatial.fast}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
        danger ? 'text-muted hover:bg-rose-500/10 hover:text-rose-500' : 'text-muted hover:bg-surfaceHover hover:text-ink'
      }`}
    >
      <Icon name={icon} size={15} />
    </m.button>
  );
}

export function ZOrderToolbar({ note, imageId }: { note: Note; imageId: string }): React.JSX.Element | null {
  const { dispatch } = useAppState();
  const { clearSelection } = useSelection();
  const image = note.images.find((i) => i.id === imageId);
  if (!image) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spatial.fast}
      className="absolute right-2 top-2 z-50 flex gap-0.5 rounded-xl bg-surface/95 p-1 shadow-e2 ring-1 ring-line backdrop-blur"
    >
      <Tool
        label="Traer al frente"
        icon="front"
        onClick={() => dispatch({ type: 'image/zorder', noteId: note.id, imageId, from: image.zIndex, to: nextZIndex(note) })}
      />
      <Tool
        label="Enviar al fondo"
        icon="back"
        onClick={() => dispatch({ type: 'image/zorder', noteId: note.id, imageId, from: image.zIndex, to: minZIndex(note) })}
      />
      <Tool
        label="Duplicar"
        icon="copy"
        onClick={() =>
          dispatch({
            type: 'image/duplicate',
            noteId: note.id,
            sourceId: image.id,
            newImage: {
              ...image,
              id: uuid(),
              zIndex: nextZIndex(note),
              transform: { ...image.transform, x: image.transform.x + 24, y: image.transform.y + 24 }
            }
          })
        }
      />
      <span className="mx-0.5 my-1 w-px bg-line" />
      <Tool
        label="Eliminar imagen"
        icon="trash"
        danger
        onClick={() => {
          dispatch({ type: 'image/remove', noteId: note.id, image });
          clearSelection();
        }}
      />
    </m.div>
  );
}

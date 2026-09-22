import React, { useRef, useState } from 'react';
import type { Note } from '../../state/types';
import { useAppState } from '../../state/store';
import { useSelection } from '../../hooks/useSelection';
import { useOsPasteHandler } from '../../hooks/useOsPasteHandler';
import { sortedImages, nextZIndex } from '../../state/selectors';
import { addImageToNote } from '../../utils/addImage';
import { imageFilesFromDataTransfer } from '../../utils/imageIO';
import { CanvasImageElement } from './CanvasImageElement';
import { ZOrderToolbar } from './ZOrderToolbar';
import { Icon } from '../common/Icon';

export function ImageCanvas({ note }: { note: Note }): React.JSX.Element {
  const { dispatch } = useAppState();
  const { selection, clearSelection } = useSelection();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useOsPasteHandler(containerRef, note.id);

  const dropCenterFromEvent = (e: React.DragEvent | { clientX: number; clientY: number }) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleFiles = (files: File[], center?: { x: number; y: number }) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const fallbackCenter = { x: rect.width / 2, y: rect.height / 2 };
    files.forEach((file, i) => {
      void addImageToNote(
        file,
        note.id,
        center ?? { x: fallbackCenter.x + i * 16, y: fallbackCenter.y + i * 16 },
        nextZIndex(note) + i,
        dispatch
      );
    });
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative min-h-[220px] overflow-hidden rounded-xl bg-surface2 outline-none ring-1 ring-inset transition-colors focus-visible:ring-accent ${
        dragOver ? 'ring-2 ring-accent' : 'ring-line'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragOver) setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.target === containerRef.current) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(imageFilesFromDataTransfer(e.dataTransfer), dropCenterFromEvent(e));
      }}
      onPointerDown={(e) => {
        containerRef.current?.focus();
        if (e.target === containerRef.current) clearSelection();
      }}
    >
      {note.images.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
          <span className="text-faint">
            <Icon name="image" size={22} />
          </span>
          <p className="text-[12px] text-muted">
            Arrastra una imagen, pégala con <span className="font-medium text-ink">Ctrl+V</span>
          </p>
          <p className="text-[11px] text-faint">Luego puedes moverla, girarla y escalarla</p>
        </div>
      )}

      {sortedImages(note).map((image) => (
        <CanvasImageElement key={image.id} image={image} />
      ))}

      {selection.kind === 'image' && selection.noteId === note.id && <ZOrderToolbar note={note} imageId={selection.imageId} />}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[11px] font-medium text-muted shadow-e1 ring-1 ring-line transition-colors hover:text-ink"
      >
        <Icon name="plus" size={12} />
        Imagen
      </button>
    </div>
  );
}

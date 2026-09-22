import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAppState, useUndoRedo } from '../../state/store';
import { useTheme } from '../../hooks/useTheme';
import { createEmptyNote } from '../../utils/createNote';
import { NoteSummary } from './NoteSummary';
import { NoteDetail } from './NoteDetail';
import { EmptyState } from './EmptyState';
import { Sidebar, type Filter } from '../layout/Sidebar';
import { TopBar } from '../layout/TopBar';

type ViewMode = 'grid' | 'list';
const VIEW_KEY = 'notas.view';

const TITLE: Record<Filter, string> = {
  all: 'Todas las notas',
  todo: 'Pendientes',
  doing: 'En curso',
  done: 'Hechas'
};

export function NotesBoard(): React.JSX.Element {
  const { data, dispatch } = useAppState();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { theme, toggleTheme } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // sin almacenamiento: se queda en memoria
    }
  }, [view]);

  const allNotes = useMemo(() => data.noteOrder.map((id) => data.notes[id]).filter(Boolean), [data]);

  const counts = useMemo<Record<Filter, number>>(
    () => ({
      all: allNotes.length,
      todo: allNotes.filter((n) => n.status === 'todo').length,
      doing: allNotes.filter((n) => n.status === 'doing').length,
      done: allNotes.filter((n) => n.status === 'done').length
    }),
    [allNotes]
  );

  const notes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allNotes
      .filter((n) => filter === 'all' || n.status === filter)
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.checklist.some((item) => item.text.toLowerCase().includes(q))
      );
  }, [allNotes, filter, query]);

  const createNote = () => {
    const note = createEmptyNote();
    dispatch({ type: 'note/create', note });
    setOpenNoteId(note.id);
  };

  const openNote = openNoteId ? data.notes[openNoteId] : undefined;
  useEffect(() => {
    if (openNoteId && !data.notes[openNoteId]) setOpenNoteId(null);
  }, [openNoteId, data.notes]);

  return (
    <div className="flex h-full bg-bg text-ink">
      <Sidebar
        filter={filter}
        onFilter={setFilter}
        counts={counts}
        onCreate={createNote}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={TITLE[filter]}
          count={notes.length}
          query={query}
          onQuery={setQuery}
          view={view}
          onView={setView}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5">
          {notes.length === 0 ? (
            query.trim() ? (
              <EmptyState title="Sin resultados" hint={`No hay notas que contengan “${query.trim()}”.`} />
            ) : filter === 'all' ? (
              <EmptyState
                title="Aún no hay notas"
                hint="Crea una nota para apuntar tareas, pegar capturas con Ctrl+V y colocarlas a tu gusto."
                actionLabel="Crear la primera nota"
                onAction={createNote}
              />
            ) : (
              <EmptyState title={`Nada en “${TITLE[filter]}”`} hint="Cambia el estado de una nota para que aparezca aquí." />
            )
          ) : (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] items-start gap-3.5'
                  : 'mx-auto flex max-w-4xl flex-col gap-2'
              }
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {notes.map((note) => (
                  <NoteSummary key={note.id} note={note} variant={view} onOpen={() => setOpenNoteId(note.id)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {openNote && <NoteDetail key={openNote.id} note={openNote} onClose={() => setOpenNoteId(null)} />}
      </AnimatePresence>
    </div>
  );
}

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Action, AppState, Selection } from './types';
import { HISTORY_REDO, HISTORY_UNDO, type DispatchableAction, createInitialHistoryState, historyReducer } from './historyMiddleware';
import { collectOrphanBlobs, hydrateAppState } from '../db/hydrate';
import { persistAction } from '../db/persistence';

const emptyState: AppState = { notes: {}, noteOrder: [], hydrated: false };

interface AppContextValue {
  data: AppState;
  dispatch: React.Dispatch<DispatchableAction>;
  canUndo: boolean;
  canRedo: boolean;
  selection: Selection;
  setSelection: (s: Selection) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(historyReducer, emptyState, createInitialHistoryState);
  const [selection, setSelection] = useState<Selection>({ kind: 'none' });
  const hydratedOnce = useRef(false);

  useEffect(() => {
    if (hydratedOnce.current) return;
    hydratedOnce.current = true;
    hydrateAppState().then((data) => {
      dispatch({ type: 'hydrate/set', state: data });
      void collectOrphanBlobs();
    });
  }, []);

  useEffect(() => {
    if (!state.lastAction) return;
    const action: Action = state.lastAction;
    const noteId = 'noteId' in action ? action.noteId : action.type === 'note/create' || action.type === 'note/remove' ? action.note.id : undefined;
    const resolvedNote = noteId ? state.data.notes[noteId] : undefined;
    persistAction(action, resolvedNote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.seq]);

  const value = useMemo<AppContextValue>(
    () => ({
      data: state.data,
      dispatch,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      selection,
      setSelection
    }),
    [state, selection]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de <AppStateProvider>');
  return ctx;
}

export function useUndoRedo(): { undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean } {
  const { dispatch, canUndo, canRedo } = useAppState();
  return {
    undo: () => dispatch({ type: HISTORY_UNDO }),
    redo: () => dispatch({ type: HISTORY_REDO }),
    canUndo,
    canRedo
  };
}

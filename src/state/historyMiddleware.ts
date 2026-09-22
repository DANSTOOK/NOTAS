import type { Action, AppState, HistoryEntry, HistoryState } from './types';
import { invertAction, rootReducer } from './rootReducer';

export const HISTORY_UNDO = 'HISTORY_UNDO' as const;
export const HISTORY_REDO = 'HISTORY_REDO' as const;

export type DispatchableAction = Action | { type: typeof HISTORY_UNDO } | { type: typeof HISTORY_REDO };

/** Ventana de inactividad dentro de la cual se siguen fusionando ediciones al mismo campo. */
const COALESCE_WINDOW_MS = 1500;

export interface HistoryRootState {
  data: AppState;
  history: HistoryState;
  /** Última acción realmente aplicada (para que la capa de persistencia reaccione a ella). */
  lastAction: Action | null;
  seq: number;
}

export function createInitialHistoryState(data: AppState): HistoryRootState {
  return { data, history: { past: [], future: [] }, lastAction: null, seq: 0 };
}

function coalesceKeyOf(action: Action): string | undefined {
  return 'coalesceKey' in action ? action.coalesceKey : undefined;
}

export function historyReducer(state: HistoryRootState, action: DispatchableAction): HistoryRootState {
  if (action.type === HISTORY_UNDO) {
    const entry = state.history.past[state.history.past.length - 1];
    if (!entry) return state;
    return {
      data: rootReducer(state.data, entry.undo),
      history: { past: state.history.past.slice(0, -1), future: [entry, ...state.history.future] },
      lastAction: entry.undo,
      seq: state.seq + 1
    };
  }

  if (action.type === HISTORY_REDO) {
    const entry = state.history.future[0];
    if (!entry) return state;
    return {
      data: rootReducer(state.data, entry.redo),
      history: { past: [...state.history.past, entry], future: state.history.future.slice(1) },
      lastAction: entry.redo,
      seq: state.seq + 1
    };
  }

  if (action.type === 'hydrate/set') {
    return { data: action.state, history: { past: [], future: [] }, lastAction: action, seq: state.seq + 1 };
  }

  const nextData = rootReducer(state.data, action);
  const undo = invertAction(action);

  if (!undo) {
    // Acción que no participa en el historial (p.ej. resolución de object URL).
    return { ...state, data: nextData, lastAction: action, seq: state.seq + 1 };
  }

  const key = coalesceKeyOf(action);
  const last = state.history.past[state.history.past.length - 1];
  const canCoalesce = !!key && !!last && last.coalesceKey === key && Date.now() - last.timestamp < COALESCE_WINDOW_MS;

  const entry: HistoryEntry = canCoalesce
    ? { ...last!, redo: action, timestamp: Date.now() }
    : { undo, redo: action, timestamp: Date.now(), coalesceKey: key };

  const past = canCoalesce ? [...state.history.past.slice(0, -1), entry] : [...state.history.past, entry];

  return { data: nextData, history: { past, future: [] }, lastAction: action, seq: state.seq + 1 };
}

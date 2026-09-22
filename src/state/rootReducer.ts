import type { Action, AppState, Note } from './types';

function withNote(state: AppState, noteId: string, fn: (note: Note) => Note): AppState {
  const note = state.notes[noteId];
  if (!note) return state;
  return { ...state, notes: { ...state.notes, [noteId]: fn(note) } };
}

export function rootReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate/set':
      return action.state;

    case 'note/create':
      return {
        ...state,
        notes: { ...state.notes, [action.note.id]: action.note },
        noteOrder: [action.note.id, ...state.noteOrder]
      };

    case 'note/remove': {
      const notes = { ...state.notes };
      delete notes[action.note.id];
      return { ...state, notes, noteOrder: state.noteOrder.filter((id) => id !== action.note.id) };
    }

    case 'note/updateTitle':
      return withNote(state, action.noteId, (n) => ({ ...n, title: action.to, updatedAt: Date.now() }));

    case 'note/updateColor':
      return withNote(state, action.noteId, (n) => ({ ...n, color: action.to, updatedAt: Date.now() }));

    case 'note/updateStatus':
      return withNote(state, action.noteId, (n) => ({ ...n, status: action.to, updatedAt: Date.now() }));

    case 'note/updatePriority':
      return withNote(state, action.noteId, (n) => ({ ...n, priority: action.to, updatedAt: Date.now() }));

    case 'note/updateDueDate':
      return withNote(state, action.noteId, (n) => ({ ...n, dueDate: action.to, updatedAt: Date.now() }));

    case 'checklist/addItem':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        checklist: [...n.checklist, action.item],
        updatedAt: Date.now()
      }));

    case 'checklist/removeItem':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        checklist: n.checklist.filter((i) => i.id !== action.item.id),
        updatedAt: Date.now()
      }));

    case 'checklist/toggleItem':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        checklist: n.checklist.map((i) => (i.id === action.itemId ? { ...i, done: action.to } : i)),
        updatedAt: Date.now()
      }));

    case 'checklist/updateText':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        checklist: n.checklist.map((i) => (i.id === action.itemId ? { ...i, text: action.to } : i)),
        updatedAt: Date.now()
      }));

    case 'image/add':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        images: [...n.images, action.image],
        updatedAt: Date.now()
      }));

    case 'image/remove':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        images: n.images.filter((i) => i.id !== action.image.id),
        updatedAt: Date.now()
      }));

    case 'image/duplicate':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        images: [...n.images, action.newImage],
        updatedAt: Date.now()
      }));

    case 'image/transform':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        images: n.images.map((i) => (i.id === action.imageId ? { ...i, transform: action.to } : i)),
        updatedAt: Date.now()
      }));

    case 'image/zorder':
      return withNote(state, action.noteId, (n) => ({
        ...n,
        images: n.images.map((i) => (i.id === action.imageId ? { ...i, zIndex: action.to } : i))
      }));

    default:
      return state;
  }
}

/** Construye la acción inversa de `action`, dado el estado ANTES de aplicarla. */
export function invertAction(action: Action): Action | null {
  switch (action.type) {
    case 'note/create':
      return { type: 'note/remove', note: action.note };
    case 'note/remove':
      return { type: 'note/create', note: action.note };
    case 'note/updateTitle':
      return { type: 'note/updateTitle', noteId: action.noteId, from: action.to, to: action.from };
    case 'note/updateColor':
      return { type: 'note/updateColor', noteId: action.noteId, from: action.to, to: action.from };
    case 'note/updateStatus':
      return { type: 'note/updateStatus', noteId: action.noteId, from: action.to, to: action.from };
    case 'note/updatePriority':
      return { type: 'note/updatePriority', noteId: action.noteId, from: action.to, to: action.from };
    case 'note/updateDueDate':
      return { type: 'note/updateDueDate', noteId: action.noteId, from: action.to, to: action.from };
    case 'checklist/addItem':
      return { type: 'checklist/removeItem', noteId: action.noteId, item: action.item };
    case 'checklist/removeItem':
      return { type: 'checklist/addItem', noteId: action.noteId, item: action.item };
    case 'checklist/toggleItem':
      return { type: 'checklist/toggleItem', noteId: action.noteId, itemId: action.itemId, from: action.to, to: action.from };
    case 'checklist/updateText':
      return { type: 'checklist/updateText', noteId: action.noteId, itemId: action.itemId, from: action.to, to: action.from };
    case 'image/add':
      return { type: 'image/remove', noteId: action.noteId, image: action.image };
    case 'image/remove':
      return { type: 'image/add', noteId: action.noteId, image: action.image };
    case 'image/duplicate':
      return { type: 'image/remove', noteId: action.noteId, image: action.newImage };
    case 'image/transform':
      return { type: 'image/transform', noteId: action.noteId, imageId: action.imageId, from: action.to, to: action.from };
    case 'image/zorder':
      return { type: 'image/zorder', noteId: action.noteId, imageId: action.imageId, from: action.to, to: action.from };
    case 'hydrate/set':
      return null; // no participa en el historial
  }
}

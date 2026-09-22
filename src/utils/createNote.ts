import type { Note } from '../state/types';
import { uuid } from './uuid';

export function createEmptyNote(): Note {
  const now = Date.now();
  return {
    id: uuid(),
    title: '',
    color: 'yellow',
    status: 'todo',
    priority: null,
    dueDate: null,
    createdAt: now,
    updatedAt: now,
    archived: false,
    checklist: [],
    images: []
  };
}

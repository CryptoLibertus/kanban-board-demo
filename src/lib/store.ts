'use client';

import { v4 as uuid } from 'uuid';
import type { Board, Card, Column, Label } from './types';
import { DEFAULT_LABELS } from './types';

const STORAGE_KEY = 'kanban-boards';

function createDefaultBoard(): Board {
  const todoCol: Column = { id: uuid(), title: 'To Do', cardIds: [] };
  const inProgressCol: Column = { id: uuid(), title: 'In Progress', cardIds: [] };
  const reviewCol: Column = { id: uuid(), title: 'Review', cardIds: [] };
  const doneCol: Column = { id: uuid(), title: 'Done', cardIds: [] };

  const sampleCards: Card[] = [
    {
      id: uuid(), title: 'Set up project repo', description: 'Initialize the repository with Next.js and Tailwind.',
      labels: [DEFAULT_LABELS[1]], dueDate: null, createdAt: new Date().toISOString(),
    },
    {
      id: uuid(), title: 'Design database schema', description: 'Define the data models for boards, lists, and cards.',
      labels: [DEFAULT_LABELS[4]], dueDate: null, createdAt: new Date().toISOString(),
    },
    {
      id: uuid(), title: 'Build drag-and-drop UI', description: 'Implement card reordering with dnd-kit.',
      labels: [DEFAULT_LABELS[5], DEFAULT_LABELS[1]], dueDate: null, createdAt: new Date().toISOString(),
    },
    {
      id: uuid(), title: 'Fix card deletion bug', description: 'Cards not removing from column after delete.',
      labels: [DEFAULT_LABELS[0]], dueDate: null, createdAt: new Date().toISOString(),
    },
  ];

  todoCol.cardIds = [sampleCards[0].id, sampleCards[1].id];
  inProgressCol.cardIds = [sampleCards[2].id];
  reviewCol.cardIds = [sampleCards[3].id];

  const cards: Record<string, Card> = {};
  for (const c of sampleCards) cards[c.id] = c;

  return {
    id: uuid(),
    title: 'My First Board',
    columns: [todoCol, inProgressCol, reviewCol, doneCol],
    cards,
    createdAt: new Date().toISOString(),
  };
}

export function loadBoards(): Board[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const boards = [createDefaultBoard()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    return boards;
  }
  return JSON.parse(raw) as Board[];
}

export function saveBoards(boards: Board[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

export function createBoard(title: string): Board {
  return {
    id: uuid(),
    title,
    columns: [
      { id: uuid(), title: 'To Do', cardIds: [] },
      { id: uuid(), title: 'In Progress', cardIds: [] },
      { id: uuid(), title: 'Done', cardIds: [] },
    ],
    cards: {},
    createdAt: new Date().toISOString(),
  };
}

export function addColumn(board: Board, title: string): Board {
  return {
    ...board,
    columns: [...board.columns, { id: uuid(), title, cardIds: [] }],
  };
}

export function deleteColumn(board: Board, columnId: string): Board {
  const col = board.columns.find(c => c.id === columnId);
  const newCards = { ...board.cards };
  if (col) {
    for (const cid of col.cardIds) delete newCards[cid];
  }
  return {
    ...board,
    columns: board.columns.filter(c => c.id !== columnId),
    cards: newCards,
  };
}

export function renameColumn(board: Board, columnId: string, title: string): Board {
  return {
    ...board,
    columns: board.columns.map(c => c.id === columnId ? { ...c, title } : c),
  };
}

export function addCard(board: Board, columnId: string, title: string, description = ''): Board {
  const card: Card = {
    id: uuid(),
    title,
    description,
    labels: [],
    dueDate: null,
    createdAt: new Date().toISOString(),
  };
  return {
    ...board,
    columns: board.columns.map(c =>
      c.id === columnId ? { ...c, cardIds: [...c.cardIds, card.id] } : c
    ),
    cards: { ...board.cards, [card.id]: card },
  };
}

export function updateCard(board: Board, cardId: string, updates: Partial<Card>): Board {
  const existing = board.cards[cardId];
  if (!existing) return board;
  return {
    ...board,
    cards: { ...board.cards, [cardId]: { ...existing, ...updates } },
  };
}

export function deleteCard(board: Board, cardId: string): Board {
  const newCards = { ...board.cards };
  delete newCards[cardId];
  return {
    ...board,
    columns: board.columns.map(c => ({
      ...c,
      cardIds: c.cardIds.filter(id => id !== cardId),
    })),
    cards: newCards,
  };
}

export function moveCard(
  board: Board,
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  newIndex: number,
): Board {
  const newColumns = board.columns.map(col => {
    if (col.id === fromColumnId && col.id === toColumnId) {
      const ids = col.cardIds.filter(id => id !== cardId);
      ids.splice(newIndex, 0, cardId);
      return { ...col, cardIds: ids };
    }
    if (col.id === fromColumnId) {
      return { ...col, cardIds: col.cardIds.filter(id => id !== cardId) };
    }
    if (col.id === toColumnId) {
      const ids = [...col.cardIds];
      ids.splice(newIndex, 0, cardId);
      return { ...col, cardIds: ids };
    }
    return col;
  });
  return { ...board, columns: newColumns };
}

export function toggleLabel(board: Board, cardId: string, label: Label): Board {
  const card = board.cards[cardId];
  if (!card) return board;
  const has = card.labels.some(l => l.id === label.id);
  const newLabels = has
    ? card.labels.filter(l => l.id !== label.id)
    : [...card.labels, label];
  return updateCard(board, cardId, { labels: newLabels });
}

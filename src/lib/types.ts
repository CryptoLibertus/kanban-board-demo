export interface Card {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  dueDate: string | null;
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  cards: Record<string, Card>;
  createdAt: string;
}

export const DEFAULT_LABELS: Label[] = [
  { id: 'l1', name: 'Bug', color: '#ef4444' },
  { id: 'l2', name: 'Feature', color: '#22c55e' },
  { id: 'l3', name: 'Urgent', color: '#f97316' },
  { id: 'l4', name: 'Design', color: '#a855f7' },
  { id: 'l5', name: 'Backend', color: '#3b82f6' },
  { id: 'l6', name: 'Frontend', color: '#06b6d4' },
];

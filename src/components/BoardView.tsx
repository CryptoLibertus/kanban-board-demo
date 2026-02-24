'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Board, Card, Label } from '@/lib/types';
import {
  addCard,
  addColumn,
  deleteCard,
  deleteColumn,
  moveCard,
  renameColumn,
  toggleLabel,
  updateCard,
} from '@/lib/store';
import ColumnContainer from './ColumnContainer';
import CardModal from './CardModal';

interface BoardViewProps {
  board: Board;
  onUpdate: (board: Board) => void;
}

export default function BoardView({ board, onUpdate }: BoardViewProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const findColumnForCard = useCallback((cardId: string): string | null => {
    for (const col of board.columns) {
      if (col.cardIds.includes(cardId)) return col.id;
    }
    return null;
  }, [board.columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = board.cards[event.active.id as string];
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColId = findColumnForCard(activeId);
    if (!activeColId) return;

    // Dropping over a column directly
    const overColumn = board.columns.find(c => c.id === overId);
    if (overColumn && activeColId !== overId) {
      onUpdate(moveCard(board, activeId, activeColId, overId, overColumn.cardIds.length));
      return;
    }

    // Dropping over another card
    const overColId = findColumnForCard(overId);
    if (!overColId || activeColId === overColId) return;

    const overCol = board.columns.find(c => c.id === overColId);
    if (!overCol) return;
    const overIndex = overCol.cardIds.indexOf(overId);
    onUpdate(moveCard(board, activeId, activeColId, overColId, overIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const colId = findColumnForCard(activeId);
    if (!colId) return;

    const col = board.columns.find(c => c.id === colId);
    if (!col) return;

    // Both cards in same column — reorder
    if (col.cardIds.includes(overId)) {
      const oldIndex = col.cardIds.indexOf(activeId);
      const newIndex = col.cardIds.indexOf(overId);
      const newIds = arrayMove(col.cardIds, oldIndex, newIndex);
      onUpdate({
        ...board,
        columns: board.columns.map(c => c.id === colId ? { ...c, cardIds: newIds } : c),
      });
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      onUpdate(addColumn(board, newColumnTitle.trim()));
      setNewColumnTitle('');
      setAddingColumn(false);
    }
  };

  const editingCard = editingCardId ? board.cards[editingCardId] : null;

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-6 items-start min-h-full">
          {board.columns.map(column => {
            const cards = column.cardIds
              .map(id => board.cards[id])
              .filter(Boolean);

            return (
              <ColumnContainer
                key={column.id}
                column={column}
                cards={cards}
                onAddCard={title => onUpdate(addCard(board, column.id, title))}
                onCardClick={cardId => setEditingCardId(cardId)}
                onRenameColumn={title => onUpdate(renameColumn(board, column.id, title))}
                onDeleteColumn={() => onUpdate(deleteColumn(board, column.id))}
              />
            );
          })}

          {/* Add column button */}
          {addingColumn ? (
            <div className="w-64 sm:w-72 min-w-[256px] sm:min-w-[288px] bg-gray-100 rounded-xl p-3 shrink-0">
              <input
                className="w-full text-sm border border-blue-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter list title..."
                value={newColumnTitle}
                onChange={e => setNewColumnTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') setAddingColumn(false);
                }}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddColumn}
                  className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                >
                  Add List
                </button>
                <button
                  onClick={() => setAddingColumn(false)}
                  className="text-gray-500 text-sm hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="w-64 sm:w-72 min-w-[256px] sm:min-w-[288px] bg-white/60 hover:bg-white/80 rounded-xl p-3 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors border border-dashed border-gray-300 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add another list
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 p-3 w-60 sm:w-64 rotate-3">
              <p className="text-sm font-medium text-gray-800">{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Card detail modal */}
      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCardId(null)}
          onUpdate={updates => onUpdate(updateCard(board, editingCard.id, updates))}
          onDelete={() => { onUpdate(deleteCard(board, editingCard.id)); setEditingCardId(null); }}
          onToggleLabel={(label: Label) => onUpdate(toggleLabel(board, editingCard.id, label))}
        />
      )}
    </div>
  );
}

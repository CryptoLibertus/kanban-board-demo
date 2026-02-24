'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, Card } from '@/lib/types';
import CardItem from './CardItem';

interface ColumnContainerProps {
  column: Column;
  cards: Card[];
  onAddCard: (title: string) => void;
  onCardClick: (cardId: string) => void;
  onRenameColumn: (title: string) => void;
  onDeleteColumn: () => void;
}

export default function ColumnContainer({
  column,
  cards,
  onAddCard,
  onCardClick,
  onRenameColumn,
  onDeleteColumn,
}: ColumnContainerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  });

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddCard(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleRename = () => {
    if (editTitle.trim()) {
      onRenameColumn(editTitle.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`flex flex-col w-72 min-w-[288px] bg-gray-100 rounded-xl p-3 max-h-[calc(100vh-180px)] ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        {isEditing ? (
          <input
            className="text-sm font-semibold text-gray-700 bg-white border border-blue-400 rounded px-2 py-1 w-full"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900"
            onClick={() => setIsEditing(true)}
          >
            {column.title}
            <span className="ml-2 text-xs font-normal text-gray-400">{cards.length}</span>
          </h3>
        )}
        <button
          onClick={onDeleteColumn}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Delete column"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-2 min-h-[40px]">
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card.id)} />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {isAdding ? (
        <div className="mt-2">
          <textarea
            className="w-full text-sm border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter a title for this card..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
              if (e.key === 'Escape') setIsAdding(false);
            }}
            autoFocus
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleAdd}
              className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
            >
              Add Card
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="text-gray-500 text-sm px-2 py-1 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm py-1 px-2 rounded hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add a card
        </button>
      )}
    </div>
  );
}

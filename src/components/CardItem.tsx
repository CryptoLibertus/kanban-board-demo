'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '@/lib/types';

interface CardItemProps {
  card: Card;
  onClick: () => void;
}

export default function CardItem({ card, onClick }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
    >
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map(label => (
            <span
              key={label.id}
              className="inline-block h-2 w-10 rounded-full"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}
      <p className="text-sm font-medium text-gray-800">{card.title}</p>
      {card.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
      )}
      {card.dueDate && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(card.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

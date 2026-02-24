'use client';

import { useState } from 'react';
import type { Card, Label } from '@/lib/types';
import { DEFAULT_LABELS } from '@/lib/types';

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updates: Partial<Card>) => void;
  onDelete: () => void;
  onToggleLabel: (label: Label) => void;
}

export default function CardModal({ card, onClose, onUpdate, onDelete, onToggleLabel }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [showLabels, setShowLabels] = useState(false);

  const handleSave = () => {
    onUpdate({ title, description, dueDate: dueDate || null });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-start sm:justify-center sm:pt-20 z-50" onClick={onClose}>
      <div
        className="bg-white w-full sm:rounded-xl sm:max-w-lg sm:mx-4 shadow-2xl overflow-hidden max-h-[90dvh] sm:max-h-[80vh] flex flex-col rounded-t-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 pb-0">
          <div className="flex-1">
            <input
              className="text-lg font-semibold text-gray-800 w-full border-none outline-none focus:ring-0 p-0"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Labels */}
          <div className="px-4 sm:px-6 pt-3">
            <div className="flex flex-wrap gap-1.5">
              {card.labels.map(label => (
                <span
                  key={label.id}
                  className="text-xs text-white px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
              <button
                onClick={() => setShowLabels(!showLabels)}
                className="text-xs text-gray-500 px-2 py-0.5 rounded-full border border-dashed border-gray-300 hover:border-gray-400"
              >
                + Label
              </button>
            </div>
            {showLabels && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-2">Toggle Labels</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_LABELS.map(label => {
                    const isActive = card.labels.some(l => l.id === label.id);
                    return (
                      <button
                        key={label.id}
                        onClick={() => onToggleLabel(label)}
                        className={`text-xs text-white px-3 py-1.5 rounded-full font-medium transition-all ${
                          isActive ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="px-4 sm:px-6 pt-4">
            <label className="text-sm font-medium text-gray-600 block mb-1">Description</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px] sm:min-h-[100px]"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Due Date */}
          <div className="px-4 sm:px-6 pt-3">
            <label className="text-sm font-medium text-gray-600 block mb-1">Due Date</label>
            <input
              type="date"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Actions — sticky at bottom */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-100">
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded transition-colors"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-sm bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

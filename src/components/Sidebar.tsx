'use client';

import { useState } from 'react';
import type { Board } from '@/lib/types';

interface SidebarProps {
  boards: Board[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (id: string) => void;
}

export default function Sidebar({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
}: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateBoard(newTitle.trim());
      setNewTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Kanban Board
        </h1>
      </div>

      {/* Boards list */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
          Your Boards
        </p>
        {boards.map(board => (
          <div
            key={board.id}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              board.id === activeBoardId
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => onSelectBoard(board.id)}
          >
            <span className="text-sm truncate">{board.title}</span>
            <button
              onClick={e => { e.stopPropagation(); onDeleteBoard(board.id); }}
              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 ${
                board.id === activeBoardId ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-red-400'
              }`}
              title="Delete board"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Create board */}
      <div className="p-3 border-t border-gray-700">
        {isCreating ? (
          <div>
            <input
              className="w-full text-sm bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Board name..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleCreate} className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 flex-1">
                Create
              </button>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 text-sm px-2 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create new board
          </button>
        )}
      </div>
    </div>
  );
}

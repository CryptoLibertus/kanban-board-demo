'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import type { Board } from '@/lib/types';
import { loadBoards, saveBoards, createBoard } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import BoardView from '@/components/BoardView';

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Home() {
  const mounted = useHasMounted();
  const [boards, setBoards] = useState<Board[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadBoards();
  });
  const [activeBoardId, setActiveBoardId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const loaded = loadBoards();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const persist = useCallback((newBoards: Board[]) => {
    setBoards(newBoards);
    saveBoards(newBoards);
  }, []);

  const handleCreateBoard = (title: string) => {
    const board = createBoard(title);
    const newBoards = [...boards, board];
    persist(newBoards);
    setActiveBoardId(board.id);
  };

  const handleDeleteBoard = (id: string) => {
    const newBoards = boards.filter(b => b.id !== id);
    persist(newBoards);
    if (activeBoardId === id) {
      setActiveBoardId(newBoards.length > 0 ? newBoards[0].id : null);
    }
  };

  const handleUpdateBoard = (updated: Board) => {
    const newBoards = boards.map(b => b.id === updated.id ? updated : b);
    persist(newBoards);
  };

  const activeBoard = boards.find(b => b.id === activeBoardId) || null;

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden min-w-0">
        {activeBoard ? (
          <>
            <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-gray-600 hover:text-gray-800 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{activeBoard.title}</h2>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap ml-2">
                {activeBoard.columns.length} lists &middot;{' '}
                {Object.keys(activeBoard.cards).length} cards
              </div>
            </header>
            <BoardView board={activeBoard} onUpdate={handleUpdateBoard} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mb-4 text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-600">No board selected</h3>
              <p className="text-sm text-gray-400 mt-1">Create a board from the sidebar to get started</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

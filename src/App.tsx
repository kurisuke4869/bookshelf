import { useState } from 'react';
import type { Book, BookStatus } from './types';
import { ShelfSection } from './components/ShelfSection';
import { AddBookModal } from './components/AddBookModal';
import { BookDetailModal } from './components/BookDetailModal';
import { loadBooks, addBook, updateBook, deleteBook } from './store';
import './index.css';

type SortKey = 'addedAt' | 'readAt' | 'author' | 'series';
type View = 'home' | BookStatus;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'readAt', label: '読んだ順' },
  { key: 'author', label: '著者順' },
  { key: 'series', label: 'シリーズ順' },
  { key: 'addedAt', label: '追加順' },
];

const VIEW_META: Record<BookStatus, { label: string; icon: string }> = {
  read:      { label: '読了',    icon: '✅' },
  tsundoku:  { label: '積ん読',  icon: '📦' },
  wishlist:  { label: 'ほしい本', icon: '⭐' },
};

function sortBooks(books: Book[], key: SortKey): Book[] {
  return [...books].sort((a, b) => {
    if (key === 'readAt') return (b.readAt ?? '').localeCompare(a.readAt ?? '');
    if (key === 'author') return a.author.localeCompare(b.author, 'ja');
    if (key === 'series') {
      const sa = a.series ?? a.title;
      const sb = b.series ?? b.title;
      if (sa !== sb) return sa.localeCompare(sb, 'ja');
      return (a.seriesIndex ?? 0) - (b.seriesIndex ?? 0);
    }
    return (b.addedAt ?? '').localeCompare(a.addedAt ?? '');
  });
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks());
  const [sortKey, setSortKey] = useState<SortKey>('readAt');
  const [view, setView] = useState<View>('home');
  const [addModalStatus, setAddModalStatus] = useState<BookStatus | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);

  const readBooks = sortBooks(books.filter(b => b.status === 'read'), sortKey);
  const tsundokuBooks = books.filter(b => b.status === 'tsundoku');
  const wishlistBooks = books.filter(b => b.status === 'wishlist');

  const handleAdd = (book: Book) => {
    setBooks(prev => addBook(prev, book));
    setAddModalStatus(null);
  };

  const handleUpdate = (updated: Book) => {
    setBooks(prev => updateBook(prev, updated));
    setDetailBook(updated);
  };

  const handleDelete = (id: string) => {
    setBooks(prev => deleteBook(prev, id));
    setDetailBook(null);
  };

  const isDetailView = view !== 'home';
  const showSortBar = view === 'home' || view === 'read';

  return (
    <div className="wood-bg min-h-screen">
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-50 px-4 py-3"
        style={{
          background: 'linear-gradient(180deg, var(--wood-dark) 0%, rgba(61,31,10,0.97) 100%)',
          borderBottom: '2px solid var(--gold)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDetailView ? (
              <button
                className="shelf-label text-sm opacity-70 hover:opacity-100 flex items-center gap-1"
                onClick={() => setView('home')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ‹ 戻る
              </button>
            ) : (
              <>
                <span style={{ fontSize: '1.4rem' }}>📚</span>
                <h1 className="shelf-label text-lg font-normal m-0" style={{ letterSpacing: '0.15em' }}>
                  My Bookshelf
                </h1>
              </>
            )}
            {isDetailView && (
              <h1 className="shelf-label text-base font-normal m-0">
                {VIEW_META[view as BookStatus].icon} {VIEW_META[view as BookStatus].label}
              </h1>
            )}
          </div>
          <button
            className="btn-primary text-sm px-4 py-1.5 rounded"
            onClick={() => setAddModalStatus(isDetailView ? (view as BookStatus) : 'read')}
          >
            ＋ 追加
          </button>
        </div>

        {/* ソートバー（読了画面のとき） */}
        {showSortBar && view === 'read' && (
          <div className="max-w-2xl mx-auto mt-2 flex gap-1 overflow-x-auto pb-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`nav-tab text-xs px-3 py-1 rounded whitespace-nowrap ${sortKey === opt.key ? 'active' : ''}`}
                onClick={() => setSortKey(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto pt-6 pb-16 px-2">
        {/* ホーム：各棚のプレビュー */}
        {view === 'home' && (
          <>
            {books.length === 0 && (
              <div
                className="text-center py-16"
                style={{ color: 'rgba(245,234,216,0.3)', fontFamily: 'Georgia, serif' }}
              >
                <p style={{ fontSize: '2rem' }}>📚</p>
                <p className="mt-2 text-sm">本棚が空です</p>
                <p className="text-xs mt-1 opacity-70">「＋ 追加」から最初の一冊を登録しましょう</p>
              </div>
            )}
            <ShelfSection
              label="読了" icon="✅"
              books={readBooks}
              onBookClick={setDetailBook}
              onAddClick={() => setAddModalStatus('read')}
              onMoreClick={() => setView('read')}
              emptyMessage="読んだ本を追加しましょう"
              preview
            />
            <ShelfSection
              label="積ん読" icon="📦"
              books={tsundokuBooks}
              onBookClick={setDetailBook}
              onAddClick={() => setAddModalStatus('tsundoku')}
              onMoreClick={() => setView('tsundoku')}
              emptyMessage="積ん読の本を追加しましょう"
              preview
            />
            <ShelfSection
              label="ほしい本" icon="⭐"
              books={wishlistBooks}
              onBookClick={setDetailBook}
              onAddClick={() => setAddModalStatus('wishlist')}
              onMoreClick={() => setView('wishlist')}
              emptyMessage="気になる本を追加しましょう"
              preview
            />
          </>
        )}

        {/* 各棚の全件表示 */}
        {view === 'read' && (
          <>
            <div className="max-w-2xl mx-auto mb-4 flex gap-1 overflow-x-auto">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  className={`nav-tab text-xs px-3 py-1 rounded whitespace-nowrap ${sortKey === opt.key ? 'active' : ''}`}
                  onClick={() => setSortKey(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <ShelfSection
              label="読了" icon="✅"
              books={readBooks}
              onBookClick={setDetailBook}
              onAddClick={() => setAddModalStatus('read')}
              emptyMessage="読んだ本を追加しましょう"
            />
          </>
        )}
        {view === 'tsundoku' && (
          <ShelfSection
            label="積ん読" icon="📦"
            books={tsundokuBooks}
            onBookClick={setDetailBook}
            onAddClick={() => setAddModalStatus('tsundoku')}
            emptyMessage="積ん読の本を追加しましょう"
          />
        )}
        {view === 'wishlist' && (
          <ShelfSection
            label="ほしい本" icon="⭐"
            books={wishlistBooks}
            onBookClick={setDetailBook}
            onAddClick={() => setAddModalStatus('wishlist')}
            emptyMessage="気になる本を追加しましょう"
          />
        )}
      </main>

      {/* モーダル */}
      {addModalStatus && (
        <AddBookModal
          initialStatus={addModalStatus}
          onAdd={handleAdd}
          onClose={() => setAddModalStatus(null)}
        />
      )}
      {detailBook && (
        <BookDetailModal
          book={detailBook}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setDetailBook(null)}
        />
      )}
    </div>
  );
}

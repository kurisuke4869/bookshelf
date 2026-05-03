import { useState } from 'react';
import type { Book, BookStatus } from './types';
import { ShelfSection } from './components/ShelfSection';
import { AddBookModal } from './components/AddBookModal';
import { BookDetailModal } from './components/BookDetailModal';
import { StatsView } from './components/StatsView';
import { HomeView } from './components/HomeView';
import { loadBooks, addBook, updateBook, deleteBook } from './store';
import './index.css';

type SortKey = 'addedAt' | 'readAt' | 'author' | 'series';
type View = 'home' | BookStatus;
type BottomTab = 'home' | 'shelf' | 'stats';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'readAt', label: '読んだ順' },
  { key: 'author', label: '著者順' },
  { key: 'series', label: 'シリーズ順' },
  { key: 'addedAt', label: '追加順' },
];

const SECTION_META: Record<BookStatus, { label: string; color: string }> = {
  read:     { label: '読了',   color: '#c87a30' },
  reading:  { label: '読書中', color: '#4a8a6a' },
  tsundoku: { label: '積読',   color: '#8a6840' },
  wishlist: { label: 'ほしい', color: '#6a7a40' },
};

function sortBooks(books: Book[], key: SortKey): Book[] {
  return [...books].sort((a, b) => {
    if (key === 'readAt') return (b.readAt ?? '').localeCompare(a.readAt ?? '');
    if (key === 'author') {
      const authorCmp = a.author.localeCompare(b.author, 'ja');
      if (authorCmp !== 0) return authorCmp;
      return (a.publishedDate ?? '').localeCompare(b.publishedDate ?? '');
    }
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
  const [bottomTab, setBottomTab] = useState<BottomTab>('home');
  const [addModalStatus, setAddModalStatus] = useState<BookStatus | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const readBooks = sortBooks(books.filter(b => b.status === 'read'), sortKey);
  const readingBooks = books.filter(b => b.status === 'reading');
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
  const currentMeta = isDetailView ? SECTION_META[view as BookStatus] : null;

  const showSection = (status: BookStatus) => {
    return !isDetailView || view === status;
  };

  const searchResults = searchQuery.trim()
    ? books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const statusLabel = (s: BookStatus) =>
    s === 'read' ? '読了' : s === 'reading' ? '読書中' : s === 'tsundoku' ? '積読' : 'ほしい';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ヘッダー */}
      <header className="app-header">
        <div style={{ padding: '16px 16px 0' }}>
          {/* タイトル行 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            {isDetailView ? (
              <button
                onClick={() => setView('home')}
                style={{
                  background: '#e8d8c0', border: '1px solid #c8a070', cursor: 'pointer',
                  color: '#8a5020', fontSize: '15px',
                  fontFamily: "'Kaisei Tokumin', Georgia, serif",
                  display: 'flex', alignItems: 'center', gap: '4px',
                  borderRadius: '16px', padding: '4px 12px',
                }}
              >
                ‹ 戻る
              </button>
            ) : searching ? (
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="タイトル・著者名で検索..."
                className="modal-input"
                style={{ flex: 1, fontSize: '14px', marginRight: '8px' }}
              />
            ) : (
              <span />
            )}
            {isDetailView && (
              <span style={{
                color: '#3b2510', fontSize: '18px',
                fontFamily: "'Kaisei Tokumin', Georgia, serif",
              }}>
                {currentMeta!.label}
              </span>
            )}
            {!isDetailView && (
              <button
                onClick={() => { setSearching(v => !v); setSearchQuery(''); }}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#e8d8c0', border: '1px solid #c8a070', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {searching ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a5020" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8a5020" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* 統計チップ（本棚ホームのみ） */}
          {!isDetailView && bottomTab === 'shelf' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
              {([
                { label: '読了', count: readBooks.length },
                { label: '積読', count: tsundokuBooks.length },
                { label: 'ほしい', count: wishlistBooks.length },
              ]).map(s => (
                <div key={s.label} className="stat-chip">
                  <span style={{ color: 'var(--stat-num)', fontSize: '20px', fontWeight: 500, display: 'block' }}>
                    {s.count}
                  </span>
                  <span style={{ color: 'var(--stat-label)', fontSize: '11px', display: 'block', marginTop: '1px' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ソートバー（読了詳細ビューのみ） */}
        {view === 'read' && (
          <div style={{
            display: 'flex', gap: '6px', padding: '8px 16px',
            overflowX: 'auto', borderTop: '1px solid rgba(200,122,48,0.2)',
          }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`nav-tab ${sortKey === opt.key ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', whiteSpace: 'nowrap' }}
                onClick={() => setSortKey(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      <main style={{ flex: 1, padding: '16px', maxWidth: '640px', width: '100%', margin: '0 auto' }}>
        {searching && (
          <div style={{ marginBottom: '16px' }}>
            {searchQuery.trim() === '' ? (
              <p style={{ color: 'var(--ink-light)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>タイトルや著者名を入力してください</p>
            ) : searchResults.length === 0 ? (
              <p style={{ color: 'var(--ink-light)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>見つかりませんでした</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map(book => (
                  <button
                    key={book.id}
                    onClick={() => { setDetailBook(book); setSearching(false); setSearchQuery(''); }}
                    style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '10px', background: '#fff8f0', border: '1px solid var(--card-border)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    {book.coverUrl ? (
                      <img src={book.coverUrl} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} alt="" />
                    ) : (
                      <div style={{ width: '40px', height: '56px', borderRadius: '3px', flexShrink: 0, background: 'var(--add-bg)', border: '1px solid var(--add-border)' }} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: 'var(--ink)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--ink-mid)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</p>
                      <p style={{ fontSize: '11px', color: 'var(--ink-light)', margin: 0 }}>{statusLabel(book.status)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {bottomTab === 'home' && !searching && (
          <HomeView
            books={books}
            onBookClick={setDetailBook}
            onAddReading={() => setAddModalStatus('reading')}
            onUpdateBook={handleUpdate}
          />
        )}

        {bottomTab === 'shelf' && !searching && (
          <>
            {showSection('reading') && (
              <ShelfSection
                label="読書中" accentColor="#4a8a6a"
                books={readingBooks}
                onBookClick={setDetailBook}
                onAddClick={() => setAddModalStatus('reading')}
                onMoreClick={() => setView('reading')}
                preview={!isDetailView}
                showBadge
              />
            )}
            {showSection('read') && (
              <ShelfSection
                label="読了" accentColor="#c87a30"
                books={readBooks}
                onBookClick={setDetailBook}
                onAddClick={() => setAddModalStatus('read')}
                onMoreClick={() => setView('read')}
                preview={!isDetailView}
                groupByAuthor={isDetailView && sortKey === 'author'}
              />
            )}
            {showSection('tsundoku') && (
              <ShelfSection
                label="積読" accentColor="#8a6840"
                books={tsundokuBooks}
                onBookClick={setDetailBook}
                onAddClick={() => setAddModalStatus('tsundoku')}
                onMoreClick={() => setView('tsundoku')}
                preview={!isDetailView}
                showBadge
              />
            )}
            {showSection('wishlist') && (
              <ShelfSection
                label="ほしい" accentColor="#6a7a40"
                books={wishlistBooks}
                onBookClick={setDetailBook}
                onAddClick={() => setAddModalStatus('wishlist')}
                onMoreClick={() => setView('wishlist')}
                preview={!isDetailView}
                showBadge
              />
            )}
          </>
        )}

        {bottomTab === 'stats' && (
          <StatsView books={books} />
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${bottomTab === 'home' ? 'active' : ''}`}
          onClick={() => { setBottomTab('home'); setView('home'); }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={bottomTab === 'home' ? 'var(--tab-active)' : 'var(--tab-inactive)'} strokeWidth="1.8">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="bottom-nav-label">ホーム</span>
          {bottomTab === 'home' && (
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--tab-active)' }} />
          )}
        </button>
        <button
          className={`bottom-nav-item ${bottomTab === 'shelf' ? 'active' : ''}`}
          onClick={() => { setBottomTab('shelf'); setView('home'); }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={bottomTab === 'shelf' ? 'var(--tab-active)' : 'var(--tab-inactive)'} strokeWidth="1.8">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className="bottom-nav-label">本棚</span>
          {bottomTab === 'shelf' && (
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--tab-active)' }} />
          )}
        </button>
        <button
          className={`bottom-nav-item ${bottomTab === 'stats' ? 'active' : ''}`}
          onClick={() => setBottomTab('stats')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={bottomTab === 'stats' ? 'var(--tab-active)' : 'var(--tab-inactive)'} strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="bottom-nav-label">統計</span>
          {bottomTab === 'stats' && (
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--tab-active)' }} />
          )}
        </button>
      </nav>

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

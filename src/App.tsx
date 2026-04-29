import { useState } from 'react';
import type { Book, BookStatus } from './types';
import { ShelfSection } from './components/ShelfSection';
import { AddBookModal } from './components/AddBookModal';
import { BookDetailModal } from './components/BookDetailModal';
import { loadBooks, addBook, updateBook, deleteBook } from './store';
import './index.css';

type SortKey = 'addedAt' | 'readAt' | 'author' | 'series';
type View = 'home' | BookStatus;
type BottomTab = 'shelf' | 'stats';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'readAt', label: '読んだ順' },
  { key: 'author', label: '著者順' },
  { key: 'series', label: 'シリーズ順' },
  { key: 'addedAt', label: '追加順' },
];

const HOME_TABS = ['すべて', '読了', '積ん読', 'ほしい'] as const;
type HomeTab = typeof HOME_TABS[number];

const SECTION_META: Record<BookStatus, { label: string; color: string; homeTab: HomeTab }> = {
  read:     { label: '読了',   color: '#c87a30', homeTab: '読了' },
  tsundoku: { label: '積ん読', color: '#8a6840', homeTab: '積ん読' },
  wishlist: { label: 'ほしい', color: '#6a7a40', homeTab: 'ほしい' },
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
  const [homeTab, setHomeTab] = useState<HomeTab>('すべて');
  const [bottomTab, setBottomTab] = useState<BottomTab>('shelf');
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
  const currentMeta = isDetailView ? SECTION_META[view as BookStatus] : null;

  const showSection = (status: BookStatus) => {
    if (!isDetailView) {
      const meta = SECTION_META[status];
      return homeTab === 'すべて' || homeTab === meta.homeTab;
    }
    return view === status;
  };

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
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--stat-label)', fontSize: '15px',
                  fontFamily: "'Kaisei Tokumin', Georgia, serif",
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                ‹ 戻る
              </button>
            ) : (
              <span style={{
                color: '#f5e6cc', fontSize: '22px', fontWeight: 500,
                fontFamily: "'Kaisei Tokumin', Georgia, serif",
              }}>
                本棚
              </span>
            )}
            {isDetailView && (
              <span style={{
                color: currentMeta!.color, fontSize: '18px',
                fontFamily: "'Kaisei Tokumin', Georgia, serif",
              }}>
                {currentMeta!.label}
              </span>
            )}
            <button
              onClick={() => setAddModalStatus(isDetailView ? (view as BookStatus) : 'read')}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#5a3518', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a070" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          {/* 統計チップ（ホームのみ） */}
          {!isDetailView && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
              {([
                { label: '読了', count: readBooks.length },
                { label: '積ん読', count: tsundokuBooks.length },
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

        {/* タブバー（ホームのみ） */}
        {!isDetailView && (
          <div className="tab-bar">
            {HOME_TABS.map(tab => (
              <button
                key={tab}
                className={`tab-item ${homeTab === tab ? 'active' : ''}`}
                onClick={() => setHomeTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ソートバー（読了詳細ビューのみ） */}
        {view === 'read' && (
          <div style={{
            display: 'flex', gap: '6px', padding: '8px 16px',
            overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)',
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
        {bottomTab === 'shelf' && (
          <>
            {showSection('read') && (
              <ShelfSection
                label="読了" accentColor="#c87a30"
                books={readBooks}
                onBookClick={setDetailBook}
                onAddClick={() => setAddModalStatus('read')}
                onMoreClick={() => setView('read')}
                preview={!isDetailView}
              />
            )}
            {showSection('tsundoku') && (
              <ShelfSection
                label="積ん読" accentColor="#8a6840"
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
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>📊</p>
            <p style={{ color: 'var(--ink-light)', fontSize: '14px' }}>統計機能は近日公開予定</p>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '読了した本', value: `${readBooks.length}冊`, color: '#c87a30' },
                { label: '積ん読', value: `${tsundokuBooks.length}冊`, color: '#8a6840' },
                { label: 'ほしい本', value: `${wishlistBooks.length}冊`, color: '#6a7a40' },
                { label: '合計登録数', value: `${books.length}冊`, color: 'var(--ink-mid)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--card-bg)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  <span style={{ color: 'var(--ink-mid)', fontSize: '15px' }}>{s.label}</span>
                  <span style={{ color: s.color, fontSize: '22px', fontWeight: 500 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="bottom-nav">
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
      {/* 詳細画面（position:fixed でフルスクリーン） */}
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

import { useState } from 'react';
import type { Book } from '../types';

const COVER_COLORS = [
  ['#7b3f2a', '#5a2a18'], ['#2e4a7a', '#1a2e58'], ['#3a6b4a', '#234a30'],
  ['#6a2a5a', '#481840'], ['#7a5a2a', '#584018'], ['#4a3a7a', '#2e2458'],
];
function getCoverColor(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

interface Props {
  books: Book[];
  onBookClick: (book: Book) => void;
  onAddReading: () => void;
  onUpdateBook: (book: Book) => void;
}

function BookCoverSmall({ book, width, height, borderRadius }: { book: Book; width: number; height: number; borderRadius: string }) {
  const [dark, light] = getCoverColor(book.title);
  return (
    <div style={{
      width, height, borderRadius,
      flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: book.coverUrl ? undefined : `linear-gradient(145deg, ${light}, ${dark})`,
      boxShadow: '2px 3px 8px rgba(0,0,0,0.3)',
    }}>
      {book.coverUrl
        ? <img src={book.coverUrl} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', zIndex: 1 }}>
            <p style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.4, margin: 0 }}>{book.title}</p>
          </div>
        )
      }
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px', background: 'rgba(0,0,0,0.35)', zIndex: 2 }} />
      <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 2 }} />
    </div>
  );
}

function SectionTitle({ dot, label }: { dot: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <span style={{ fontSize: '11px', color: '#8a6040', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
        {label}
      </span>
    </div>
  );
}

export function HomeView({ books, onBookClick, onAddReading, onUpdateBook }: Props) {
  const readingBooks = books.filter(b => b.status === 'reading');
  const tsundokuBooks = books.filter(b => b.status === 'tsundoku');
  const readCount = books.filter(b => b.status === 'read').length;

  const currentBook = readingBooks[0] ?? null;
  const [editingPage, setEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState(String(currentBook?.currentPage ?? ''));

  const progress = currentBook?.pageCount && currentBook?.currentPage
    ? Math.min(100, Math.round((currentBook.currentPage / currentBook.pageCount) * 100))
    : null;

  const handlePageSave = () => {
    if (!currentBook) return;
    const n = Number(pageInput);
    if (!isNaN(n) && n >= 0) {
      onUpdateBook({ ...currentBook, currentPage: n });
    }
    setEditingPage(false);
  };

  return (
    <div style={{ paddingBottom: '24px' }}>
      {/* 統計チップ */}
      <div style={{ display: 'flex', gap: '10px', padding: '0 0 20px' }}>
        {[
          { label: '読書中', count: readingBooks.length, color: '#4a8a6a' },
          { label: '読了',   count: readCount,           color: '#c87a30' },
          { label: '積読',   count: tsundokuBooks.length, color: '#8a6840' },
        ].map(s => (
          <div key={s.label} style={{ background: '#e8d8c0', borderRadius: '16px', padding: '10px 0', flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: 500, color: s.color, display: 'block' }}>{s.count}</span>
            <span style={{ fontSize: '11px', color: '#8a6040', display: 'block', marginTop: '2px', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* いま読んでいる本 */}
      <section style={{ marginBottom: '24px' }}>
        <SectionTitle dot="#c87a30" label="いま読んでいる本" />

        {currentBook ? (
          <div style={{
            background: '#2a1808',
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.01) 20px, rgba(255,255,255,0.01) 21px)',
            borderRadius: '16px', padding: '20px', marginBottom: '8px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div onClick={() => onBookClick(currentBook)} style={{ cursor: 'pointer' }}>
                <BookCoverSmall book={currentBook} width={100} height={150} borderRadius="4px 10px 10px 4px" />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '17px', fontWeight: 500, color: '#f5e6cc', fontFamily: "'Kaisei Tokumin', Georgia, serif", lineHeight: 1.4, margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                  {currentBook.title}
                </p>
                <p style={{ fontSize: '13px', color: '#c8a070', margin: '0 0 12px' }}>{currentBook.author}</p>

                {progress !== null ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#9a7050' }}>進捗</span>
                      <span style={{ fontSize: '18px', fontWeight: 500, color: '#f5c87a' }}>{progress}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '6px', background: 'linear-gradient(90deg, #c87a30, #f5c87a)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: '#7a5a40', margin: '5px 0 0' }}>
                      {currentBook.currentPage} / {currentBook.pageCount} ページ
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: '11px', color: '#7a5a40', margin: '0 0 8px' }}>ページ数未設定</p>
                )}

                {editingPage ? (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', alignItems: 'center' }}>
                    <input
                      autoFocus
                      type="number"
                      value={pageInput}
                      onChange={e => setPageInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePageSave()}
                      className="modal-input"
                      style={{ width: '80px', fontSize: '13px', padding: '4px 8px' }}
                      min={0}
                      max={currentBook.pageCount}
                    />
                    <span style={{ fontSize: '12px', color: '#7a5a40' }}>ページ</span>
                    <button onClick={handlePageSave} style={{ background: 'rgba(245,200,122,0.2)', border: '0.5px solid rgba(245,200,122,0.4)', borderRadius: '10px', padding: '4px 10px', fontSize: '12px', color: '#f5c87a', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>保存</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setPageInput(String(currentBook.currentPage ?? '')); setEditingPage(true); }}
                    style={{ marginTop: '12px', background: 'rgba(245,200,122,0.15)', border: '0.5px solid rgba(245,200,122,0.3)', borderRadius: '12px', padding: '7px 14px', fontSize: '12px', color: '#f5c87a', width: '100%', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}
                  >
                    進捗を更新する
                  </button>
                )}
              </div>
            </div>

            {/* 複数冊読書中の場合 */}
            {readingBooks.length > 1 && (
              <div style={{ marginTop: '12px', borderTop: '0.5px solid rgba(245,200,122,0.15)', paddingTop: '12px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                {readingBooks.slice(1).map(b => (
                  <div key={b.id} onClick={() => onBookClick(b)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <BookCoverSmall book={b} width={52} height={78} borderRadius="3px 6px 6px 3px" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: '#2a1808', borderRadius: '16px', padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ color: '#7a5a40', fontSize: '13px', margin: '0 0 12px', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>読書中の本がありません</p>
            <button onClick={onAddReading} className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
              本を追加する
            </button>
          </div>
        )}
      </section>

      {/* 次に読む候補 */}
      {tsundokuBooks.length > 0 && (
        <section>
          <SectionTitle dot="#8a6840" label="次に読む候補" />
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' } as React.CSSProperties}>
            {tsundokuBooks.map(book => (
              <div key={book.id} onClick={() => onBookClick(book)} style={{ cursor: 'pointer', flexShrink: 0, width: '90px' }}>
                <BookCoverSmall book={book} width={90} height={134} borderRadius="3px 8px 8px 3px" />
                <p style={{ fontSize: '10px', color: '#6a4020', marginTop: '5px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
                  {book.title}
                </p>
                <p style={{ fontSize: '9px', color: '#a08060', textAlign: 'center', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {book.author}
                </p>
                <span style={{ fontSize: '8px', background: '#faeeda', color: '#633806', borderRadius: '6px', padding: '1px 5px', marginTop: '3px', display: 'block', textAlign: 'center' }}>
                  積読
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

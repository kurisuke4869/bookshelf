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
            position: 'relative',
            background: 'linear-gradient(135deg, #5a3820 0%, #3a2440 60%, #4a2c18 100%)',
            borderRadius: '4px',
            padding: '22px',
            border: '1px solid rgba(245,200,122,0.55)',
            boxShadow: 'inset 0 0 0 4px #4a2e18, inset 0 0 0 5.5px rgba(245,200,122,0.2), 0 8px 28px rgba(0,0,0,0.4)',
            marginBottom: '8px',
          }}>
            {/* 光沢 */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent)', borderRadius: '4px 4px 0 0', pointerEvents: 'none', zIndex: 1 }} />

            {/* 菱形コーナー */}
            {[{ top: 6, left: 6 }, { top: 6, right: 6 }, { bottom: 6, left: 6 }, { bottom: 6, right: 6 }].map((pos, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 18 18" style={{ position: 'absolute', zIndex: 1, ...pos }}>
                <polygon points="9,0 18,9 9,18 0,9" fill="#f5c87a" opacity="0.75" />
                <polygon points="9,4 14,9 9,14 4,9" fill="#4a2e18" />
                <circle cx="9" cy="9" r="1.5" fill="#f5c87a" opacity="0.9" />
              </svg>
            ))}

            {/* 上部矢印装飾 */}
            <svg style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', width: 48, height: 12, zIndex: 1 }} viewBox="0 0 48 12">
              <path d="M0,6 L18,6 L24,0 L30,6 L48,6" fill="none" stroke="#f5c87a" strokeWidth="1" opacity="0.7" />
              <circle cx="24" cy="0" r="2" fill="#f5c87a" opacity="0.7" />
            </svg>

            {/* 下部矢印装飾 */}
            <svg style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 48, height: 12, zIndex: 1 }} viewBox="0 0 48 12">
              <path d="M0,6 L18,6 L24,12 L30,6 L48,6" fill="none" stroke="#f5c87a" strokeWidth="1" opacity="0.7" />
              <circle cx="24" cy="12" r="2" fill="#f5c87a" opacity="0.7" />
            </svg>

            {/* コンテンツ */}
            <div style={{ display: 'flex', gap: '12px', padding: '4px 8px', position: 'relative', zIndex: 2 }}>
              <div onClick={() => onBookClick(currentBook)} style={{ cursor: 'pointer' }}>
                <BookCoverSmall book={currentBook} width={78} height={116} borderRadius="4px 10px 10px 4px" />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff8ee', fontFamily: "'Kaisei Tokumin', Georgia, serif", lineHeight: 1.4, margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                  {currentBook.title}
                </p>
                <p style={{ fontSize: '11px', color: '#f0d0a0', margin: '0 0 8px' }}>{currentBook.author}</p>

                {progress !== null ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#d4a870' }}>進捗</span>
                      <span style={{ fontSize: '15px', fontWeight: 500, color: '#f5c87a' }}>{progress}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '3px', height: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '5px', background: 'linear-gradient(90deg, #c87a30, #f5c87a)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                    </div>
                    <p style={{ fontSize: '10px', color: '#c8a070', margin: '3px 0 0' }}>
                      {currentBook.currentPage} / {currentBook.pageCount} ページ
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: '10px', color: '#c8a070', margin: '0 0 8px' }}>ページ数未設定</p>
                )}

                {editingPage ? (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
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
                    <span style={{ fontSize: '12px', color: '#c8a070' }}>ページ</span>
                    <button onClick={handlePageSave} style={{ background: '#c87a30', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 500, color: '#fff8ee', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>保存</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setPageInput(String(currentBook.currentPage ?? '')); setEditingPage(true); }}
                    style={{ marginTop: '8px', background: '#c87a30', border: 'none', borderRadius: '6px', padding: '7px', fontSize: '11px', fontWeight: 500, color: '#fff8ee', width: '100%', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}
                  >
                    進捗を更新する
                  </button>
                )}
              </div>
            </div>

            {/* 複数冊読書中の場合 */}
            {readingBooks.length > 1 && (
              <div style={{ marginTop: '12px', borderTop: '0.5px solid rgba(245,200,122,0.15)', paddingTop: '12px', display: 'flex', gap: '10px', overflowX: 'auto', position: 'relative', zIndex: 2 }}>
                {readingBooks.slice(1).map(b => (
                  <div key={b.id} onClick={() => onBookClick(b)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <BookCoverSmall book={b} width={52} height={78} borderRadius="3px 6px 6px 3px" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--bg)', borderRadius: '16px', padding: '32px 16px', textAlign: 'center' }}>
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
          <div style={{
            background: '#5c3a1e',
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 99px, rgba(0,0,0,0.07) 99px, rgba(0,0,0,0.07) 100px)',
            borderRadius: '10px',
            overflow: 'hidden',
            padding: '12px 12px 0',
          }}>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '0', scrollbarWidth: 'none' } as React.CSSProperties}>
              {tsundokuBooks.map(book => (
                <div key={book.id} onClick={() => onBookClick(book)} style={{ cursor: 'pointer', flexShrink: 0, width: '72px' }}>
                  <BookCoverSmall book={book} width={72} height={108} borderRadius="4px 8px 8px 4px" />
                  <p style={{ fontSize: '9px', color: '#f5e6cc', marginTop: '5px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Kaisei Tokumin', Georgia, serif", lineHeight: 1.3 }}>
                    {book.title}
                  </p>
                </div>
              ))}
            </div>
            {/* 棚板 */}
            <div style={{ height: '14px', background: 'var(--shelf-board)', borderTop: '2px solid var(--shelf-board-top)' }} />
          </div>
        </section>
      )}
    </div>
  );
}

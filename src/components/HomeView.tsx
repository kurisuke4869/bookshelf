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
}

export function HomeView({ books, onBookClick, onAddReading }: Props) {
  const readingBooks = books.filter(b => b.status === 'reading');
  const readCount = books.filter(b => b.status === 'read').length;
  const tsundokuCount = books.filter(b => b.status === 'tsundoku').length;

  return (
    <div style={{ paddingBottom: '24px' }}>
      {/* サマリー */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: '読書中', count: readingBooks.length, color: '#4a8a6a' },
          { label: '読了', count: readCount, color: '#c87a30' },
          { label: '積読', count: tsundokuCount, color: '#8a6840' },
        ].map(s => (
          <div key={s.label} className="stat-chip">
            <span style={{ color: s.color, fontSize: '20px', fontWeight: 500, display: 'block' }}>{s.count}</span>
            <span style={{ color: 'var(--stat-label)', fontSize: '11px', display: 'block', marginTop: '1px' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 読書中セクション */}
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a8a6a' }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--section-title)', letterSpacing: '0.5px', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
            読書中
          </span>
          <span style={{ fontSize: '12px', color: 'var(--count-text)', background: 'var(--count-bg)', borderRadius: '10px', padding: '2px 8px' }}>
            {readingBooks.length}冊
          </span>
        </div>
        <button className="section-add-btn" style={{ background: '#4a8a6a' }} onClick={onAddReading}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          追加
        </button>
      </div>

      {readingBooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-light)', fontSize: '13px', background: 'var(--add-bg)', borderRadius: '12px', border: '1px dashed var(--add-border)' }}>
          読書中の本がありません
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {readingBooks.map(book => {
            const [dark, light] = getCoverColor(book.title);
            const progress = book.pageCount && book.currentPage
              ? Math.min(100, Math.round((book.currentPage / book.pageCount) * 100))
              : null;
            return (
              <button
                key={book.id}
                onClick={() => onBookClick(book)}
                style={{
                  display: 'flex', gap: '14px', padding: '14px',
                  borderRadius: '12px', background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                {/* 表紙 */}
                <div style={{
                  width: '56px', height: '84px', borderRadius: '3px 6px 6px 3px',
                  flexShrink: 0, position: 'relative', overflow: 'hidden',
                  background: book.coverUrl ? undefined : `linear-gradient(145deg, ${light}, ${dark})`,
                  boxShadow: '2px 3px 8px rgba(0,0,0,0.25)',
                }}>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                      <p style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.4, margin: 0 }}>{book.title}</p>
                    </div>
                  )}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'rgba(0,0,0,0.3)', zIndex: 2 }} />
                </div>

                {/* 情報 */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                  <p style={{ fontSize: '15px', color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
                    {book.title}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--ink-mid)', margin: 0 }}>{book.author}</p>

                  {/* 進捗バー */}
                  {progress !== null ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--ink-light)' }}>
                          {book.currentPage}ページ / {book.pageCount}ページ
                        </span>
                        <span style={{ fontSize: '11px', color: '#4a8a6a', fontWeight: 500 }}>{progress}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%`, background: '#4a8a6a' }} />
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: 'var(--ink-light)', margin: 0 }}>ページ数未設定</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

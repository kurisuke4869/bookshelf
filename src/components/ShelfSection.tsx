import type { Book } from '../types';
import { BookCard } from './BookCard';

interface Props {
  label: string;
  accentColor: string;
  books: Book[];
  onBookClick: (book: Book) => void;
  onAddClick: () => void;
  onMoreClick?: () => void;
  preview?: boolean;
  showBadge?: boolean;
}

const PREVIEW_COUNT = 7;

export function ShelfSection({ label, accentColor, books, onBookClick, onAddClick, onMoreClick, preview = false, showBadge = false }: Props) {
  const displayBooks = preview ? books.slice(0, PREVIEW_COUNT) : books;
  const hasMore = preview && books.length > PREVIEW_COUNT;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* セクションヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--section-title)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
            {label}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--count-text)', background: 'var(--count-bg)', borderRadius: '10px', padding: '2px 8px' }}>
            {books.length}冊
          </span>
        </div>
        <button className="section-add-btn" style={{ background: accentColor }} onClick={onAddClick}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          追加
        </button>
      </div>

      {/* グリッド */}
      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-light)', fontSize: '13px', background: 'var(--add-bg)', borderRadius: '8px', border: '1px dashed var(--add-border)' }}>
          まだ本がありません
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {displayBooks.map(book => (
              <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} showBadge={showBadge} />
            ))}
            {hasMore ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={onMoreClick}>
                <div className="add-placeholder">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', color: 'var(--add-border)' }}>+</div>
                    <div style={{ fontSize: '9px', color: 'var(--ink-light)', marginTop: '2px' }}>{books.length - PREVIEW_COUNT}冊</div>
                  </div>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--ink-light)', margin: 0 }}>もっと見る</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={onAddClick}>
                <div className="add-placeholder">
                  <span style={{ fontSize: '22px', color: 'var(--add-border)', lineHeight: 1 }}>+</span>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--ink-light)', margin: 0 }}>追加する</p>
              </div>
            )}
          </div>
          {preview && books.length > PREVIEW_COUNT && (
            <button onClick={onMoreClick} style={{ display: 'block', width: '100%', marginTop: '8px', textAlign: 'center', fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
              すべて見る ({books.length}冊) ›
            </button>
          )}
        </>
      )}
    </div>
  );
}

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
  groupByAuthor?: boolean;
}

const PREVIEW_COUNT = 7;

function groupBooks(books: Book[]): { author: string; books: Book[] }[] {
  const map = new Map<string, Book[]>();
  for (const b of books) {
    const a = b.author ?? '不明';
    if (!map.has(a)) map.set(a, []);
    map.get(a)!.push(b);
  }
  return Array.from(map.entries()).map(([author, books]) => ({ author, books }));
}

export function ShelfSection({ label, accentColor, books, onBookClick, onAddClick, onMoreClick, preview = false, showBadge = false, groupByAuthor = false }: Props) {
  const displayBooks = preview ? books.slice(0, PREVIEW_COUNT) : books;
  const hasMore = preview && books.length > PREVIEW_COUNT;
  const groups = groupByAuthor ? groupBooks(displayBooks) : null;

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
      ) : groupByAuthor && groups ? (
        <div className="shelf-grid-wrap">
          {(() => {
            const COLS = 4;
            const allItems: ({ type: 'divider'; author: string; count: number } | { type: 'book'; book: Book })[] = [];
            for (const { author, books: authorBooks } of groups) {
              allItems.push({ type: 'divider', author, count: authorBooks.length });
              for (const b of authorBooks) allItems.push({ type: 'book', book: b });
            }

            const rows: typeof allItems[] = [];
            for (let i = 0; i < allItems.length; i += COLS) {
              rows.push(allItems.slice(i, i + COLS));
            }

            return rows.map((row, ri) => (
              <div key={ri}>
                <div className="shelf-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {row.map((item, ci) =>
                    item.type === 'divider' ? (
                      <div key={`divider-${item.author}-${ri}-${ci}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="divider">
                          <div className="divider-line" />
                          <span className="divider-author">{item.author}</span>
                          <span className="divider-count">{item.count}冊</span>
                        </div>
                        <span className="divider-label">{item.author}</span>
                      </div>
                    ) : (
                      <BookCard key={item.book.id} book={item.book} onClick={() => onBookClick(item.book)} showBadge={showBadge} />
                    )
                  )}
                </div>
                <div className="shelf-board" />
              </div>
            ));
          })()}
          {preview && books.length > PREVIEW_COUNT && (
            <button onClick={onMoreClick} style={{ display: 'block', width: '100%', marginTop: '8px', textAlign: 'center', fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
              すべて見る ({books.length}冊) ›
            </button>
          )}
        </div>
      ) : (
        <div className="shelf-grid-wrap">
          {(() => {
            const COLS = 4;
            const allItems: (Book | 'add' | 'more')[] = [...displayBooks];
            if (hasMore) allItems.push('more');
            else allItems.push('add');

            const rows: typeof allItems[] = [];
            for (let i = 0; i < allItems.length; i += COLS) {
              rows.push(allItems.slice(i, i + COLS));
            }

            return rows.map((row, ri) => (
              <div key={ri}>
                <div className="shelf-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {row.map((item, ci) =>
                    item === 'more' ? (
                      <div key="more" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={onMoreClick}>
                        <div className="add-placeholder">
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', color: 'var(--add-border)' }}>+</div>
                            <div style={{ fontSize: '9px', color: 'var(--ink-light)', marginTop: '2px' }}>{books.length - PREVIEW_COUNT}冊</div>
                          </div>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--ink-light)', margin: 0 }}>もっと見る</p>
                      </div>
                    ) : item === 'add' ? (
                      <div key="add" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={onAddClick}>
                        <div className="add-placeholder">
                          <span style={{ fontSize: '22px', color: 'var(--add-border)', lineHeight: 1 }}>+</span>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--ink-light)', margin: 0 }}>追加する</p>
                      </div>
                    ) : (
                      <BookCard key={(item as Book).id} book={item as Book} onClick={() => onBookClick(item as Book)} showBadge={showBadge} />
                    )
                  )}
                </div>
                <div className="shelf-board" />
              </div>
            ));
          })()}
          {preview && books.length > PREVIEW_COUNT && (
            <button onClick={onMoreClick} style={{ display: 'block', width: '100%', marginTop: '8px', textAlign: 'center', fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
              すべて見る ({books.length}冊) ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}

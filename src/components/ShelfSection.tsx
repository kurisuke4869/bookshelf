import type { Book } from '../types';
import { BookCard } from './BookCard';

interface Props {
  label: string;
  books: Book[];
  onBookClick: (book: Book) => void;
  onAddClick: () => void;
  onMoreClick?: () => void;
  emptyMessage: string;
  preview?: boolean;
}

const PREVIEW_COUNT = 6;

export function ShelfSection({ label, books, onBookClick, onAddClick, onMoreClick, emptyMessage, preview = false }: Props) {
  const displayBooks = preview ? books.slice(0, PREVIEW_COUNT) : books;
  const hasMore = preview && books.length > PREVIEW_COUNT;

  return (
    <div className="mb-10">
      {/* 棚本体（栞ラベルを上に重ねる） */}
      <div className="relative mx-2">

        {/* 栞ラベル＋追加ボタン */}
        <div className="flex items-end justify-between mb-0 px-1">
          {/* 栞の形：下部が三角にくぼんでいる */}
          <div
            className="relative flex items-center gap-3 px-5 pt-3 pb-4"
            style={{
              background: 'linear-gradient(160deg, var(--wood-highlight) 0%, var(--wood-mid) 100%)',
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 83% 70%, 0 70%)',
              minWidth: '140px',
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              className="font-normal m-0 tracking-wider"
              style={{
                fontFamily: "'Kaisei Tokumin', Georgia, serif",
                fontSize: '1.2rem',
                color: 'var(--paper)',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                letterSpacing: '0.1em',
              }}
            >
              {label}
            </h2>
            <span
              style={{
                fontFamily: "'Kaisei Tokumin', Georgia, serif",
                fontSize: '0.85rem',
                color: 'rgba(245,234,216,0.7)',
              }}
            >
              {books.length}冊
            </span>
          </div>

          <button className="btn-wood text-sm px-4 py-2 rounded mb-1" onClick={onAddClick}>
            ＋ 追加
          </button>
        </div>

        {/* 棚の中身 */}
        <div
          className="rounded-tr-md rounded-b-md"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 100%)',
            border: '1px solid rgba(122,74,40,0.25)',
            borderTop: 'none',
          }}
        >
          <div className="px-4 pt-4 pb-2 min-h-32">
            {books.length === 0 ? (
              <div
                className="flex items-center justify-center h-24"
                style={{
                  fontFamily: "'Kaisei Tokumin', Georgia, serif",
                  fontSize: '0.95rem',
                  color: 'rgba(58,32,16,0.3)',
                }}
              >
                {emptyMessage}
              </div>
            ) : (
              <div
                className={preview ? 'flex gap-3 overflow-x-auto pb-1' : 'flex flex-wrap gap-3'}
                style={preview ? { scrollbarWidth: 'none' } : undefined}
              >
                {displayBooks.map(book => (
                  <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
                ))}
                {hasMore && (
                  <button
                    className="book-card flex flex-col items-center justify-center flex-shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded"
                    style={{
                      background: 'rgba(122,74,40,0.08)',
                      border: '1px dashed rgba(122,74,40,0.3)',
                      color: 'var(--ink-light)',
                      fontFamily: "'Kaisei Tokumin', Georgia, serif",
                    }}
                    onClick={onMoreClick}
                  >
                    <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>＋</span>
                    <span style={{ fontSize: '0.6rem', marginTop: '4px', opacity: 0.5 }}>
                      {books.length - PREVIEW_COUNT}冊
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* もっと見るボタン */}
          {preview && books.length > 0 && (
            <button
              className="w-full text-center py-2 transition-opacity hover:opacity-100"
              style={{
                fontFamily: "'Kaisei Tokumin', Georgia, serif",
                fontSize: '0.9rem',
                color: 'var(--wood-mid)',
                opacity: 0.7,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
              onClick={onMoreClick}
            >
              すべて見る ({books.length}冊) ›
            </button>
          )}

          {/* 棚板 */}
          <div className="shelf h-5 rounded-b-sm" />
        </div>
      </div>
    </div>
  );
}

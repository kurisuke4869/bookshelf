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
    <div className="mb-8">
      {/* 棚ラベル */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="shelf-label text-base sm:text-lg font-normal tracking-widest uppercase">
            {label}
          </h2>
          <span className="shelf-label text-sm opacity-60">({books.length})</span>
        </div>
        <button className="btn-wood text-sm px-3 py-1.5 rounded" onClick={onAddClick}>
          ＋ 追加
        </button>
      </div>

      {/* 棚本体 */}
      <div
        className="relative mx-2 rounded"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 100%)',
          border: '1px solid rgba(0,0,0,0.4)',
          borderBottom: 'none',
        }}
      >
        <div className="px-4 pt-4 pb-2 min-h-32">
          {books.length === 0 ? (
            <div
              className="flex items-center justify-center h-24"
              style={{ color: 'rgba(245,234,216,0.3)', fontFamily: 'Georgia, serif', fontSize: '0.8rem' }}
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
                    background: 'rgba(245,234,216,0.06)',
                    border: '1px dashed rgba(201,168,76,0.4)',
                    color: 'var(--paper-dark)',
                    fontFamily: 'Georgia, serif',
                  }}
                  onClick={onMoreClick}
                >
                  <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>＋</span>
                  <span style={{ fontSize: '0.5rem', marginTop: '4px', opacity: 0.6 }}>
                    {books.length - PREVIEW_COUNT}冊
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* もっと見るボタン（プレビュー時のみ、本がある場合） */}
        {preview && books.length > 0 && (
          <button
            className="w-full text-center py-2 text-xs transition-opacity hover:opacity-100"
            style={{
              color: 'var(--gold)',
              opacity: 0.6,
              fontFamily: 'Georgia, serif',
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
        <div className="shelf h-4 mx-0" />
      </div>
    </div>
  );
}

import type { Book } from '../types';

const COVER_COLORS = [
  ['#7b3f2a', '#5a2a18'],
  ['#2e4a7a', '#1a2e58'],
  ['#3a6b4a', '#234a30'],
  ['#6a2a5a', '#481840'],
  ['#7a5a2a', '#584018'],
  ['#4a3a7a', '#2e2458'],
  ['#3a6a6a', '#224848'],
  ['#5a7a3a', '#3a5822'],
];

function getCoverColor(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  read:     { bg: 'var(--badge-read-bg)',     color: 'var(--badge-read-text)',     label: '読了' },
  tsundoku: { bg: 'var(--badge-tsundoku-bg)', color: 'var(--badge-tsundoku-text)', label: '積ん読' },
  wishlist: { bg: 'var(--badge-wishlist-bg)', color: 'var(--badge-wishlist-text)', label: 'ほしい' },
};

interface Props {
  book: Book;
  onClick: () => void;
  showBadge?: boolean;
}

export function BookCard({ book, onClick, showBadge = false }: Props) {
  const [dark, light] = getCoverColor(book.title);
  const badge = STATUS_BADGE[book.status];

  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer"
      style={{ minWidth: 0 }}
      onClick={onClick}
    >
      {/* 表紙 */}
      <div
        className="book-cover-wrap w-full"
        style={{
          background: book.coverUrl
            ? undefined
            : `linear-gradient(145deg, ${light}, ${dark})`,
        }}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ borderRadius: '4px 8px 8px 4px' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full z-10 px-1">
            <p style={{
              fontSize: '0.5rem',
              color: 'rgba(255,255,255,0.92)',
              textAlign: 'center',
              lineHeight: 1.4,
              fontWeight: 500,
              wordBreak: 'break-all',
            }}>
              {book.title}
            </p>
            <p style={{
              fontSize: '0.4rem',
              color: 'rgba(255,255,255,0.6)',
              marginTop: '4px',
              textAlign: 'center',
            }}>
              {book.author}
            </p>
          </div>
        )}
      </div>

      {/* タイトル */}
      <p style={{
        fontSize: '10px',
        color: 'var(--ink-mid)',
        textAlign: 'center',
        lineHeight: 1.3,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {book.title}
      </p>

      {/* バッジ */}
      {showBadge ? (
        <span style={{
          fontSize: '9px',
          background: badge.bg,
          color: badge.color,
          borderRadius: '6px',
          padding: '1px 5px',
        }}>
          {badge.label}
        </span>
      ) : book.rating ? (
        <span style={{
          fontSize: '9px',
          background: 'var(--badge-read-bg)',
          color: 'var(--badge-read-text)',
          borderRadius: '6px',
          padding: '1px 5px',
        }}>
          {'★'} {book.rating.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}

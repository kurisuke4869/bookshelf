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

interface Props {
  book: Book;
  onClick: () => void;
  showBadge?: boolean;
}

export function BookCard({ book, onClick, showBadge = false }: Props) {
  const [dark, light] = getCoverColor(book.title);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: 0, cursor: 'pointer' }} onClick={onClick}>
      <div
        className="book-cover-wrap"
        style={{ background: book.coverUrl ? undefined : `linear-gradient(145deg, ${light}, ${dark})` }}
      >
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 6px', zIndex: 1 }}>
            <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.92)', textAlign: 'center', lineHeight: 1.4, fontWeight: 500, wordBreak: 'break-all', margin: 0 }}>{book.title}</p>
            <p style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', textAlign: 'center', margin: '4px 0 0' }}>{book.author}</p>
          </div>
        )}
      </div>

      <p style={{ fontSize: '10px', color: 'var(--ink-mid)', textAlign: 'center', lineHeight: 1.3, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
        {book.title}
      </p>

      {showBadge ? (
        <span style={{ fontSize: '9px', background: book.status === 'tsundoku' ? 'var(--badge-tsundoku-bg)' : 'var(--badge-wishlist-bg)', color: book.status === 'tsundoku' ? 'var(--badge-tsundoku-text)' : 'var(--badge-wishlist-text)', borderRadius: '6px', padding: '1px 5px' }}>
          {book.status === 'tsundoku' ? '積ん読' : 'ほしい'}
        </span>
      ) : book.rating ? (
        <span style={{ fontSize: '9px', background: 'var(--badge-read-bg)', color: 'var(--badge-read-text)', borderRadius: '6px', padding: '1px 5px' }}>
          ★ {book.rating.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}

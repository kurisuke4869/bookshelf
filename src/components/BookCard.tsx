import type { Book } from '../types';

const COVER_COLORS = [
  ['#8b1a1a', '#c0392b'],
  ['#1a4a8b', '#2980b9'],
  ['#1a6b2a', '#27ae60'],
  ['#6b1a6b', '#8e44ad'],
  ['#6b4a1a', '#d35400'],
  ['#1a5a6b', '#16a085'],
  ['#3d1a6b', '#2c3e50'],
  ['#6b1a3d', '#c0392b'],
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
}

export function BookCard({ book, onClick }: Props) {
  const [dark, light] = getCoverColor(book.title);

  return (
    <div className="book-card flex flex-col items-center" onClick={onClick}>
      <div
        className="book-cover w-16 h-24 sm:w-20 sm:h-28 flex flex-col items-center justify-center p-1"
        style={{
          background: book.coverUrl
            ? undefined
            : `linear-gradient(160deg, ${light} 0%, ${dark} 100%)`,
        }}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <div
              className="w-full border-t border-b mb-1"
              style={{ borderColor: 'rgba(255,255,255,0.3)', height: '1px' }}
            />
            <p
              className="text-center leading-tight"
              style={{
                fontSize: '0.5rem',
                color: 'rgba(255,255,255,0.9)',
                wordBreak: 'break-all',
                fontFamily: 'Georgia, serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {book.title}
            </p>
            <div
              className="w-full border-t mt-1"
              style={{ borderColor: 'rgba(255,255,255,0.3)', height: '1px' }}
            />
            <p
              className="text-center mt-1"
              style={{
                fontSize: '0.4rem',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Georgia, serif',
              }}
            >
              {book.author}
            </p>
          </>
        )}
      </div>
      {book.rating && (
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.45rem',
                color: i < book.rating! ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
              }}
            >
              ★
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

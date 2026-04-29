import { useState } from 'react';
import type { Book, BookStatus } from '../types';

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    publisher?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=12&printType=books`
  );
  const data = await res.json();
  return (data.items ?? []) as GoogleBook[];
}

function toBook(g: GoogleBook, status: BookStatus): Book {
  const v = g.volumeInfo;
  const isbn = v.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
    ?? v.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier;
  const cover = v.imageLinks?.thumbnail?.replace('http://', 'https://');
  return {
    id: crypto.randomUUID(),
    title: v.title,
    author: v.authors?.join(', ') ?? '不明',
    publisher: v.publisher,
    publishedDate: v.publishedDate,
    description: v.description,
    pageCount: v.pageCount,
    categories: v.categories,
    coverUrl: cover,
    isbn,
    status,
    addedAt: new Date().toISOString().slice(0, 10),
    readAt: status === 'read' ? new Date().toISOString().slice(0, 10) : undefined,
  };
}

interface Props {
  initialStatus: BookStatus;
  onAdd: (book: Book) => void;
  onClose: () => void;
}

export function AddBookModal({ initialStatus, onAdd, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<GoogleBook | null>(null);
  const [status, setStatus] = useState<BookStatus>(initialStatus);
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualSeries, setManualSeries] = useState('');
  const [manualSeriesIndex, setManualSeriesIndex] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const items = await searchGoogleBooks(query);
      setResults(items);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (manualMode) {
      if (!manualTitle.trim()) return;
      const book: Book = {
        id: crypto.randomUUID(),
        title: manualTitle.trim(),
        author: manualAuthor.trim() || '不明',
        series: manualSeries.trim() || undefined,
        seriesIndex: manualSeriesIndex ? Number(manualSeriesIndex) : undefined,
        status,
        addedAt: new Date().toISOString().slice(0, 10),
        readAt: status === 'read' ? new Date().toISOString().slice(0, 10) : undefined,
      };
      onAdd(book);
    } else if (selected) {
      onAdd(toBook(selected, status));
    }
  };

  const STATUS_OPTIONS: { key: BookStatus; label: string }[] = [
    { key: 'read', label: '読了' },
    { key: 'tsundoku', label: '積ん読' },
    { key: 'wishlist', label: 'ほしい' },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid var(--card-border)' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)', fontFamily: "'Kaisei Tokumin', Georgia, serif", fontWeight: 500 }}>本を追加</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--ink-light)', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* ステータス選択 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`nav-tab ${status === opt.key ? 'active' : ''}`}
                style={{ flex: 1, padding: '6px 4px', fontSize: '13px', borderRadius: '12px', textAlign: 'center' }}
                onClick={() => setStatus(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 検索 / 手動切り替え */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[{ label: 'タイトルで検索', manual: false }, { label: '手動で入力', manual: true }].map(opt => (
              <button
                key={opt.label}
                onClick={() => setManualMode(opt.manual)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 4px',
                  fontSize: '13px', color: 'var(--ink-mid)',
                  borderBottom: manualMode === opt.manual ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                  fontFamily: "'Kaisei Tokumin', Georgia, serif",
                  opacity: manualMode === opt.manual ? 1 : 0.5,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {!manualMode ? (
            <>
              {/* 検索バー */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="タイトル・著者名で検索..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="modal-input"
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px' }}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? '…' : '検索'}
                </button>
              </div>

              {/* 検索結果 */}
              {results.length > 0 && !selected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {results.map(g => (
                    <button
                      key={g.id}
                      style={{
                        display: 'flex', gap: '12px', padding: '10px', borderRadius: '8px', textAlign: 'left',
                        background: 'var(--bg)', border: '1px solid var(--card-border)', cursor: 'pointer', width: '100%',
                      }}
                      onClick={() => setSelected(g)}
                    >
                      {g.volumeInfo.imageLinks?.smallThumbnail ? (
                        <img
                          src={g.volumeInfo.imageLinks.smallThumbnail.replace('http://', 'https://')}
                          style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }}
                          alt=""
                        />
                      ) : (
                        <div style={{ width: '40px', height: '56px', borderRadius: '3px', flexShrink: 0, background: 'var(--add-bg)', border: '1px solid var(--add-border)' }} />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                        <p style={{ fontSize: '14px', color: 'var(--ink)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.volumeInfo.title}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--ink-mid)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.volumeInfo.authors?.join(', ') ?? '不明'}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--ink-light)', margin: 0 }}>
                          {g.volumeInfo.publishedDate?.slice(0, 4)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 選択済みの本 */}
              {selected && (
                <div style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', background: 'var(--bg)', border: '1.5px solid var(--accent)' }}>
                  {selected.volumeInfo.imageLinks?.thumbnail && (
                    <img
                      src={selected.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                      style={{ width: '52px', height: '74px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }}
                      alt=""
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                    <p style={{ fontSize: '14px', color: 'var(--ink)', margin: '0 0 4px' }}>{selected.volumeInfo.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--ink-mid)', margin: '0 0 6px' }}>{selected.volumeInfo.authors?.join(', ')}</p>
                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--ink-light)', textAlign: 'left', padding: 0, fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
                      ← 選び直す
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 手動入力フォーム */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'タイトル *', value: manualTitle, set: setManualTitle, placeholder: '本のタイトル', type: 'text' },
                { label: '著者', value: manualAuthor, set: setManualAuthor, placeholder: '著者名', type: 'text' },
                { label: 'シリーズ名', value: manualSeries, set: setManualSeries, placeholder: '（任意）', type: 'text' },
                { label: 'シリーズ巻数', value: manualSeriesIndex, set: setManualSeriesIndex, placeholder: '例：1', type: 'number' },
              ].map(field => (
                <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--ink-light)' }}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    className="modal-input"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 追加ボタン */}
          <button
            className="btn-primary"
            style={{
              padding: '12px', fontSize: '15px', borderRadius: '20px',
              opacity: (manualMode ? !manualTitle.trim() : !selected) ? 0.4 : 1,
            }}
            onClick={handleAdd}
            disabled={manualMode ? !manualTitle.trim() : !selected}
          >
            棚に追加する
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const handleSelect = (g: GoogleBook) => {
    setSelected(g);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, var(--paper) 0%, var(--paper-dark) 100%)',
          border: '2px solid var(--wood-mid)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.6)',
        }}
      >
        {/* ヘッダー */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}
        >
          <h2 className="shelf-label text-base font-normal">本を追加</h2>
          <button
            onClick={onClose}
            className="shelf-label text-lg opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* ステータス選択 */}
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`nav-tab flex items-center gap-1 text-xs px-3 py-1.5 rounded flex-1 justify-center ${status === opt.key ? 'active' : ''}`}
                onClick={() => setStatus(opt.key)}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* 検索 / 手動切り替え */}
          <div className="flex gap-2 text-xs" style={{ color: 'var(--paper-dark)' }}>
            <button
              className={`pb-1 ${!manualMode ? 'border-b border-current opacity-100' : 'opacity-40'}`}
              onClick={() => setManualMode(false)}
            >
              タイトルで検索
            </button>
            <button
              className={`pb-1 ${manualMode ? 'border-b border-current opacity-100' : 'opacity-40'}`}
              onClick={() => setManualMode(true)}
            >
              手動で入力
            </button>
          </div>

          {!manualMode ? (
            <>
              {/* 検索バー */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="タイトル・著者名で検索..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 rounded text-sm"
                  style={{
                    background: 'rgba(245,234,216,0.1)',
                    border: '1px solid rgba(201,168,76,0.4)',
                    color: 'var(--paper)',
                    fontFamily: 'Georgia, serif',
                    outline: 'none',
                  }}
                />
                <button
                  className="btn-primary px-4 py-2 rounded text-sm"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? '…' : '検索'}
                </button>
              </div>

              {/* 検索結果 */}
              {results.length > 0 && !selected && (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {results.map(g => (
                    <button
                      key={g.id}
                      className="flex gap-3 p-2 rounded text-left transition-all"
                      style={{
                        background: 'rgba(245,234,216,0.06)',
                        border: '1px solid rgba(201,168,76,0.2)',
                      }}
                      onClick={() => handleSelect(g)}
                    >
                      {g.volumeInfo.imageLinks?.smallThumbnail ? (
                        <img
                          src={g.volumeInfo.imageLinks.smallThumbnail.replace('http://', 'https://')}
                          className="w-10 h-14 object-cover rounded flex-shrink-0"
                          alt=""
                        />
                      ) : (
                        <div
                          className="w-10 h-14 rounded flex-shrink-0"
                          style={{ background: 'var(--wood-mid)' }}
                        />
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--paper)' }}>
                          {g.volumeInfo.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--paper-dark)' }}>
                          {g.volumeInfo.authors?.join(', ') ?? '不明'}
                        </p>
                        <p className="text-xs opacity-50" style={{ color: 'var(--paper-dark)' }}>
                          {g.volumeInfo.publishedDate?.slice(0, 4)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 選択済みの本 */}
              {selected && (
                <div
                  className="flex gap-3 p-3 rounded"
                  style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)' }}
                >
                  {selected.volumeInfo.imageLinks?.thumbnail && (
                    <img
                      src={selected.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                      className="w-14 h-20 object-cover rounded flex-shrink-0"
                      alt=""
                    />
                  )}
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--paper)' }}>
                      {selected.volumeInfo.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--paper-dark)' }}>
                      {selected.volumeInfo.authors?.join(', ')}
                    </p>
                    <button
                      className="text-xs mt-1 text-left opacity-50 hover:opacity-100"
                      style={{ color: 'var(--paper-dark)' }}
                      onClick={() => setSelected(null)}
                    >
                      ← 選び直す
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 手動入力フォーム */
            <div className="flex flex-col gap-3">
              {[
                { label: 'タイトル *', value: manualTitle, set: setManualTitle, placeholder: '本のタイトル' },
                { label: '著者', value: manualAuthor, set: setManualAuthor, placeholder: '著者名' },
                { label: 'シリーズ名', value: manualSeries, set: setManualSeries, placeholder: '（任意）' },
                { label: 'シリーズ巻数', value: manualSeriesIndex, set: setManualSeriesIndex, placeholder: '例：1' },
              ].map(field => (
                <div key={field.label} className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--paper-dark)' }}>{field.label}</label>
                  <input
                    type={field.label === 'シリーズ巻数' ? 'number' : 'text'}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    className="px-3 py-2 rounded text-sm"
                    style={{
                      background: 'rgba(245,234,216,0.1)',
                      border: '1px solid rgba(201,168,76,0.4)',
                      color: 'var(--paper)',
                      fontFamily: 'Georgia, serif',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 追加ボタン */}
          <button
            className="btn-primary py-2.5 rounded text-sm"
            onClick={handleAdd}
            disabled={manualMode ? !manualTitle.trim() : !selected}
            style={{ opacity: (manualMode ? !manualTitle.trim() : !selected) ? 0.4 : 1 }}
          >
            棚に追加する
          </button>
        </div>
      </div>
    </div>
  );
}

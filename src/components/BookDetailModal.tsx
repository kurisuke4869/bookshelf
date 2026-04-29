import { useState } from 'react';
import type { Book, BookStatus } from '../types';

interface Props {
  book: Book;
  onUpdate: (book: Book) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { key: BookStatus; label: string; icon: string }[] = [
  { key: 'read', label: '読了', icon: '✅' },
  { key: 'tsundoku', label: '積ん読', icon: '📦' },
  { key: 'wishlist', label: 'ほしい', icon: '⭐' },
];

export function BookDetailModal({ book, onUpdate, onDelete, onClose }: Props) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [rating, setRating] = useState<number>(book.rating ?? 0);
  const [memo, setMemo] = useState(book.memo ?? '');
  const [readAt, setReadAt] = useState(book.readAt ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const currentStatus = STATUS_OPTIONS.find(o => o.key === status)!;

  const handleSave = () => {
    onUpdate({
      ...book,
      status,
      rating: rating > 0 ? rating : undefined,
      memo: memo.trim() || undefined,
      readAt: status === 'read' ? (readAt || book.readAt) : undefined,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    onDelete(book.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
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
          <h2 className="shelf-label text-base font-normal">詳細</h2>
          <button onClick={onClose} className="shelf-label text-lg opacity-60 hover:opacity-100">✕</button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* 表紙 + 基本情報 */}
          <div className="flex gap-4">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                className="w-20 h-28 object-cover rounded flex-shrink-0"
                style={{ boxShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
                alt=""
              />
            ) : (
              <div
                className="w-20 h-28 rounded flex-shrink-0 flex items-center justify-center"
                style={{ background: 'var(--wood-mid)', boxShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
              >
                <span style={{ fontSize: '1.5rem' }}>📖</span>
              </div>
            )}
            <div className="flex flex-col justify-center min-w-0 gap-1">
              <p className="text-base font-medium leading-snug" style={{ color: 'var(--paper)' }}>
                {book.title}
              </p>
              <p className="text-sm" style={{ color: 'var(--paper-dark)' }}>{book.author}</p>
              {book.series && (
                <p className="text-xs opacity-60" style={{ color: 'var(--paper-dark)' }}>
                  {book.series}{book.seriesIndex ? ` #${book.seriesIndex}` : ''}
                </p>
              )}
              {book.publisher && (
                <p className="text-xs opacity-50" style={{ color: 'var(--paper-dark)' }}>
                  {book.publisher}
                </p>
              )}
            </div>
          </div>

          {/* ステータス */}
          <div className="relative">
            <p className="text-xs mb-2 opacity-60" style={{ color: 'var(--paper-dark)' }}>ステータス</p>
            <button
              className="nav-tab active flex items-center gap-2 px-4 py-2 rounded text-sm"
              onClick={() => setStatusOpen(v => !v)}
            >
              <span>{currentStatus.icon}</span>
              <span>{currentStatus.label}</span>
              <span className="ml-auto opacity-60 text-xs">{statusOpen ? '▲' : '▼'}</span>
            </button>
            {statusOpen && (
              <div
                className="absolute left-0 right-0 mt-1 rounded overflow-hidden z-10"
                style={{ border: '1px solid var(--gold)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
              >
                {STATUS_OPTIONS.filter(o => o.key !== status).map(opt => (
                  <button
                    key={opt.key}
                    className="nav-tab flex items-center gap-2 px-4 py-2.5 text-sm w-full"
                    onClick={() => {
                      setStatus(opt.key);
                      setEditing(true);
                      setStatusOpen(false);
                    }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}に移動</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 読了日 */}
          {status === 'read' && (
            <div>
              <p className="text-xs mb-1 opacity-60" style={{ color: 'var(--paper-dark)' }}>読了日</p>
              <input
                type="date"
                value={readAt}
                onChange={e => { setReadAt(e.target.value); setEditing(true); }}
                className="px-3 py-2 rounded text-sm w-full"
                style={{
                  background: 'rgba(245,234,216,0.1)',
                  border: '1px solid rgba(201,168,76,0.4)',
                  color: 'var(--paper)',
                  outline: 'none',
                  colorScheme: 'dark',
                }}
              />
            </div>
          )}

          {/* 評価 */}
          <div>
            <p className="text-xs mb-2 opacity-60" style={{ color: 'var(--paper-dark)' }}>評価</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => { setRating(n === rating ? 0 : n); setEditing(true); }}
                  style={{
                    fontSize: '1.5rem',
                    color: n <= rating ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                    transition: 'color 0.15s',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* メモ */}
          <div>
            <p className="text-xs mb-1 opacity-60" style={{ color: 'var(--paper-dark)' }}>メモ</p>
            <textarea
              placeholder="感想・メモなど..."
              value={memo}
              onChange={e => { setMemo(e.target.value); setEditing(true); }}
              rows={3}
              className="w-full px-3 py-2 rounded text-sm resize-none"
              style={{
                background: 'rgba(245,234,216,0.1)',
                border: '1px solid rgba(201,168,76,0.4)',
                color: 'var(--paper)',
                fontFamily: 'Georgia, serif',
                outline: 'none',
              }}
            />
          </div>

          {/* あらすじ */}
          {book.description && (
            <div>
              <p className="text-xs mb-1 opacity-60" style={{ color: 'var(--paper-dark)' }}>あらすじ</p>
              <p
                className="text-xs leading-relaxed line-clamp-4"
                style={{ color: 'var(--paper-dark)' }}
              >
                {book.description}
              </p>
            </div>
          )}

          {/* 保存ボタン */}
          {editing && (
            <button className="btn-primary py-2.5 rounded text-sm" onClick={handleSave}>
              保存する
            </button>
          )}

          {/* 削除 */}
          <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '0.75rem' }}>
            {!confirmDelete ? (
              <button
                className="text-xs opacity-40 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--paper-dark)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setConfirmDelete(true)}
              >
                この本を削除する
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <p className="text-xs flex-1" style={{ color: 'var(--paper-dark)' }}>本当に削除しますか？</p>
                <button
                  className="btn-primary text-xs px-3 py-1.5 rounded"
                  onClick={handleDelete}
                >
                  削除
                </button>
                <button
                  className="btn-wood text-xs px-3 py-1.5 rounded"
                  onClick={() => setConfirmDelete(false)}
                >
                  キャンセル
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

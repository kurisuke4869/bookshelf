import { useState } from 'react';
import type { Book, BookStatus } from '../types';

const COVER_COLORS = [
  ['#7b3f2a', '#5a2a18'], ['#2e4a7a', '#1a2e58'], ['#3a6b4a', '#234a30'],
  ['#6a2a5a', '#481840'], ['#7a5a2a', '#584018'], ['#4a3a7a', '#2e2458'],
];
function getCoverColor(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

const STATUS_OPTIONS: { key: BookStatus; label: string }[] = [
  { key: 'read', label: '読了' },
  { key: 'tsundoku', label: '積ん読' },
  { key: 'wishlist', label: 'ほしい' },
];

const STATUS_LABEL: Record<BookStatus, string> = { read: '読了', tsundoku: '積ん読', wishlist: 'ほしい' };

interface Props {
  book: Book;
  onUpdate: (book: Book) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function BookDetailModal({ book, onUpdate, onDelete, onClose }: Props) {
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [rating, setRating] = useState<number>(book.rating ?? 0);
  const [memo, setMemo] = useState(book.memo ?? '');
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage ?? 0);
  const [readAt, setReadAt] = useState(book.readAt ?? '');
  const [editing, setEditing] = useState(false);
  const [editingMemo, setEditingMemo] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [dark, light] = getCoverColor(book.title);
  const progress = book.pageCount && currentPage ? Math.min(100, Math.round((currentPage / book.pageCount) * 100)) : 0;

  const handleSave = () => {
    onUpdate({ ...book, status, rating: rating > 0 ? rating : undefined, memo: memo.trim() || undefined, readAt: status === 'read' ? (readAt || book.readAt) : undefined, currentPage: currentPage > 0 ? currentPage : undefined });
    setEditing(false);
    setEditingMemo(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowY: 'auto' }}>

      {/* ヘッダー：斜めストライプ＋表紙 */}
      <div style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245,200,122,0.06) 10px, rgba(245,200,122,0.06) 12px)`,
        backgroundColor: 'var(--header-bg)',
        paddingBottom: '0',
        flexShrink: 0,
      }}>
        {/* ナビゲーションバー */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
          <button className="icon-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--stat-label)" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
        </div>

        {/* 表紙＋タイトルエリア */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px 0' }}>
          {/* 表紙 */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <div className="book-cover-large" style={{ background: book.coverUrl ? undefined : `linear-gradient(145deg, ${light}, ${dark})` }}>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', zIndex: 1 }}>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.4, margin: 0 }}>{book.title}</p>
                  <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', marginTop: '6px', margin: '6px 0 0' }}>{book.author}</p>
                </div>
              )}
            </div>
            {/* ドロップシャドウ楕円 */}
            <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '50%', filter: 'blur(6px)', zIndex: -1 }} />
          </div>

          {/* タイトル・著者 */}
          <h1 style={{ color: '#f5e6cc', fontSize: '20px', fontFamily: "'Kaisei Tokumin', Georgia, serif", textAlign: 'center', margin: '0 0 6px', lineHeight: 1.4 }}>
            {book.title}
          </h1>
          <p style={{ color: 'var(--stat-label)', fontSize: '13px', margin: '0 0 10px' }}>{book.author}</p>

          {/* タグ */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
            {/* ステータスタグ（タップで変更） */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setStatusOpen(v => !v)}
                style={{ background: 'var(--tag-status-bg)', color: 'var(--tag-status-text)', fontSize: '11px', padding: '3px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}
              >
                {STATUS_LABEL[status]} {statusOpen ? '▲' : '▼'}
              </button>
              {statusOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '100px' }}>
                  {STATUS_OPTIONS.filter(o => o.key !== status).map(opt => (
                    <button key={opt.key} onClick={() => { setStatus(opt.key); setEditing(true); setStatusOpen(false); }}
                      style={{ display: 'block', width: '100%', padding: '8px 12px', fontSize: '13px', color: 'var(--ink-mid)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
                      {opt.label}に移動
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 波型の切り替え */}
        <svg viewBox="0 0 390 24" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '24px' }}>
          <path d="M0,0 C97.5,24 292.5,24 390,0 L390,24 L0,24 Z" fill="var(--bg)" />
        </svg>
      </div>

      {/* 本文エリア */}
      <div style={{ padding: '8px 16px 100px', flex: 1 }}>

        {/* あらすじカード */}
        {book.description && (
          <div className="detail-card">
            <p className="detail-card-label">あらすじ</p>
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.8, margin: 0, overflow: descExpanded ? 'visible' : 'hidden', display: '-webkit-box', WebkitLineClamp: descExpanded ? 'unset' : 3, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                {book.description}
              </p>
              {!descExpanded && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, var(--card-bg))' }} />
              )}
            </div>
            <button onClick={() => setDescExpanded(v => !v)} style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Kaisei Tokumin', Georgia, serif" }}>
              {descExpanded ? '閉じる ▴' : '続きを読む ▾'}
            </button>
          </div>
        )}

        {/* 評価カード */}
        <div className="detail-card">
          <p className="detail-card-label">評価</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => { setRating(n === rating ? 0 : n); setEditing(true); }}
                  style={{ fontSize: '24px', color: n <= rating ? 'var(--star)' : '#e0c8a8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, transition: 'color 0.15s' }}>
                  ★
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '22px', color: 'var(--ink)', fontWeight: 500 }}>{rating > 0 ? rating.toFixed(1) : '—'}</span>
              <span style={{ fontSize: '12px', color: 'var(--ink-light)' }}>/ 5.0</span>
            </div>
          </div>
        </div>

        {/* 読書進捗カード */}
        {book.pageCount && (
          <div className="detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p className="detail-card-label" style={{ margin: 0 }}>読書進捗</p>
              <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 500 }}>{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input
                type="number"
                value={currentPage || ''}
                onChange={e => { setCurrentPage(Number(e.target.value)); setEditing(true); }}
                placeholder="現在ページ"
                min={0}
                max={book.pageCount}
                className="modal-input"
                style={{ width: '100px', fontSize: '13px', padding: '4px 8px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--ink-light)' }}>/ {book.pageCount}ページ</span>
            </div>
          </div>
        )}

        {/* 読了日（読了のとき） */}
        {status === 'read' && (
          <div className="detail-card">
            <p className="detail-card-label">読了日</p>
            <input type="date" value={readAt} onChange={e => { setReadAt(e.target.value); setEditing(true); }}
              className="modal-input" style={{ colorScheme: 'light' }} />
          </div>
        )}

        {/* 感想・メモカード */}
        <div className="detail-card">
          <p className="detail-card-label">感想・メモ</p>
          {editingMemo ? (
            <textarea
              value={memo}
              onChange={e => { setMemo(e.target.value); setEditing(true); }}
              rows={4}
              className="modal-input"
              style={{ resize: 'none', lineHeight: 1.8, fontSize: '14px' }}
              placeholder="感想・メモを書く..."
            />
          ) : (
            <p style={{ fontSize: '14px', color: '#5a3a20', lineHeight: 1.8, margin: 0, minHeight: '40px', whiteSpace: 'pre-wrap' }}>
              {memo || <span style={{ color: 'var(--ink-light)' }}>まだメモがありません</span>}
            </p>
          )}
        </div>

        {/* 書誌情報カード */}
        {(book.publisher || book.isbn || book.pageCount || book.publishedDate) && (
          <div className="detail-card">
            <p className="detail-card-label">書誌情報</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { key: '出版社', val: book.publisher },
                { key: '出版日', val: book.publishedDate },
                { key: 'ISBN', val: book.isbn },
                { key: 'ページ数', val: book.pageCount ? `${book.pageCount}ページ` : undefined },
              ].filter(r => r.val).map((row, i, arr) => (
                <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? '0.5px solid #ede0cc' : 'none' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ink-light)' }}>{row.key}</span>
                  <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            className="btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: '14px' }}
            onClick={() => { setEditingMemo(true); setEditing(true); }}
          >
            メモを編集する
          </button>
          {editing && (
            <button className="btn-secondary" style={{ padding: '12px 20px', fontSize: '14px' }} onClick={handleSave}>
              保存
            </button>
          )}
        </div>

        {/* 削除 */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ fontSize: '12px', color: 'var(--ink-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
              この本を削除する
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>本当に削除しますか？</span>
              <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => { onDelete(book.id); onClose(); }}>削除</button>
              <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => setConfirmDelete(false)}>キャンセル</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

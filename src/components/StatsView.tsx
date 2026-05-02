import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Book } from '../types';

interface Props {
  books: Book[];
}

type StatsTab = 'read' | 'tsundoku';

function buildReadData(books: Book[]) {
  const readBooks = books.filter(b => b.readAt);
  if (readBooks.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const b of readBooks) {
    const month = b.readAt!.slice(0, 7);
    counts[month] = (counts[month] ?? 0) + 1;
  }

  const months = Object.keys(counts).sort();
  const first = months[0];
  const last = months[months.length - 1];
  const all = expandMonths(first, last);

  let cumulative = 0;
  return all.map(m => {
    cumulative += counts[m] ?? 0;
    const [y, mo] = m.split('-');
    return { month: `${Number(mo)}月`, fullMonth: `${y}年${Number(mo)}月`, cumulative };
  });
}

function buildTsundokuData(books: Book[]) {
  const events: { month: string; delta: number }[] = [];

  for (const b of books) {
    if (b.status === 'tsundoku' || (b.addedAt && b.status !== 'wishlist')) {
      if (b.addedAt) {
        const wasOrIsTsundoku = b.status === 'tsundoku' || (b.status === 'read' && b.readAt);
        if (wasOrIsTsundoku) {
          events.push({ month: b.addedAt.slice(0, 7), delta: 1 });
        }
      }
      if (b.status === 'read' && b.readAt) {
        events.push({ month: b.readAt.slice(0, 7), delta: -1 });
      }
    }
  }

  if (events.length === 0) return [];

  const months = events.map(e => e.month).sort();
  const all = expandMonths(months[0], months[months.length - 1]);

  const deltaByMonth: Record<string, number> = {};
  for (const e of events) {
    deltaByMonth[e.month] = (deltaByMonth[e.month] ?? 0) + e.delta;
  }

  let count = 0;
  return all.map(m => {
    count = Math.max(0, count + (deltaByMonth[m] ?? 0));
    const [y, mo] = m.split('-');
    return { month: `${Number(mo)}月`, fullMonth: `${y}年${Number(mo)}月`, count };
  });
}

function expandMonths(first: string, last: string): string[] {
  const result: string[] = [];
  let [y, mo] = first.split('-').map(Number);
  const [ey, emo] = last.split('-').map(Number);
  while (y < ey || (y === ey && mo <= emo)) {
    result.push(`${y}-${String(mo).padStart(2, '0')}`);
    mo++;
    if (mo > 12) { mo = 1; y++; }
  }
  return result;
}

export function StatsView({ books }: Props) {
  const [tab, setTab] = useState<StatsTab>('read');

  const readBooks = books.filter(b => b.status === 'read');
  const tsundokuBooks = books.filter(b => b.status === 'tsundoku');

  const readData = buildReadData(books);
  const tsundokuData = buildTsundokuData(books);

  return (
    <div style={{ paddingBottom: '24px' }}>
      {/* サマリーチップ */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: '読了', value: readBooks.length, color: '#c87a30' },
          { label: '積読', value: tsundokuBooks.length, color: '#8a6840' },
          { label: '合計', value: books.length, color: 'var(--ink-mid)' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--card-bg)', borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <span style={{ color: s.color, fontSize: '24px', fontWeight: 500, display: 'block' }}>{s.value}</span>
            <span style={{ color: 'var(--ink-light)', fontSize: '11px' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {([
          { key: 'read' as const, label: '読了累計' },
          { key: 'tsundoku' as const, label: '積読推移' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 4px',
              fontSize: '13px', color: 'var(--ink-mid)',
              borderBottom: tab === t.key ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              fontFamily: "'Kaisei Tokumin', Georgia, serif",
              opacity: tab === t.key ? 1 : 0.5,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* グラフ */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        {tab === 'read' ? (
          readData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={readData} margin={{ top: 4, right: 8, left: 8, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ink-light)' }} type="category" label={{ value: '月', position: 'insideBottomRight', offset: 0, fontSize: 11, fill: 'var(--ink-light)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-light)' }} allowDecimals={false} label={{ value: '冊', angle: 0, position: 'insideTopLeft', offset: 0, fontSize: 11, fill: 'var(--ink-light)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', fontSize: '12px' }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth ?? ''}
                  formatter={(v) => [`${v}冊`, '累計読了']}
                />
                <Line type="monotone" dataKey="cumulative" stroke="#c87a30" strokeWidth={2} dot={{ r: 3, fill: '#c87a30' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--ink-light)', fontSize: '13px', padding: '40px 0' }}>読了データがありません</p>
          )
        ) : (
          tsundokuData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={tsundokuData} margin={{ top: 4, right: 8, left: 8, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ink-light)' }} type="category" label={{ value: '月', position: 'insideBottomRight', offset: 0, fontSize: 11, fill: 'var(--ink-light)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-light)' }} allowDecimals={false} label={{ value: '冊', angle: 0, position: 'insideTopLeft', offset: 0, fontSize: 11, fill: 'var(--ink-light)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', fontSize: '12px' }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth ?? ''}
                  formatter={(v) => [`${v}冊`, '積読冊数']}
                />
                <Line type="monotone" dataKey="count" stroke="#8a6840" strokeWidth={2} dot={{ r: 3, fill: '#8a6840' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--ink-light)', fontSize: '13px', padding: '40px 0' }}>積読データがありません</p>
          )
        )}
      </div>
    </div>
  );
}

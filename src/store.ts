import type { Book } from './types';

const KEY = 'bookshelf-books';

export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(KEY, JSON.stringify(books));
}

export function addBook(books: Book[], book: Book): Book[] {
  const next = [book, ...books];
  saveBooks(next);
  return next;
}

export function updateBook(books: Book[], updated: Book): Book[] {
  const next = books.map(b => (b.id === updated.id ? updated : b));
  saveBooks(next);
  return next;
}

export function deleteBook(books: Book[], id: string): Book[] {
  const next = books.filter(b => b.id !== id);
  saveBooks(next);
  return next;
}

export type BookStatus = 'read' | 'tsundoku' | 'wishlist';

export interface Book {
  id: string;
  title: string;
  author: string;
  series?: string;
  seriesIndex?: number;
  coverUrl?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  status: BookStatus;
  rating?: number;
  memo?: string;
  readAt?: string;
  addedAt: string;
  currentPage?: number;
}

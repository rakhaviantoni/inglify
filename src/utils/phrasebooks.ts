import type { HistoryItem, Phrasebook } from '../types/translation';

const STORAGE_KEY = 'inglify-phrasebooks';

export function getPhrasebooks(): Phrasebook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePhrasebooks(books: Phrasebook[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function createPhrasebook(name: string, icon: string): Phrasebook {
  const books = getPhrasebooks();
  const newBook: Phrasebook = {
    id: `pb-${Date.now()}`,
    name,
    icon,
    items: [],
    createdAt: Date.now(),
  };
  books.push(newBook);
  savePhrasebooks(books);
  return newBook;
}

export function addToPhrasebook(bookId: string, item: HistoryItem): boolean {
  const books = getPhrasebooks();
  const book = books.find(b => b.id === bookId);
  if (!book) return false;
  
  // Avoid duplicates
  if (book.items.some(i => i.id === item.id)) return false;
  
  book.items.unshift(item);
  savePhrasebooks(books);
  return true;
}

export function removeFromPhrasebook(bookId: string, itemId: string): void {
  const books = getPhrasebooks();
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  
  book.items = book.items.filter(i => i.id !== itemId);
  savePhrasebooks(books);
}

export function deletePhrasebook(bookId: string): void {
  const books = getPhrasebooks().filter(b => b.id !== bookId);
  savePhrasebooks(books);
}

export function renamePhrasebook(bookId: string, name: string): void {
  const books = getPhrasebooks();
  const book = books.find(b => b.id === bookId);
  if (book) {
    book.name = name;
    savePhrasebooks(books);
  }
}

export const DEFAULT_ICONS = ['📚', '✈️', '💼', '🍽️', '🎓', '💬', '❤️', '🏠', '🎯', '🌍'];

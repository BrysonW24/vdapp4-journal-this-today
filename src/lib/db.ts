import Dexie, { type Table } from 'dexie';
import type { JournalEntry, Category, Attachment } from '@/types/journal';

export interface Tag {
  id: string;
  name: string;
  count: number;
  createdAt: Date;
}

export interface Settings {
  key: string;
  value: any;
}

export class JournalDatabase extends Dexie {
  entries!: Table<JournalEntry>;
  media!: Table<Attachment>;
  categories!: Table<Category>;
  tags!: Table<Tag>;
  settings!: Table<Settings>;

  constructor() {
    super('JournalDatabase');
    this.version(1).stores({
      entries:
        'id, title, createdAt, updatedAt, mood, category, isFavorite, isEncrypted, *tags',
      media: 'id, type, createdAt, filename',
      categories: 'id, name, order',
      tags: 'id, name, count',
      settings: 'key',
    });
  }

  async clearDatabase() {
    await this.entries.clear();
    await this.media.clear();
    await this.categories.clear();
    await this.tags.clear();
    await this.settings.clear();
  }

  async getDatabaseSize(): Promise<number> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }

  async exportDatabase() {
    const entries = await this.entries.toArray();
    const media = await this.media.toArray();
    const categories = await this.categories.toArray();
    const tags = await this.tags.toArray();
    const settings = await this.settings.toArray();

    return {
      entries,
      media,
      categories,
      tags,
      settings,
      exportDate: new Date().toISOString(),
    };
  }

  async importDatabase(data: any) {
    if (data.entries) await this.entries.bulkPut(data.entries);
    if (data.media) await this.media.bulkPut(data.media);
    if (data.categories) await this.categories.bulkPut(data.categories);
    if (data.tags) await this.tags.bulkPut(data.tags);
    if (data.settings) await this.settings.bulkPut(data.settings);
  }
}

export const db = new JournalDatabase();

export enum MoodLevel {
  VERY_SAD = 1,
  SAD = 2,
  NEUTRAL = 3,
  HAPPY = 4,
  VERY_HAPPY = 5,
}

export enum ContentType {
  PLAIN_TEXT = 'PLAIN_TEXT',
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
}

export interface Attachment {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'drawing' | 'document';
  url: string;
  filename: string;
  size: number;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  journalId: string; // Which journal this entry belongs to
  title: string;
  content: string;
  contentType: ContentType;
  mood?: MoodLevel;
  category?: string;
  tags: string[];
  isFavorite: boolean;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
  wordCount?: number;
  charCount?: number;
  location?: Location;
}

export type ThemePattern =
  | 'solid'
  | 'gradient'
  | 'dots'
  | 'grid'
  | 'waves'
  | 'stripes'
  | 'paper'
  | 'texture';

export interface Journal {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  entryCount: number;
  createdAt: Date;
  lastUsedAt?: Date;
  theme?: ThemePattern;
}

export interface Prompt {
  id: string;
  question: string;
  packId?: string;
  isFavorite: boolean;
  createdAt: Date;
}

export interface PromptPack {
  id: string;
  name: string;
  icon: string;
  prompts: Prompt[];
  description?: string;
}

export const DEFAULT_PROMPT_PACKS: PromptPack[] = [
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '💪',
    description: 'Track your fitness journey',
    prompts: [
      { id: 'f1', question: 'What exercise did you do today?', isFavorite: false, createdAt: new Date() },
      { id: 'f2', question: 'How did your body feel during the workout?', isFavorite: false, createdAt: new Date() },
      { id: 'f3', question: 'What fitness goal are you working towards?', isFavorite: false, createdAt: new Date() },
    ],
  },
  {
    id: 'legacy',
    name: 'Legacy',
    icon: '👑',
    description: 'Document your life story',
    prompts: [
      { id: 'l1', question: 'What life lesson would you want to pass down?', isFavorite: false, createdAt: new Date() },
      { id: 'l2', question: 'What are you most proud of accomplishing?', isFavorite: false, createdAt: new Date() },
      { id: 'l3', question: 'What values are most important to you?', isFavorite: false, createdAt: new Date() },
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    icon: '🙏',
    description: 'Practice daily gratitude',
    prompts: [
      { id: 'g1', question: "What are three things you're grateful for today?", isFavorite: false, createdAt: new Date() },
      { id: 'g2', question: 'Who made a positive impact on your day?', isFavorite: false, createdAt: new Date() },
      { id: 'g3', question: 'What small moment brought you joy today?', isFavorite: false, createdAt: new Date() },
    ],
  },
  {
    id: 'reflection',
    name: 'Reflection',
    icon: '🤔',
    description: 'Reflect on your experiences',
    prompts: [
      { id: 'r1', question: 'What did you learn about yourself today?', isFavorite: false, createdAt: new Date() },
      { id: 'r2', question: 'What would you do differently?', isFavorite: false, createdAt: new Date() },
      { id: 'r3', question: 'What challenged you today?', isFavorite: false, createdAt: new Date() },
    ],
  },
  {
    id: 'creativity',
    name: 'Creativity',
    icon: '🎨',
    description: 'Spark your creative side',
    prompts: [
      { id: 'c1', question: 'What inspired you today?', isFavorite: false, createdAt: new Date() },
      { id: 'c2', question: 'If you could create anything, what would it be?', isFavorite: false, createdAt: new Date() },
      { id: 'c3', question: 'What new idea are you excited about?', isFavorite: false, createdAt: new Date() },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: '🧘',
    description: 'Stay present and aware',
    prompts: [
      { id: 'm1', question: 'How are you feeling in this moment?', isFavorite: false, createdAt: new Date() },
      { id: 'm2', question: 'What do you notice about your surroundings?', isFavorite: false, createdAt: new Date() },
      { id: 'm3', question: 'What brought you peace today?', isFavorite: false, createdAt: new Date() },
    ],
  },
  {
    id: 'look-back-2025',
    name: 'Look Back on 2025',
    icon: '⭐',
    description: 'Reflect on the year',
    prompts: [
      { id: 'lb1', question: 'What was my favorite way to spend my time in 2025?', isFavorite: false, createdAt: new Date() },
      { id: 'lb2', question: 'What photo or moment from this year do I want to revisit today?', isFavorite: false, createdAt: new Date() },
      { id: 'lb3', question: 'What accomplishment am I most proud of?', isFavorite: false, createdAt: new Date() },
    ],
  },
];

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  entryCount: number;
  createdAt: Date;
  lastUsedAt?: Date;
  order: number;
  isArchived: boolean;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'entryCount' | 'lastUsedAt'>[] = [
  { name: 'Personal', color: '#3B82F6', icon: '👤', order: 1, isArchived: false },
  { name: 'Work', color: '#8B5CF6', icon: '💼', order: 2, isArchived: false },
  { name: 'Travel', color: '#10B981', icon: '✈️', order: 3, isArchived: false },
  { name: 'Gratitude', color: '#F59E0B', icon: '🙏', order: 4, isArchived: false },
  { name: 'Dreams', color: '#EC4899', icon: '💭', order: 5, isArchived: false },
  { name: 'Goals', color: '#EF4444', icon: '🎯', order: 6, isArchived: false },
  { name: 'Health', color: '#14B8A6', icon: '💪', order: 7, isArchived: false },
  { name: 'Relationships', color: '#F43F5E', icon: '❤️', order: 8, isArchived: false },
];

export interface MoodMetadata {
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const MOOD_METADATA: Record<MoodLevel, MoodMetadata> = {
  [MoodLevel.VERY_SAD]: {
    emoji: '😢',
    label: 'Very Sad',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  [MoodLevel.SAD]: {
    emoji: '😔',
    label: 'Sad',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#FDBA74',
  },
  [MoodLevel.NEUTRAL]: {
    emoji: '😐',
    label: 'Neutral',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  [MoodLevel.HAPPY]: {
    emoji: '😊',
    label: 'Happy',
    color: '#16A34A',
    bgColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  [MoodLevel.VERY_HAPPY]: {
    emoji: '😄',
    label: 'Very Happy',
    color: '#15803D',
    bgColor: '#BBF7D0',
    borderColor: '#86EFAC',
  },
};

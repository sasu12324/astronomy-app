export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  group?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Wheel {
  id: string;
  name: string;
  items: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface WheelSelection {
  id: string;
  wheelId: string;
  winner: string;
  selectedAt: Date;
  userId?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  link: string;
  type: 'article' | 'video' | 'post'; // ← ДОБАВЛЕН 'post'
  content?: string; // ← ДОБАВЛЕНО поле для HTML контента поста
  authorId: string;
  authorName: string;
  createdAt: Date;
}


// ========== ТЕСТЫ ==========

export type QuestionType = 'single' | 'multiple' | 'text';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctOptionIndex: number;
  correctOptionIndexes: number[];
  correctText: string;
  imageUrl?: string;
  optionImages?: string[];
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ========== ЛОББИ ==========

export type LobbyStatus = 'waiting' | 'active' | 'finished';

export interface LobbyParticipant {
  uid?: string;
  displayName: string;
  isAnonymous: boolean;
  joinedAt: Date;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number;
  finishedAt?: Date;
}

export interface Lobby {
  id: string;
  testId: string;
  testTitle: string;
  code: string;
  status: LobbyStatus;
  authorId: string;
  participants: Record<string, LobbyParticipant>;
  questionsCount?: number; // ← ДОБАВЬ ЭТО
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
}


// === УЧЕБНИК ===

export interface TextbookSubsection {
  id: string;
  order: number;
  title: string;
  content: string;
}

export interface TextbookLecture {
  id: string;
  order: number;
  number: string;
  title: string;
  content: string;
  subsections: TextbookSubsection[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

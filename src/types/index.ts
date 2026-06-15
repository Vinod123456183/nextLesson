export type PostType = 'lesson' | 'tip' | 'mistake';

export const TAGS = [
  'relationship', 'career', 'love', 'trading', 'money',
  'health', 'family', 'mental-health', 'education', 'business',
  'fitness', 'friendship', 'parenting', 'travel', 'spirituality',
  'productivity', 'life', 'other',
] as const;

export type Tag = typeof TAGS[number];

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: string;
  postCount: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  title: string;
  body: string;
  type: PostType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
}

export interface PostCreateInput {
  title: string;
  body: string;
  type: PostType;
  tags: string[];
}

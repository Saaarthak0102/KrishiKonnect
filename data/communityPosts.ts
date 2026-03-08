import { mockCommunityPosts } from '@/data/mockCommunityPosts';
import { translateToHindi } from '@/utils/translateText';

export interface CommunityText {
  en: string;
  hi: string;
}

export interface CommunityReply {
  user: string;
  text: CommunityText;
  time: string;
}

export interface CommunityPost {
  id: number;
  user: string;
  location: string;
  category: 'Wheat' | 'Rice' | 'Vegetables' | 'Fruits' | 'Irrigation' | 'Pest Control';
  text: CommunityText;
  time: string;
  likes: number;
  replies: CommunityReply[];
}

export const communityPosts: CommunityPost[] = mockCommunityPosts.map((post) => ({
  id: post.id,
  user: post.user,
  location: post.location,
  category: post.category,
  text: {
    en: post.message,
    hi: translateToHindi(post.message),
  },
  time: post.time,
  likes: post.likes,
  replies: post.replies.map((reply) => ({
    user: reply.user,
    text: {
      en: reply.message,
      hi: translateToHindi(reply.message),
    },
    time: reply.time,
  })),
}));

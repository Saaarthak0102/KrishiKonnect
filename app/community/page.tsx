'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AskQuestionBox from '@/components/community/AskQuestionBox';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { mockCommunityPosts } from '@/data/mockCommunityPosts';
import { motion } from 'framer-motion';
import { BsChatDots } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';
import { FiMessageCircle, FiThumbsUp } from 'react-icons/fi';

const FILTER_CATEGORIES_EN = ['All', 'Wheat', 'Rice', 'Vegetables', 'Fruits', 'Irrigation', 'Pest Control'];
const FILTER_CATEGORIES_HI = ['सभी', 'गेहूँ', 'धान', 'सब्जियाँ', 'फल', 'सिंचाई', 'कीट नियंत्रण'];
const FILTER_CATEGORIES_MAP = {
  'All': 'All',
  'Wheat': 'Wheat',
  'Rice': 'Rice',
  'Vegetables': 'Vegetables',
  'Fruits': 'Fruits',
  'Irrigation': 'Irrigation',
  'Pest Control': 'Pest Control',
  'सभी': 'All',
  'गेहूँ': 'Wheat',
  'धान': 'Rice',
  'सब्जियाँ': 'Vegetables',
  'फल': 'Fruits',
  'सिंचाई': 'Irrigation',
  'कीट नियंत्रण': 'Pest Control',
};

interface FeedPost {
  id: string;
  author: string;
  location?: string;
  cropTag_en?: string;
  cropTag_hi?: string;
  content_en: string;
  content_hi: string;
  upvotes: number;
  repliesCount: number;
  replies: FeedReply[];
  createdAt: Date;
}

interface FeedReply {
  id: string;
  author: string;
  message_en: string;
  message_hi: string;
  createdAt: Date;
}

const CATEGORY_HI_MAP: Record<string, string> = {
  Wheat: 'गेहूँ',
  Rice: 'धान',
  Vegetables: 'सब्जियाँ',
  Fruits: 'फल',
  Irrigation: 'सिंचाई',
  'Pest Control': 'कीट नियंत्रण',
};

function parseRelativeTimeLabel(timeLabel: string): Date {
  const now = new Date();
  const normalized = timeLabel.toLowerCase().trim();
  const match = normalized.match(/^(\d+)\s*([mhd])\s*ago$/);
  if (!match) return now;

  const value = Number(match[1]);
  const unit = match[2];
  const date = new Date(now);

  if (unit === 'm') date.setMinutes(date.getMinutes() - value);
  if (unit === 'h') date.setHours(date.getHours() - value);
  if (unit === 'd') date.setDate(date.getDate() - value);

  return date;
}

function toFeedPostFromMock() : FeedPost[] {
  return mockCommunityPosts.map((post) => ({
    id: String(post.id),
    author: post.user,
    location: post.location,
    cropTag_en: post.category,
    cropTag_hi: CATEGORY_HI_MAP[post.category],
    content_en: post.message,
    content_hi: post.message,
    upvotes: post.likes,
    repliesCount: post.replies.length,
    replies: post.replies.map((reply, index) => ({
      id: `${post.id}-reply-${index + 1}`,
      author: reply.user,
      message_en: reply.message,
      message_hi: reply.message,
      createdAt: parseRelativeTimeLabel(reply.time),
    })),
    createdAt: parseRelativeTimeLabel(post.time),
  }));
}

function toRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function canonicalCropTag(cropTag?: string): string {
  if (!cropTag) return 'All';
  return FILTER_CATEGORIES_MAP[cropTag as keyof typeof FILTER_CATEGORIES_MAP] || cropTag;
}

export default function CommunityPage() {
  const { t, lang } = useTranslation();
  const { user, farmerProfile } = useAuth();
  const [globalPosts, setGlobalPosts] = useState<FeedPost[]>(toFeedPostFromMock);
  const [isLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replyInputOpen, setReplyInputOpen] = useState<Set<string>>(new Set());
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const discussionGridRef = useRef<HTMLDivElement | null>(null);

  const FILTER_CATEGORIES = lang === 'en' ? FILTER_CATEGORIES_EN : FILTER_CATEGORIES_HI;

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    const filterKey = FILTER_CATEGORIES_MAP[selectedFilter as keyof typeof FILTER_CATEGORIES_MAP] || 'All';
    
    if (filterKey === 'All') {
      return globalPosts;
    }
    
    return globalPosts.filter(post => {
      const normalizedTag = canonicalCropTag(lang === 'en' ? post.cropTag_en : post.cropTag_hi);
      return normalizedTag === filterKey;
    });
  }, [globalPosts, selectedFilter, lang]);

  // Handle upvote
  const handleUpvote = (postId: string) => {
    setGlobalPosts(posts =>
      posts.map(p =>
        p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
      )
    );
  };

  // Toggle replies visibility
  const toggleReplies = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleReplyInput = (postId: string) => {
    setReplyInputOpen((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    setExpandedPosts((prev) => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  };

  const handleReplyChange = (postId: string, value: string) => {
    setReplyDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const handleSendReply = (postId: string) => {
    const draft = (replyDrafts[postId] || '').trim();
    if (!draft) {
      return;
    }

    const replyAuthor = user?.displayName || farmerProfile?.name || 'You';
    const newReply: FeedReply = {
      id: `${postId}-local-${Date.now()}`,
      author: replyAuthor,
      message_en: draft,
      message_hi: draft,
      createdAt: new Date(),
    };

    setGlobalPosts((posts) =>
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [...post.replies, newReply],
              repliesCount: post.repliesCount + 1,
            }
          : post
      )
    );

    setReplyDrafts((prev) => ({ ...prev, [postId]: '' }));
    setReplyInputOpen((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  };

  // Scroll reveal animation for discussion cards
  useEffect(() => {
    if (!discussionGridRef.current) {
      return;
    }

    const cards = Array.from(discussionGridRef.current.querySelectorAll<HTMLElement>('.discussion-card'));
    if (cards.length === 0) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      cards.forEach((card) => card.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredPosts]);

  // Handle new post submission
  const handleCreatePost = async (
    contentText: string,
    cropTagEn: string,
    cropTagHi: string,
    cropEmoji: string
  ) => {
    const nextPost: FeedPost = {
      id: `local-${Date.now()}`,
      author: user?.displayName || farmerProfile?.name || 'Farmer',
      location: farmerProfile?.state || 'India',
      cropTag_en: cropTagEn,
      cropTag_hi: cropTagHi,
      content_en: contentText,
      content_hi: contentText,
      upvotes: 0,
      repliesCount: 0,
      replies: [],
      createdAt: new Date(),
    };

    setGlobalPosts((prev) => [nextPost, ...prev]);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen py-8 px-4">
        <main className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12 mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-[10px] mb-3">
              <h1 className="font-bold tracking-[-0.5px] font-['Poppins']" style={{ fontSize: '3rem' }}>
                <span className="text-[#2D2A6E]">
                  {lang === 'hi' ? 'कृषि' : 'Krishi'}
                </span>
                {' '}
                <span className="text-[#C46A3D]">
                  {lang === 'hi' ? 'संघ' : 'Sangh'}
                </span>
              </h1>
              <FaUsers
                size={32}
                color="#2D2A6E"
                style={{
                  opacity: 0.9,
                  marginLeft: '10px',
                  transition: 'all 0.2s ease',
                }}
                className="hover:translate-y-[-1px]"
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.5 }}
              className="text-[1.05rem] font-medium text-[#C46A3D]"
            >
              {t('communityDiscussions')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-[0.95rem] text-[rgba(45,42,110,0.75)] mt-2"
            >
              {t('communityDescription')}
            </motion.p>
          </motion.div>

          {/* Category Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 flex flex-wrap gap-2"
          >
            {FILTER_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-4 py-2 rounded-[10px] font-medium transition-all duration-200 ease-out hover:translate-y-[-1px] ${
                  selectedFilter === category
                    ? 'bg-[#C46A3D] text-white border-none shadow-lg'
                    : 'bg-[rgba(255,255,255,0.55)] backdrop-blur-[10px] text-[#2D2A6E] border border-[rgba(196,106,61,0.25)]'
                }`}
                style={{
                  transition: 'all 0.2s ease-out',
                }}
                onMouseEnter={(e) => {
                  if (selectedFilter === category) {
                    e.currentTarget.style.boxShadow = '0 0 6px rgba(196,106,61,0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFilter === category) {
                    e.currentTarget.style.boxShadow = '';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Posts Feed */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-6 overflow-hidden rounded-2xl border border-[rgba(196,106,61,0.25)] bg-[rgba(255,255,255,0.55)] backdrop-blur-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <div
              ref={discussionGridRef}
              className="community-discussion-grid max-w-5xl mx-auto space-y-4 overflow-y-auto h-[60vh] p-6"
            >
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-krishi-indigo/70 text-lg">Loading...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4 text-krishi-highlight flex justify-center">
                      <BsChatDots size={64} />
                    </div>
                    <p className="text-krishi-indigo/70 text-lg">
                      {t('noQuestionsFound')}
                    </p>
                  </div>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="discussion-card rounded-[14px] border border-[rgba(196,106,61,0.30)] bg-[rgba(255,255,255,0.45)] backdrop-blur-[14px] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
                    style={{
                      transition: 'transform 0.18s ease-out, box-shadow 0.18s ease-out, border-color 0.18s ease-out',
                      willChange: 'transform, opacity',
                      transform: 'translateZ(0)',
                    }}
                    whileHover={{
                      y: -4,
                      scale: 1.01,
                      boxShadow: '0 14px 34px rgba(0,0,0,0.10), 0 0 14px rgba(196,106,61,0.10)',
                      borderColor: 'rgba(196,106,61,0.35)',
                      transition: { duration: 0.18, ease: 'easeOut' },
                    }}
                    whileTap={{ scale: 0.98, transition: { duration: 0.15, ease: 'easeOut' } }}
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="h-[34px] w-[34px] rounded-full bg-krishi-agriculture text-white font-semibold flex items-center justify-center"
                          style={{
                            transition: 'transform 0.2s ease-out',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-[0.95rem] font-semibold text-[#2D2A6E]">
                            {post.author}
                          </h3>
                          <p className="text-[0.85rem] text-[rgba(45,42,110,0.65)]">
                            {post.location && `${post.location} • `}
                            {toRelativeTime(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      {/* Crop Tag */}
                      {(post.cropTag_en || post.cropTag_hi) && (
                        <span
                          className="rounded-full bg-[rgba(196,106,61,0.15)] px-[10px] py-1 text-[0.8rem] text-[#C46A3D]"
                          style={{
                            transition: 'transform 0.25s ease-out, box-shadow 0.25s ease-out',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 0 6px rgba(196,106,61,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {lang === 'en' ? post.cropTag_en : post.cropTag_hi}
                        </span>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-krishi-indigo mb-4">
                      {lang === 'en' ? post.content_en : post.content_hi}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => handleUpvote(post.id)}
                        className="flex items-center gap-3 text-[#2D2A6E] transition-colors hover:text-krishi-clay"
                      >
                        <FiThumbsUp
                          size={18}
                          className="opacity-80"
                          style={{
                            transition: 'transform 0.2s ease-out',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          }}
                        />
                        <span>{post.upvotes}</span>
                      </button>
                      <button
                        onClick={() => toggleReplies(post.id)}
                        className="flex items-center gap-3 text-[#2D2A6E] transition-colors hover:text-krishi-clay"
                      >
                        <FiMessageCircle
                          size={18}
                          className="opacity-80"
                          style={{
                            transition: 'transform 0.2s ease-out',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          }}
                        />
                        <span>
                          {post.repliesCount} {post.repliesCount === 1 ? t('reply') : t('replies')}
                        </span>
                      </button>
                      <button
                        onClick={() => toggleReplyInput(post.id)}
                        className="text-[#C46A3D] flex items-center gap-1 transition-colors hover:text-[#aa5933]"
                      >
                        <FiMessageCircle size={16} />
                        <span>{lang === 'hi' ? 'जवाब दें' : 'Reply'}</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {expandedPosts.has(post.id) && (
                      <div className="mt-4 space-y-2">
                        {post.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="text-sm ml-10 bg-[rgba(255,255,255,0.7)] rounded-[10px] px-3 py-2"
                          >
                            <p className="text-[#2D2A6E]">
                              <span className="font-semibold">{reply.author}:</span>{' '}
                              {lang === 'en' ? reply.message_en : reply.message_hi}
                            </p>
                            <p className="text-[rgba(45,42,110,0.55)] text-xs mt-1">
                              {toRelativeTime(reply.createdAt)}
                            </p>
                          </div>
                        ))}

                        {replyInputOpen.has(post.id) && (
                          <div className="ml-10 bg-[rgba(255,255,255,0.72)] rounded-[10px] p-3 border border-[rgba(196,106,61,0.22)]">
                            <input
                              value={replyDrafts[post.id] || ''}
                              onChange={(e) => handleReplyChange(post.id, e.target.value)}
                              placeholder={lang === 'hi' ? 'जवाब लिखें...' : 'Write a reply...'}
                              className="w-full rounded-[8px] border border-[rgba(196,106,61,0.28)] bg-white/80 px-3 py-2 text-sm text-[#2D2A6E] focus:outline-none"
                            />
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => handleSendReply(post.id)}
                                className="rounded-[8px] bg-[#C46A3D] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#aa5933]"
                              >
                                {lang === 'hi' ? 'भेजें' : 'Send'}
                              </button>
                            </div>
                          </div>
                        )}

                        {post.replies.length === 0 && !replyInputOpen.has(post.id) && (
                          <p className="text-sm ml-10 text-[rgba(45,42,110,0.65)]">
                            {lang === 'hi' ? 'अभी कोई जवाब नहीं' : 'No replies yet'}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Ask Question Input Box */}
          <AskQuestionBox onPostCreated={handleCreatePost} />
        </main>
      </div>
    </DashboardLayout>
  );
}

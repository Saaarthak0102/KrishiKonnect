'use client';

import { useState } from 'react';
import FeaturePageLayout from '@/components/FeaturePageLayout';
import AskQuestionBox from '@/components/community/AskQuestionBox';
import { mockCommunityPosts, Post, Reply } from '@/data/mockCommunityPosts';

const FILTER_CATEGORIES = [
  'All',
  'Wheat',
  'Rice',
  'Vegetables',
  'Fruits',
  'Irrigation',
  'Pest Control'
];

export default function CommunityPage() {
  const [globalPosts, setGlobalPosts] = useState<Post[]>(mockCommunityPosts);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // Filter posts based on selected category
  const filteredPosts = selectedFilter === 'All'
    ? globalPosts
    : globalPosts.filter(post => post.cropTag === selectedFilter);

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

  // Handle new post submission
  const handleCreatePost = (content: string, cropTag: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: 'Current User', // Replace with actual user name
      content,
      cropTag,
      upvotes: 0,
      replies: [],
      createdAt: 'Just now'
    };
    setGlobalPosts(prev => [newPost, ...prev]);
  };

  return (
    <FeaturePageLayout>
      <div className="min-h-screen bg-krishi-bg py-8 px-4">
        <main className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-krishi-heading mb-2">
              Community Discussions
            </h1>
            <p className="text-krishi-text/80 mt-1">
              Ask questions, share farming tips, and help fellow farmers.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTER_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedFilter === category
                    ? 'bg-krishi-primary text-white'
                    : 'bg-white border border-krishi-border text-krishi-text hover:bg-krishi-primary/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="bg-white border-2 border-krishi-border rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="max-w-5xl mx-auto space-y-4 overflow-y-auto h-[60vh] p-6">
              {filteredPosts.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4 text-krishi-highlight">💬</div>
                    <p className="text-krishi-text/70 text-lg">
                      No posts found for this category.
                    </p>
                  </div>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border-2 border-krishi-border rounded-xl p-4 hover:border-krishi-primary/50 transition-all"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor: `hsl(${post.author.charCodeAt(0) * 10}, 70%, 60%)`
                          }}
                        >
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-krishi-heading">
                            {post.author}
                          </h3>
                          <p className="text-sm text-krishi-text/70">
                            {post.location && `${post.location} • `}
                            {post.createdAt}
                          </p>
                        </div>
                      </div>
                      {/* Crop Tag */}
                      {post.cropTag && (
                        <span className="px-3 py-1 bg-krishi-primary/10 text-krishi-primary rounded-full text-sm font-medium">
                          {post.cropTag}
                        </span>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-krishi-text mb-4">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => handleUpvote(post.id)}
                        className="flex items-center gap-1 text-krishi-text hover:text-krishi-primary transition-colors"
                      >
                        <span className="text-lg">👍</span>
                        <span>{post.upvotes}</span>
                      </button>
                      <button
                        onClick={() => toggleReplies(post.id)}
                        className="flex items-center gap-1 text-krishi-text hover:text-krishi-primary transition-colors"
                      >
                        <span className="text-lg">💬</span>
                        <span>{post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {expandedPosts.has(post.id) && post.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-krishi-border space-y-3">
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="bg-krishi-bg/50 rounded-lg p-3">
                            <p className="font-semibold text-sm text-krishi-heading mb-1">
                              {reply.author}
                            </p>
                            <p className="text-sm text-krishi-text">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ask Question Input Box */}
          <AskQuestionBox onPostCreated={handleCreatePost} />
        </main>
      </div>
    </FeaturePageLayout>
  );
}

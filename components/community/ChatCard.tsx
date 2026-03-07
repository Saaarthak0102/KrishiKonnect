'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReplyItem, { NestedReply } from './ReplyItem';
import { 
  subscribeToReplies, 
  addReply, 
  upvoteReply, 
  removeUpvoteReply,
  type CommunityReply 
} from '@/lib/community';
import { getShortTime } from '@/lib/timeUtils';

export interface ChatCardProps {
  id: string;
  userName: string;
  userLocation: string;
  cropTag: string;
  cropEmoji?: string;
  questionText: string;
  description?: string;
  upvotes: number;
  upvotedBy?: string[];
  repliesCount: number;
  createdAt: string;
  avatarColor?: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserLocation?: string;
  onUpvote?: (shouldUpvote: boolean) => Promise<void>;
}

export default function ChatCard({
  id,
  userName,
  userLocation,
  cropTag,
  cropEmoji,
  questionText,
  description,
  upvotes,
  upvotedBy = [],
  repliesCount,
  createdAt,
  avatarColor,
  currentUserId,
  currentUserName,
  currentUserLocation,
  onUpvote,
}: ChatCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(
    !!currentUserId && upvotedBy.includes(currentUserId)
  );
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [nestedReplies, setNestedReplies] = useState<NestedReply[]>([]);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localRepliesCount, setLocalRepliesCount] = useState(repliesCount);

  // Subscribe to replies when shown
  useEffect(() => {
    if (showReplies) {
      const unsubscribe = subscribeToReplies(
        id,
        (fetchedReplies) => {
          setReplies(fetchedReplies);
          setLocalRepliesCount(fetchedReplies.length);
        },
        (error) => {
          console.error('Error loading replies:', error);
        }
      );
      return () => unsubscribe();
    }
  }, [id, showReplies]);

  // Organize replies into nested structure
  useEffect(() => {
    const organizeReplies = (replies: CommunityReply[]): NestedReply[] => {
      const replyMap = new Map<string, NestedReply>();
      const rootReplies: NestedReply[] = [];

      // Create a map of all replies
      replies.forEach((reply) => {
        replyMap.set(reply.id, {
          ...reply,
          children: [],
        });
      });

      // Build the tree structure
      replies.forEach((reply) => {
        const nestedReply = replyMap.get(reply.id);
        if (!nestedReply) return;

        if (!reply.parentReplyId) {
          // This is a root-level reply
          rootReplies.push(nestedReply);
        } else {
          // This is a nested reply
          const parent = replyMap.get(reply.parentReplyId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(nestedReply);
          } else {
            // Parent not found, treat as root
            rootReplies.push(nestedReply);
          }
        }
      });

      return rootReplies;
    };

    setNestedReplies(organizeReplies(replies));
  }, [replies]);

  useEffect(() => {
    setLocalUpvotes(upvotes);
  }, [upvotes]);

  useEffect(() => {
    setHasUpvoted(!!currentUserId && upvotedBy.includes(currentUserId));
  }, [currentUserId, upvotedBy]);

  // Get first letter of farmer name for avatar
  const avatarLetter = userName.charAt(0).toUpperCase();

  // Generate avatar background color if not provided
  const bgColor = avatarColor || `hsl(${userName.charCodeAt(0) * 10}, 70%, 60%)`;

  const handleUpvote = async () => {
    if (!currentUserId || !onUpvote) {
      alert('Please sign in to upvote.');
      return;
    }

    const shouldUpvote = !hasUpvoted;
    const previousUpvotes = localUpvotes;
    const previousHasUpvoted = hasUpvoted;

    setHasUpvoted(shouldUpvote);
    setLocalUpvotes((prev) => prev + (shouldUpvote ? 1 : -1));

    try {
      await onUpvote(shouldUpvote);
    } catch (error) {
      console.error('Error toggling question upvote:', error);
      setHasUpvoted(previousHasUpvoted);
      setLocalUpvotes(previousUpvotes);
      alert('Failed to update upvote. Please try again.');
    }
  };

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleAddReply = async (parentReplyId: string | null, text: string) => {
    if (!currentUserId || !currentUserName || !currentUserLocation) {
      alert('Please sign in to reply.');
      return;
    }

    try {
      await addReply(id, {
        userId: currentUserId,
        userName: currentUserName,
        userLocation: currentUserLocation,
        replyText: text,
        parentReplyId: parentReplyId,
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  };

  const handleSubmitMainReply = async () => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await handleAddReply(null, replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
    } catch (error) {
      alert('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyUpvote = async (replyId: string, shouldUpvote: boolean) => {
    if (!currentUserId) {
      throw new Error('Please sign in to upvote');
    }

    if (shouldUpvote) {
      await upvoteReply(id, replyId, currentUserId);
      return;
    }

    await removeUpvoteReply(id, replyId, currentUserId);
  };

  return (
    <div className="bg-white border-2 border-krishi-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-4 md:p-5">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          >
            {avatarLetter}
          </div>

          {/* User Info and Crop Tag */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-krishi-heading text-sm sm:text-base">{userName}</h3>
              <span className="text-krishi-text/40 text-xs">•</span>
              <span className="text-krishi-text/70 text-xs sm:text-sm">{createdAt}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-krishi-text/70 text-xs sm:text-sm flex items-center gap-1">
                📍 {userLocation}
              </span>
              <span className="bg-krishi-agriculture text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                {cropEmoji && <span>{cropEmoji}</span>}
                {cropTag}
              </span>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-3">
          <p className="text-krishi-text font-medium text-sm sm:text-base mb-2 leading-relaxed">
            {questionText}
          </p>
          {description && (
            <p className="text-krishi-text/80 text-xs sm:text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2 border-t border-krishi-border">
          {/* Upvote Button */}
          <motion.button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              hasUpvoted
                ? 'text-krishi-primary'
                : 'text-krishi-text/70 hover:text-krishi-primary'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-base">{hasUpvoted ? '👍' : '👍'}</span>
            <span>{localUpvotes}</span>
          </motion.button>

          {/* Reply Button */}
          <motion.button
            onClick={handleReplyClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-krishi-border text-krishi-text hover:bg-krishi-primary hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-base">💬</span>
            <span>Reply</span>
          </motion.button>

          {/* Show Replies Button */}
          {localRepliesCount > 0 && (
            <motion.button
              onClick={toggleReplies}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-krishi-text/70 hover:text-krishi-primary transition-colors ml-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="text-base"
                animate={{ rotate: showReplies ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showReplies ? '⬆' : '⬇'}
              </motion.span>
              <span>
                {showReplies ? 'Hide' : 'Show'} {localRepliesCount} {localRepliesCount === 1 ? 'Reply' : 'Replies'}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Reply Input at Card Level */}
      {showReplyInput && currentUserId && (
        <div className="bg-gray-50 border-t border-krishi-border px-4 py-3">
          <div className="space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-3 py-2 border border-krishi-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-krishi-primary focus:border-krishi-primary resize-none"
              rows={2}
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmitMainReply}
                disabled={!replyText.trim() || isSubmitting}
                className="px-4 py-2 bg-krishi-primary text-white text-sm font-medium rounded-md hover:bg-krishi-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyText('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies Section with Nested Structure */}
      {showReplies && nestedReplies.length > 0 && (
        <div className="bg-gray-50 border-t border-krishi-border px-4 py-3">
          <div className="space-y-0">
            {nestedReplies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                questionId={id}
                depth={0}
                maxDepth={2}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserLocation={currentUserLocation}
                onAddReply={handleAddReply}
                onUpvote={handleReplyUpvote}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

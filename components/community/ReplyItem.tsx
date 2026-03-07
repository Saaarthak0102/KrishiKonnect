'use client';

import React, { useEffect, useState } from 'react';
import { getShortTime } from '@/lib/timeUtils';

export interface NestedReply {
  id: string;
  userId: string;
  userName: string;
  userLocation: string;
  replyText: string;
  parentReplyId: string | null;
  upvotes: number;
  upvotedBy: string[];
  createdAt: Date;
  children?: NestedReply[];
}

interface ReplyItemProps {
  reply: NestedReply;
  questionId: string;
  depth: number;
  maxDepth: number;
  currentUserId?: string;
  currentUserName?: string;
  currentUserLocation?: string;
  onAddReply: (parentReplyId: string, replyText: string) => Promise<void>;
  onUpvote: (replyId: string, shouldUpvote: boolean) => Promise<void>;
}

export default function ReplyItem({
  reply,
  questionId,
  depth,
  maxDepth,
  currentUserId,
  currentUserName,
  currentUserLocation,
  onAddReply,
  onUpvote,
}: ReplyItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(
    !!currentUserId && reply.upvotedBy.includes(currentUserId)
  );
  const [localUpvotes, setLocalUpvotes] = useState(reply.upvotes);

  // Calculate indentation based on depth
  const getMarginClass = () => {
    if (depth === 0) return '';
    if (depth === 1) return 'ml-4 sm:ml-8';
    return 'ml-8 sm:ml-16';
  };

  useEffect(() => {
    setLocalUpvotes(reply.upvotes);
  }, [reply.upvotes]);

  useEffect(() => {
    setHasUpvoted(!!currentUserId && reply.upvotedBy.includes(currentUserId));
  }, [currentUserId, reply.upvotedBy]);

  const handleUpvote = async () => {
    if (!currentUserId) {
      alert('Please sign in to upvote.');
      return;
    }

    const shouldUpvote = !hasUpvoted;
    const previousUpvotes = localUpvotes;
    const previousHasUpvoted = hasUpvoted;

    setHasUpvoted(shouldUpvote);
    setLocalUpvotes((prev) => prev + (shouldUpvote ? 1 : -1));

    try {
      await onUpvote(reply.id, shouldUpvote);
    } catch (error) {
      console.error('Error toggling reply upvote:', error);
      setHasUpvoted(previousHasUpvoted);
      setLocalUpvotes(previousUpvotes);
      alert('Failed to update upvote. Please try again.');
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !currentUserId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddReply(reply.id, replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReply = depth < maxDepth && currentUserId;

  return (
    <div className={`${getMarginClass()} ${depth > 0 ? 'mt-3' : ''}`}>
      <div className="bg-white/65 backdrop-blur-sm rounded-md p-3 shadow-sm border-l-2 border-krishi-border">
        <div className="flex items-start gap-2 mb-2">
          {/* Reply Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
            style={{
              backgroundColor: `hsl(${reply.userName.charCodeAt(0) * 10}, 70%, 60%)`,
            }}
          >
            {reply.userName.charAt(0).toUpperCase()}
          </div>

          {/* Reply Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-krishi-indigo text-xs sm:text-sm">
                {reply.userName}
              </span>
              <span className="text-krishi-indigo/70 text-xs flex items-center gap-1">
                📍 {reply.userLocation}
              </span>
              <span className="text-krishi-indigo/40 text-xs">•</span>
              <span className="text-krishi-indigo/70 text-xs">{getShortTime(reply.createdAt)}</span>
            </div>
            <p className="text-krishi-indigo text-xs sm:text-sm mb-2 leading-relaxed">{reply.replyText}</p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpvote}
                className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  hasUpvoted
                    ? 'text-krishi-clay'
                    : 'text-krishi-indigo/70 hover:text-krishi-clay'
                }`}
              >
                <span>{hasUpvoted ? '👍' : '👍'}</span>
                <span>{localUpvotes}</span>
              </button>

              {canReply && (
                <button
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="text-xs font-medium text-krishi-indigo/70 hover:text-krishi-clay transition-colors"
                >
                  💬 Reply
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Input */}
        {showReplyInput && canReply && (
          <div className="mt-3 ml-10 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-3 py-2 border border-krishi-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-krishi-primary focus:border-krishi-clay resize-none"
              rows={2}
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || isSubmitting}
                className="px-3 py-1.5 bg-krishi-clay text-white text-xs font-medium rounded-md hover:bg-krishi-clay/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyText('');
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Children Replies */}
      {reply.children && reply.children.length > 0 && (
        <div className="space-y-0">
          {reply.children.map((childReply) => (
            <ReplyItem
              key={childReply.id}
              reply={childReply}
              questionId={questionId}
              depth={depth + 1}
              maxDepth={maxDepth}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserLocation={currentUserLocation}
              onAddReply={onAddReply}
              onUpvote={onUpvote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

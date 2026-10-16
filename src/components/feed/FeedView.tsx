"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FeedPost } from "@/lib/feed/visibility";
import { AlbumSearchModal } from "@/components/profile/AlbumSearchModal";

export interface PostReplyItem {
  id: string;
  postId: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    themeKey: string;
  };
}

export interface CurrentUserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  themeKey: string;
}

interface InteractivePostListProps {
  posts: FeedPost[];
  currentUser: CurrentUserSummary | null;
  onPostsChange?: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  variant?: "dark" | "light";
}

export function InteractivePostList({
  posts: externalPosts,
  currentUser,
  onPostsChange,
  variant = "dark",
}: InteractivePostListProps) {
  const router = useRouter();
  const [internalPosts, setInternalPosts] = useState<FeedPost[]>(externalPosts);

  const postsList = onPostsChange ? externalPosts : internalPosts;
  const setPostsList = onPostsChange || setInternalPosts;

  // Replies state per postId
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});
  const [repliesByPost, setRepliesByPost] = useState<Record<string, PostReplyItem[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({});
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  const isLight = variant === "light";

  const handleToggleLike = async (post: FeedPost) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const wasLiked = post.likedByMe;
    const newCount = wasLiked ? post.likesCount - 1 : post.likesCount + 1;

    setPostsList((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, likedByMe: !wasLiked, likesCount: newCount } : p
      )
    );

    try {
      await fetch(`/api/v1/posts/${post.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setPostsList((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likedByMe: wasLiked, likesCount: post.likesCount } : p
        )
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPostsList((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleMuteAuthor = async (authorId: string, username: string) => {
    setOpenMenuPostId(null);
    if (!confirm(`Mute @${username}? Their posts will be hidden from your feeds.`)) return;
    try {
      const res = await fetch(`/api/v1/users/${authorId}/mute`, { method: "POST" });
      if (res.ok) {
        setPostsList((prev) => prev.filter((p) => p.author.id !== authorId));
      }
    } catch (err) {
      console.error("Failed to mute user:", err);
    }
  };

  const handleBlockAuthor = async (authorId: string, username: string) => {
    setOpenMenuPostId(null);
    if (!confirm(`Block @${username}? They will not be able to interact with you.`)) return;
    try {
      const res = await fetch(`/api/v1/users/${authorId}/block`, { method: "POST" });
      if (res.ok) {
        setPostsList((prev) => prev.filter((p) => p.author.id !== authorId));
      }
    } catch (err) {
      console.error("Failed to block user:", err);
    }
  };

  const toggleReplies = async (postId: string) => {
    const isCurrentlyOpen = Boolean(expandedPostIds[postId]);
    setExpandedPostIds((prev) => ({ ...prev, [postId]: !isCurrentlyOpen }));

    if (!isCurrentlyOpen && !repliesByPost[postId]) {
      setLoadingReplies((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await fetch(`/api/v1/posts/${postId}/replies`);
        if (res.ok) {
          const data = await res.json();
          setRepliesByPost((prev) => ({ ...prev, [postId]: data.replies || [] }));
        }
      } catch (err) {
        console.error("Failed to load replies:", err);
      } finally {
        setLoadingReplies((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleCreateReply = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const text = (replyDrafts[postId] || "").trim();
    if (!text) return;

    setSubmittingReply((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/v1/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setRepliesByPost((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.reply],
        }));
        setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
        setPostsList((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, repliesCount: (p.repliesCount || 0) + 1 } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to create reply:", err);
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/replies/${replyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRepliesByPost((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((r) => r.id !== replyId),
        }));
        setPostsList((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, repliesCount: Math.max(0, (p.repliesCount || 1) - 1) }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
  };

  return (
    <div className="space-y-4">
      {postsList.map((post) => {
        const isRepliesOpen = Boolean(expandedPostIds[post.id]);
        const replies = repliesByPost[post.id] || [];
        const isLoadingReplies = Boolean(loadingReplies[post.id]);
        const draft = replyDrafts[post.id] || "";
        const isSubmitting = Boolean(submittingReply[post.id]);

        return (
          <article
            key={post.id}
            className={`rounded-2xl p-5 transition-colors border ${
              isLight
                ? "border-black/10 bg-black/[0.03] hover:border-black/20"
                : "border-white/10 bg-[#161614]/70 backdrop-blur-sm hover:border-white/20"
            }`}
          >
            {/* Author row */}
            <div className="flex items-center justify-between mb-3">
              <Link
                href={`/@${post.author.username}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFE600] flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                  {post.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.author.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    post.author.displayName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4
                    className={`text-sm font-medium transition-colors leading-tight ${
                      isLight
                        ? "text-black group-hover:opacity-70"
                        : "text-white group-hover:text-[#FFE600]"
                    }`}
                  >
                    {post.author.displayName}
                  </h4>
                  <span className="text-[11px] font-mono opacity-50">
                    @{post.author.username}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2 relative">
                <span className="text-[10px] font-mono opacity-40">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {currentUser?.id === post.author.id && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-xs font-mono text-red-500/70 hover:text-red-500 px-1.5 py-0.5 ml-1 transition-colors cursor-pointer"
                    title="Delete post"
                  >
                    ✕
                  </button>
                )}
                {currentUser && currentUser.id !== post.author.id && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)
                      }
                      className="text-xs font-mono opacity-50 hover:opacity-100 px-1.5 py-0.5 rounded cursor-pointer"
                      title="More actions"
                    >
                      •••
                    </button>
                    {openMenuPostId === post.id && (
                      <div className="absolute right-0 mt-1 w-36 rounded-xl border border-white/15 bg-[#1C1C19] text-[#E6E5DF] shadow-xl py-1 z-20 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() =>
                            handleMuteAuthor(post.author.id, post.author.username)
                          }
                          className="w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          Mute @{post.author.username}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleBlockAuthor(post.author.id, post.author.username)
                          }
                          className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          Block @{post.author.username}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Target album tags */}
            {post.albums.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.albums.map((alb) => (
                  <Link
                    key={alb.id}
                    href={`/album/${alb.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-0.5 text-[11px] font-mono transition-colors border ${
                      isLight
                        ? "bg-black/5 hover:bg-black/10 border-black/15 text-black"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-[#FFE600]"
                    }`}
                  >
                    {alb.defaultCoverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={alb.defaultCoverUrl}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full object-cover"
                      />
                    )}
                    <span>#{alb.title}</span>
                  </Link>
                ))}
                {post.isPublic && (
                  <span className="text-[10px] font-mono opacity-40 self-center">
                    #public
                  </span>
                )}
              </div>
            )}

            {/* Body */}
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap mb-4 font-light ${
                isLight ? "text-black/90" : "text-white/90"
              }`}
            >
              {post.body}
            </p>

            {/* Bottom stats row */}
            <div
              className={`flex items-center justify-between pt-3 border-t text-xs font-mono ${
                isLight ? "border-black/10" : "border-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleLike(post)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    post.likedByMe
                      ? "text-red-500 bg-red-500/10 font-bold"
                      : "opacity-60 hover:opacity-100 hover:bg-black/5"
                  }`}
                >
                  <span>{post.likedByMe ? "♥" : "♡"}</span>
                  <span>{post.likesCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleReplies(post.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isRepliesOpen
                      ? "opacity-100 font-bold bg-black/10"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <span>💬</span>
                  <span>{post.repliesCount || 0}</span>
                  <span className="text-[10px]">
                    {post.repliesCount === 1 ? "Reply" : "Replies"}
                  </span>
                </button>
              </div>

              <span className="text-[10px] opacity-30">album-first social</span>
            </div>

            {/* Expandable Inline Replies Section */}
            {isRepliesOpen && (
              <div
                className={`mt-4 pt-4 border-t space-y-3 ${
                  isLight ? "border-black/10" : "border-white/10"
                }`}
              >
                {isLoadingReplies ? (
                  <p className="text-xs font-mono opacity-50 py-2">
                    Loading replies...
                  </p>
                ) : replies.length === 0 ? (
                  <p className="text-xs font-mono opacity-40 py-1">
                    No replies yet. Start the conversation below.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`rounded-xl p-3 text-xs border ${
                          isLight
                            ? "bg-white/50 border-black/10"
                            : "bg-black/30 border-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Link
                            href={`/@${reply.author.username}`}
                            className="font-mono font-medium hover:underline flex items-center gap-1.5"
                          >
                            <span>{reply.author.displayName}</span>
                            <span className="opacity-50">
                              @{reply.author.username}
                            </span>
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] opacity-40">
                              {new Date(reply.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            {currentUser?.id === reply.author.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteReply(post.id, reply.id)
                                }
                                className="text-[10px] font-mono text-red-400/70 hover:text-red-400 cursor-pointer"
                                title="Delete reply"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="opacity-90 whitespace-pre-wrap leading-relaxed">
                          {reply.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {currentUser ? (
                  <form
                    onSubmit={(e) => handleCreateReply(e, post.id)}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={draft}
                      maxLength={500}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Write a reply..."
                      className={`flex-1 rounded-lg px-3 py-1.5 text-xs border focus:outline-none ${
                        isLight
                          ? "bg-white/70 border-black/20 text-black placeholder:text-black/40"
                          : "bg-white/5 border-white/15 text-white placeholder:text-white/30"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !draft.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#FFE600] text-black hover:bg-[#F2DA00] disabled:opacity-40 cursor-pointer"
                    >
                      {isSubmitting ? "..." : "Reply"}
                    </button>
                  </form>
                ) : (
                  <p className="text-[11px] font-mono opacity-50">
                    <Link href="/login" className="underline">
                      Sign in
                    </Link>{" "}
                    to reply to this discussion.
                  </p>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

interface FeedViewProps {
  currentUser: CurrentUserSummary | null;
  initialPosts: FeedPost[];
  initialType: "for-you" | "global";
}

export function FeedView({
  currentUser,
  initialPosts,
  initialType,
}: FeedViewProps) {
  const [feedType, setFeedType] = useState<"for-you" | "global">(initialType);
  const [postsList, setPostsList] = useState<FeedPost[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialPosts.length >= 20
      ? new Date(initialPosts[initialPosts.length - 1].createdAt).toISOString()
      : null
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // New post form state
  const [bodyText, setBodyText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [taggedAlbums, setTaggedAlbums] = useState<
    { id: string; title: string; artistName: string; coverUrl: string }[]
  >([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Tag album modal state
  const [isTaggingAlbum, setIsTaggingAlbum] = useState(false);

  const switchFeedType = async (type: "for-you" | "global") => {
    setFeedType(type);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/feed?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        const loaded: FeedPost[] = data.posts || [];
        setPostsList(loaded);
        setNextCursor(loaded.length >= 20 ? data.nextCursor : null);
      }
    } catch (err) {
      console.error("Failed to load feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/v1/feed?type=${feedType}&cursor=${encodeURIComponent(nextCursor)}`
      );
      if (res.ok) {
        const data = await res.json();
        const loaded: FeedPost[] = data.posts || [];
        setPostsList((prev) => [...prev, ...loaded]);
        setNextCursor(loaded.length >= 20 ? data.nextCursor : null);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);

    if (!bodyText.trim()) return;
    if (!isPublic && taggedAlbums.length === 0) {
      setPostError("Select at least one audience: mark #public or tag an album.");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: bodyText,
          isPublic,
          albumIds: taggedAlbums.map((a) => a.id),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish post.");
      }

      setBodyText("");
      setTaggedAlbums([]);
      setIsPublic(true);

      await switchFeedType(feedType);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPostError(err.message);
      } else {
        setPostError("Failed to publish post.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddAlbumTag = async (albumId: string, coverUrl: string) => {
    if (taggedAlbums.length >= 3) return;
    if (taggedAlbums.some((a) => a.id === albumId)) return;

    try {
      const res = await fetch(`/api/v1/catalog/albums/${albumId}/covers`);
      const data = res.ok ? await res.json() : null;
      const title = data?.editions?.[0]?.title || "Album";

      setTaggedAlbums((prev) => [
        ...prev,
        { id: albumId, title, artistName: "", coverUrl },
      ]);
    } catch {
      setTaggedAlbums((prev) => [
        ...prev,
        { id: albumId, title: "Tagged Album", artistName: "", coverUrl },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#11110F] text-[#E6E5DF] font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-30 bg-[#11110F]/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-medium tracking-tight text-sm hover:opacity-80 transition-opacity"
          >
            <span className="w-3 h-3 rounded-[2px] bg-[#FFE600]" />
            <span>musi5t</span>
          </Link>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <Link
                  href="/settings"
                  className="text-xs font-mono opacity-70 hover:opacity-100 transition-opacity"
                >
                  Settings
                </Link>
                <Link
                  href={`/@${currentUser.username}`}
                  className="flex items-center gap-2 text-xs font-mono opacity-80 hover:opacity-100 transition-opacity border border-white/15 rounded-full px-3 py-1"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FFE600]" />
                  <span>@{currentUser.username}</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="text-xs font-mono uppercase bg-[#FFE600] text-black px-4 py-1.5 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Create Post Box (only if logged in) */}
        {currentUser ? (
          <section className="mb-8 border border-white/10 bg-[#161614] rounded-2xl p-5 shadow-xl">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFE600] flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                  {currentUser.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value.slice(0, 500))}
                    placeholder="Talk records. What are you listening to right now?"
                    className="w-full bg-transparent text-sm text-[#E6E5DF] placeholder:text-white/30 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Tagged albums preview */}
              {taggedAlbums.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {taggedAlbums.map((alb) => (
                    <div
                      key={alb.id}
                      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-1.5 pr-2.5 py-1 text-xs font-mono"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={alb.coverUrl}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[#FFE600]">#{alb.title}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setTaggedAlbums(taggedAlbums.filter((a) => a.id !== alb.id))
                        }
                        className="opacity-50 hover:opacity-100 text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {postError && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-200">
                  {postError}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {/* Public audience pill */}
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                      isPublic
                        ? "bg-[#FFE600] text-black font-medium"
                        : "bg-white/5 text-white/40 hover:text-white/70 border border-white/10"
                    }`}
                  >
                    #public
                  </button>

                  {/* Add Album pill */}
                  {taggedAlbums.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setIsTaggingAlbum(true)}
                      className="px-3 py-1 rounded-full text-xs font-mono border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                    >
                      + #album
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono opacity-40">
                    {bodyText.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={isPublishing || !bodyText.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#FFE600] text-black hover:bg-[#F2DA00] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-md"
                  >
                    {isPublishing ? "Posting..." : "Publish"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        ) : (
          <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-[#161614] text-center">
            <p className="text-sm text-white/70 mb-3">
              Join the conversation. Sign in to curate your Top 5 and publish posts to kindred listeners.
            </p>
            <Link
              href="/register"
              className="inline-block px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase bg-[#FFE600] text-black hover:scale-105 transition-transform"
            >
              Create Account
            </Link>
          </div>
        )}

        {/* Feed Type Switcher Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => switchFeedType("for-you")}
            className={`text-sm font-medium transition-colors cursor-pointer pb-2 -mb-3 relative ${
              feedType === "for-you" ? "text-[#FFE600]" : "text-white/40 hover:text-white/70"
            }`}
          >
            For You
            {feedType === "for-you" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFE600]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => switchFeedType("global")}
            className={`text-sm font-medium transition-colors cursor-pointer pb-2 -mb-3 relative ${
              feedType === "global" ? "text-[#FFE600]" : "text-white/40 hover:text-white/70"
            }`}
          >
            Global
            {feedType === "global" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFE600]" />
            )}
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-16 font-mono text-xs opacity-50 animate-pulse">
            Loading discussions...
          </div>
        ) : postsList.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-sm opacity-50 mb-1">No posts found in this feed yet.</p>
            <p className="text-xs opacity-30 font-mono">
              {feedType === "for-you"
                ? "Follow users or curate albums into your Top 5 to see relevant discussions."
                : "Be the first to share a thought!"}
            </p>
          </div>
        ) : (
          <>
            <InteractivePostList
              posts={postsList}
              currentUser={currentUser}
              onPostsChange={setPostsList}
              variant="dark"
            />

            {nextCursor && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-full text-xs font-mono uppercase border border-white/15 hover:border-white/40 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Album Tagging Modal */}
      {isTaggingAlbum && (
        <AlbumSearchModal
          isOpen={true}
          position={taggedAlbums.length + 1}
          onClose={() => setIsTaggingAlbum(false)}
          onSelectAlbum={handleAddAlbumTag}
          accentColor="#FFE600"
        />
      )}
    </div>
  );
}

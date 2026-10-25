"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import type { FeedPost } from "@/lib/feed/visibility";
import { AlbumSearchModal } from "@/components/profile/AlbumSearchModal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { MobileMenuButton, MobileNavDrawer } from "@/components/ui/MobileNavDrawer";

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
    <div>
      {postsList.map((post) => {
        const isRepliesOpen = Boolean(expandedPostIds[post.id]);
        const replies = repliesByPost[post.id] || [];
        const isLoadingReplies = Boolean(loadingReplies[post.id]);
        const draft = replyDrafts[post.id] || "";
        const isSubmitting = Boolean(submittingReply[post.id]);

        return (
          <article
            key={post.id}
            className="bg-primary text-secondary border border-secondary/15 rounded-[0.5vw] drop-shadow-soft p-[3.5vw] sm:p-[2vw] mb-[2.5vw] sm:mb-[1.5vw] transition-colors hover:border-secondary/25"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <Link
                href={`/@${post.author.username}`}
                className="flex items-center gap-[2.5vw] sm:gap-[0.8vw] group"
              >
                <div className="w-[7vw] sm:w-[2.4vw] aspect-square rounded-[0.3vw] overflow-hidden flex items-center justify-center extraSmallTextBold flex-shrink-0 drop-shadow">
                  <UserAvatar
                    avatarUrl={post.author.avatarUrl}
                    displayName={post.author.displayName}
                    themeKey={post.author.themeKey}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="smallText font-medium text-secondary group-hover:underline leading-tight">
                    {post.author.displayName}
                  </span>
                  <span className="extraSmallText text-secondary/50 leading-tight">
                    @{post.author.username}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw] relative">
                {post.isPublic && (
                  <span className="detailText text-secondary/35 hidden sm:inline">
                    #public
                  </span>
                )}
                <span className="detailText text-secondary/40">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                {currentUser?.id === post.author.id && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="extraSmallText text-secondary/40 hover:text-red-600 px-[1vw] py-[0.3vw] sm:px-[0.4vw] sm:py-[0.15vw] transition-colors cursor-pointer"
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
                      className="extraSmallText text-secondary/50 hover:text-secondary px-[1.2vw] py-[0.4vw] sm:px-[0.5vw] sm:py-[0.2vw] rounded-[0.25vw] hover:bg-secondary/5 transition-colors cursor-pointer"
                      title="More actions"
                    >
                      •••
                    </button>
                    {openMenuPostId === post.id && (
                      <div className="absolute right-0 mt-[0.5vw] w-[42vw] sm:w-[12vw] rounded-[0.4vw] border border-secondary/15 bg-primary text-secondary drop-shadow py-[0.6vw] sm:py-[0.35vw] z-20">
                        <button
                          type="button"
                          onClick={() =>
                            handleMuteAuthor(post.author.id, post.author.username)
                          }
                          className="w-full text-left px-[2.5vw] py-[1.2vw] sm:px-[0.8vw] sm:py-[0.45vw] extraSmallText text-secondary hover:bg-secondary/5 transition-colors cursor-pointer"
                        >
                          Mute @{post.author.username}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleBlockAuthor(post.author.id, post.author.username)
                          }
                          className="w-full text-left px-[2.5vw] py-[1.2vw] sm:px-[0.8vw] sm:py-[0.45vw] extraSmallText text-red-600 hover:bg-secondary/5 transition-colors cursor-pointer"
                        >
                          Block @{post.author.username}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Post Body */}
            <p className="smallText text-secondary leading-relaxed whitespace-pre-wrap mt-[1.5vw] sm:mt-[0.8vw]">
              {post.body}
            </p>

            {/* Tagged Albums */}
            {post.albums.length > 0 && (
              <div className="flex flex-wrap gap-[1.5vw] sm:gap-[0.6vw]">
                {post.albums.map((alb) => (
                  <Link
                    key={alb.id}
                    href={`/album/${alb.id}`}
                    className="flex items-center gap-[1vw] sm:gap-[0.5vw] bg-secondary/5 hover:bg-secondary/10 border border-secondary/15 rounded-[0.3vw] p-[1.5vw] sm:p-[0.6vw] mt-[2vw] sm:mt-[1vw] w-fit cursor-pointer transition-colors"
                  >
                    <div className="w-[6vw] sm:w-[2vw] aspect-square rounded-[0.2vw] overflow-hidden bg-secondary/10 flex-shrink-0 drop-shadow">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={alb.defaultCoverUrl || "/images/musi5t/vinyl_player.webp"}
                        alt={alb.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col pr-[1vw] sm:pr-[0.4vw]">
                      <span className="extraSmallTextBold text-secondary leading-tight">
                        {alb.title}
                      </span>
                      {alb.artistName && (
                        <span className="detailText text-secondary/60 leading-tight">
                          {alb.artistName}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-[2.5vw] sm:pt-[1.2vw] mt-[2.5vw] sm:mt-[1.2vw] border-t border-secondary/10">
              <div className="flex items-center gap-[3vw] sm:gap-[1.2vw]">
                <button
                  type="button"
                  onClick={() => handleToggleLike(post)}
                  className={`extraSmallText flex items-center gap-[0.5vw] transition-colors cursor-pointer ${
                    post.likedByMe
                      ? "text-red-600 font-medium"
                      : "text-secondary/70 hover:text-red-600"
                  }`}
                >
                  <span>{post.likedByMe ? "♥" : "♡"}</span>
                  <span>{post.likesCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleReplies(post.id)}
                  className={`extraSmallText flex items-center gap-[0.5vw] transition-colors cursor-pointer ${
                    isRepliesOpen
                      ? "text-secondary font-medium"
                      : "text-secondary/70 hover:text-secondary"
                  }`}
                >
                  <span>💬</span>
                  <span>{post.repliesCount || 0}</span>
                  <span>
                    {post.repliesCount === 1 ? "reply" : "replies"}
                  </span>
                </button>
              </div>

              <span className="detailText text-secondary/35">listener note</span>
            </div>

            {/* Inline Replies Section */}
            {isRepliesOpen && (
              <div className="border-t border-secondary/10 pt-[2vw] sm:pt-[1.2vw] mt-[2vw] sm:mt-[1.2vw]">
                {isLoadingReplies ? (
                  <p className="extraSmallText text-secondary/50 py-[1vw] sm:py-[0.5vw]">
                    Loading replies...
                  </p>
                ) : replies.length === 0 ? (
                  <p className="extraSmallText text-secondary/45 pb-[1.5vw] sm:pb-[0.8vw]">
                    No replies yet. Start the conversation below.
                  </p>
                ) : (
                  <div className="mb-[2vw] sm:mb-[1vw]">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="bg-secondary/[0.03] border border-secondary/10 rounded-[0.3vw] p-[2vw] sm:p-[1vw] mb-[1.5vw] sm:mb-[0.8vw] text-secondary"
                      >
                        <div className="flex items-center justify-between mb-[0.8vw] sm:mb-[0.4vw]">
                          <Link
                            href={`/@${reply.author.username}`}
                            className="flex items-center gap-[1.5vw] sm:gap-[0.5vw] hover:underline"
                          >
                            <div className="w-[5vw] h-[5vw] sm:w-[1.6vw] sm:h-[1.6vw] rounded-[0.2vw] overflow-hidden flex items-center justify-center shrink-0 drop-shadow">
                              <UserAvatar
                                avatarUrl={reply.author.avatarUrl}
                                displayName={reply.author.displayName}
                                themeKey={reply.author.themeKey}
                                textClassName="text-[2vw] sm:text-[0.6vw]"
                              />
                            </div>
                            <span className="extraSmallTextBold text-secondary">
                              {reply.author.displayName}
                            </span>
                            <span className="detailText text-secondary/50">
                              @{reply.author.username}
                            </span>
                          </Link>
                          <div className="flex items-center gap-[1vw] sm:gap-[0.5vw]">
                            <span className="detailText text-secondary/40">
                              {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {currentUser?.id === reply.author.id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReply(post.id, reply.id)}
                                className="detailText text-secondary/40 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete reply"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="extraSmallText text-secondary/90 whitespace-pre-wrap leading-relaxed">
                          {reply.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {currentUser ? (
                  <form
                    onSubmit={(e) => handleCreateReply(e, post.id)}
                    className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]"
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
                      className="flex-1 bg-primary border border-secondary/20 rounded-[0.3vw] px-[2vw] py-[1.2vw] sm:px-[0.8vw] sm:py-[0.5vw] extraSmallText text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-secondary transition-colors"
                    />
                    <div className="drop-shadow rounded-[0.25vw]">
                      <button
                        type="submit"
                        disabled={isSubmitting || !draft.trim()}
                        className="main-btn smallText text-secondary disabled:opacity-40 cursor-pointer"
                      >
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">
                              {isSubmitting ? "..." : "Reply"}
                            </span>
                            <span className="main-btn__to" aria-hidden="true">
                              {isSubmitting ? "..." : "Reply"}
                            </span>
                          </span>
                        </span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="extraSmallText text-secondary/55">
                    <Link href="/login" className="underline hover:text-secondary">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lenis refs
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Lenis smooth scroll initialization (matching LandingPageClient & ProfileView)
  useEffect(() => {
    const mainEl = mainRef.current;
    const contentEl = contentRef.current;
    if (!mainEl || !contentEl) return;

    const lenis = new Lenis({
      wrapper: mainEl,
      content: contentEl,
      lerp: 0.18,
      wheelMultiplier: 1.05,
      smoothWheel: true,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const cleanupNav = setupNavColorTriggers(mainEl);

    const rafHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cleanupNav();
      gsap.ticker.remove(rafHandler);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Stop Lenis background scroll when AlbumSearchModal or MobileNavDrawer is open
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (isTaggingAlbum || isMobileMenuOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isTaggingAlbum, isMobileMenuOpen]);

  const scrollTo = (hash: string) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(hash, { duration: 1.2 });
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  const handleAddAlbumTag = async (
    albumId: string,
    coverUrl: string,
    _coverReleaseMbid: string | null,
    albumMeta?: { title: string; artistName: string }
  ) => {
    if (taggedAlbums.length >= 3) return;
    if (taggedAlbums.some((a) => a.id === albumId)) return;

    if (albumMeta?.title) {
      setTaggedAlbums((prev) => [
        ...prev,
        {
          id: albumId,
          title: albumMeta.title,
          artistName: albumMeta.artistName || "",
          coverUrl,
        },
      ]);
      return;
    }

    try {
      const res = await fetch(`/api/v1/catalog/albums/${albumId}/covers`);
      const data = res.ok ? await res.json() : null;
      const title = data?.album?.title || data?.editions?.[0]?.title || "Album";
      const artistName = data?.album?.artistName || "";

      setTaggedAlbums((prev) => [
        ...prev,
        { id: albumId, title, artistName, coverUrl },
      ]);
    } catch {
      setTaggedAlbums((prev) => [
        ...prev,
        { id: albumId, title: "Tagged Album", artistName: "", coverUrl },
      ]);
    }
  };

  return (
    <div className="site-frame text-secondary">
      <div className="site-layout">
        <div className="app">
          <div className="route-surface">
            {/* Editorial Fixed Header (matching Home & ProfileView) */}
            <header className="header">
              <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
                {/* Brand Wordmark */}
                <div className="mediumText col-span-3 sm:col-span-3 flex justify-start items-center">
                  <Link
                    href={currentUser ? "/feed" : "/"}
                    className="nav-btn cursor-pointer text-left"
                  >
                    musi5t
                  </Link>
                </div>

                {/* Center Navigation Group */}
                <div className="smallText col-span-5 justify-center items-center hidden sm:flex">
                  <span className="nav-group flex items-center gap-[0.5vw]">
                    <button
                      type="button"
                      onClick={() => {
                        switchFeedType("for-you");
                        scrollTo("#feed-top");
                      }}
                      className="nav-btn cursor-pointer"
                    >
                      Feed
                    </button>
                    <span className="opacity-35">•</span>
                    <Link href="/lists" className="nav-btn cursor-pointer">
                      Lists
                    </Link>
                    <span className="opacity-35">•</span>
                    <Link href="/rankings" className="nav-btn cursor-pointer">
                      Rankings
                    </Link>
                    <span className="opacity-35">•</span>
                    <Link href="/releases" className="nav-btn cursor-pointer">
                      Releases
                    </Link>
                  </span>
                </div>

                {/* Right Actions */}
                <div className="col-span-3 sm:col-span-4 flex justify-end items-center gap-[2vw] sm:gap-[1vw]">
                  {currentUser ? (
                    <>
                      <Link
                        href="/settings"
                        className="hidden sm:inline-block opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
                      >
                        Settings
                      </Link>
                      <div className="hidden sm:inline-block">
                        <LogoutButton className="opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity cursor-pointer" />
                      </div>
                      <Link
                        href={`/@${currentUser.username}`}
                        className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full overflow-hidden border border-secondary/25 hover:border-secondary transition-all drop-shadow flex items-center justify-center shrink-0 group"
                        title={`@${currentUser.username}`}
                      >
                        <UserAvatar
                          avatarUrl={currentUser.avatarUrl}
                          displayName={currentUser.displayName || currentUser.username}
                          themeKey={currentUser.themeKey}
                          textClassName="text-[3.2vw] sm:text-[0.8vw] font-bold leading-none"
                        />
                      </Link>
                      <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="hidden sm:inline-block text-secondary/60 hover:text-secondary text-[3.2vw] sm:text-[0.85vw] font-medium transition-colors"
                      >
                        Sign in
                      </Link>
                      <div className="hidden sm:block drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                        <Link href="/register" className="main-btn smallText">
                          <span className="main-btn__icon" aria-hidden="true" />
                          <span className="main-btn__label">
                            <span className="main-btn__clip">
                              <span className="main-btn__from">Join musi5t</span>
                              <span className="main-btn__to" aria-hidden="true">
                                Join musi5t
                              </span>
                            </span>
                          </span>
                        </Link>
                      </div>
                      <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Scrollable Container managed by Lenis */}
            <main
              id="swup"
              ref={mainRef}
              className="transition-swup hide-scrollbar bg-primary text-secondary"
              tabIndex={-1}
            >
              <div ref={contentRef} className="layout-content bg-primary text-secondary">
                {/* Main Feed Section */}
                <section
                  id="feed-top"
                  data-nav-color="secondary"
                  className="w-full min-h-lvh pt-[22vw] sm:pt-[9vw] pb-[10vw] sm:pb-[6vw]"
                >
                  <div className="layout-grid">
                    {/* Center Responsive Editorial Feed Column */}
                    <div className="col-span-full sm:col-start-3 sm:col-span-8">
                      {/* Feed Header & Switcher Tabs */}
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[3vw] sm:gap-[1.5vw] pb-[3.5vw] sm:pb-[1.8vw] mb-[4vw] sm:mb-[2.5vw] border-b border-secondary/15">
                        <div className="flex items-center gap-[2vw] sm:gap-[1vw]">
                          <div className="drop-shadow rounded-[0.25vw]">
                            <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                          </div>
                          <h1 className="largeText lowercase">discussions</h1>
                        </div>

                        {/* Feed Switcher Tabs (for you / global) */}
                        <div className="flex items-center gap-[4vw] sm:gap-[1.5vw]">
                          <button
                            type="button"
                            onClick={() => switchFeedType("for-you")}
                            className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                              feedType === "for-you"
                                ? "text-secondary font-medium border-secondary"
                                : "text-secondary/40 hover:text-secondary/75 border-transparent"
                            }`}
                          >
                            {feedType === "for-you" && (
                              <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                            )}
                            <span>for you</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => switchFeedType("global")}
                            className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                              feedType === "global"
                                ? "text-secondary font-medium border-secondary"
                                : "text-secondary/40 hover:text-secondary/75 border-transparent"
                            }`}
                          >
                            {feedType === "global" && (
                              <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                            )}
                            <span>global</span>
                          </button>
                        </div>
                      </div>

                      {/* Post Composer (Create Post Box) */}
                      {currentUser ? (
                        <div className="bg-primary border border-secondary/15 rounded-[0.5vw] drop-shadow-soft p-[3vw] sm:p-[1.8vw] mb-[4vw] sm:mb-[2.5vw]">
                          <form onSubmit={handleCreatePost}>
                            <div className="flex items-start gap-[2.5vw] sm:gap-[1vw]">
                              <div className="w-[7vw] sm:w-[2.4vw] aspect-square rounded-[0.3vw] overflow-hidden flex items-center justify-center flex-shrink-0 drop-shadow">
                                <UserAvatar
                                  avatarUrl={currentUser.avatarUrl}
                                  displayName={currentUser.displayName || currentUser.username}
                                  themeKey={currentUser.themeKey}
                                  textClassName="extraSmallTextBold leading-none"
                                />
                              </div>

                              <div className="flex-1">
                                <textarea
                                  rows={3}
                                  value={bodyText}
                                  onChange={(e) =>
                                    setBodyText(e.target.value.slice(0, 500))
                                  }
                                  placeholder="Talk records. What are you listening to right now?"
                                  className="w-full smallText text-secondary placeholder:text-secondary/35 bg-transparent border-0 focus:outline-none resize-none"
                                />
                              </div>
                            </div>

                            {/* Tagged Albums Preview */}
                            {taggedAlbums.length > 0 && (
                              <div className="flex flex-wrap gap-[1.5vw] sm:gap-[0.6vw] pt-[2vw] sm:pt-[1vw] mt-[2vw] sm:mt-[0.8vw] border-t border-secondary/10">
                                {taggedAlbums.map((alb) => (
                                  <div
                                    key={alb.id}
                                    className="flex items-center gap-[0.5vw] bg-secondary/5 border border-secondary/15 rounded-[0.3vw] px-[1vw] py-[0.5vw] sm:px-[0.5vw] sm:py-[0.25vw] extraSmallText text-secondary font-medium"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={alb.coverUrl}
                                      alt={alb.title}
                                      className="w-[4vw] h-[4vw] sm:w-[1.2vw] sm:h-[1.2vw] rounded-[0.15vw] object-cover flex-shrink-0"
                                    />
                                    <span>#{alb.title}</span>
                                    {alb.artistName && (
                                      <span className="detailText text-secondary/55">
                                        — {alb.artistName}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTaggedAlbums(
                                          taggedAlbums.filter((a) => a.id !== alb.id)
                                        )
                                      }
                                      className="text-secondary/45 hover:text-secondary ml-[0.5vw] sm:ml-[0.2vw] cursor-pointer"
                                      title="Remove album tag"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {postError && (
                              <div className="mt-[2vw] sm:mt-[0.8vw] p-[2vw] sm:p-[0.8vw] bg-red-500/10 border border-red-500/25 rounded-[0.3vw] extraSmallText text-red-700">
                                {postError}
                              </div>
                            )}

                            {/* Composer Actions Bar */}
                            <div className="flex items-center justify-between pt-[2.5vw] sm:pt-[1.2vw] mt-[2vw] sm:mt-[1vw] border-t border-secondary/10">
                              <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
                                <button
                                  type="button"
                                  onClick={() => setIsPublic(!isPublic)}
                                  className={`px-[2.2vw] py-[0.8vw] sm:px-[0.75vw] sm:py-[0.3vw] rounded-[0.3vw] extraSmallText transition-colors cursor-pointer ${
                                    isPublic
                                      ? "bg-yellow text-secondary font-medium border border-secondary/15 drop-shadow"
                                      : "bg-secondary/5 text-secondary/50 hover:text-secondary border border-secondary/15"
                                  }`}
                                >
                                  #public
                                </button>

                                {taggedAlbums.length < 3 && (
                                  <button
                                    type="button"
                                    onClick={() => setIsTaggingAlbum(true)}
                                    className="px-[2.2vw] py-[0.8vw] sm:px-[0.75vw] sm:py-[0.3vw] rounded-[0.3vw] extraSmallText border border-secondary/15 bg-primary hover:bg-secondary/5 text-secondary/75 hover:text-secondary transition-colors cursor-pointer"
                                  >
                                    + #album
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-[2.5vw] sm:gap-[1vw]">
                                <span className="extraSmallText text-secondary/40">
                                  {bodyText.length}/500
                                </span>

                                <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                                  <button
                                    type="submit"
                                    disabled={isPublishing || !bodyText.trim()}
                                    className="main-btn smallText text-secondary disabled:opacity-40 cursor-pointer"
                                  >
                                    <span className="main-btn__icon" aria-hidden="true" />
                                    <span className="main-btn__label">
                                      <span className="main-btn__clip">
                                        <span className="main-btn__from">
                                          {isPublishing ? "Posting..." : "Publish"}
                                        </span>
                                        <span className="main-btn__to" aria-hidden="true">
                                          {isPublishing ? "Posting..." : "Publish"}
                                        </span>
                                      </span>
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="bg-primary border border-secondary/15 rounded-[0.5vw] drop-shadow-soft p-[4vw] sm:p-[2.2vw] mb-[4vw] sm:mb-[2.5vw] flex flex-col sm:flex-row sm:items-center justify-between gap-[3vw] sm:gap-[1.5vw]">
                          <div className="flex flex-col gap-[0.6vw]">
                            <span className="smallText font-medium text-secondary">
                              Join the conversation
                            </span>
                            <p className="extraSmallText text-secondary/60">
                              Sign in to curate your Top 5 records and publish notes to kindred listeners.
                            </p>
                          </div>
                          <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit">
                            <Link href="/register" className="main-btn smallText">
                              <span className="main-btn__icon" aria-hidden="true" />
                              <span className="main-btn__label">
                                <span className="main-btn__clip">
                                  <span className="main-btn__from">Create account</span>
                                  <span className="main-btn__to" aria-hidden="true">
                                    Create account
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Posts List */}
                      {loading ? (
                        <div className="p-[6vw] sm:p-[3.5vw] border border-secondary/15 rounded-[0.5vw] bg-primary text-center">
                          <span className="smallText text-secondary/50 animate-pulse">
                            Loading discussions...
                          </span>
                        </div>
                      ) : postsList.length === 0 ? (
                        <div className="p-[6vw] sm:p-[3.5vw] border border-secondary/15 rounded-[0.5vw] bg-primary drop-shadow-soft flex flex-col items-start gap-[1vw]">
                          <span className="smallText font-medium text-secondary">
                            No discussions in this feed yet.
                          </span>
                          <p className="extraSmallText text-secondary/55">
                            {feedType === "for-you"
                              ? "Follow listeners or curate albums into your Top 5 to tune your personal timeline."
                              : "Be the first to share a note on a record you love."}
                          </p>
                        </div>
                      ) : (
                        <>
                          <InteractivePostList
                            posts={postsList}
                            currentUser={currentUser}
                            onPostsChange={setPostsList}
                            variant="light"
                          />

                          {nextCursor && (
                            <div className="mt-[4vw] sm:mt-[2.5vw] flex justify-center">
                              <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                                <button
                                  type="button"
                                  onClick={handleLoadMore}
                                  disabled={loadingMore}
                                  className="main-btn smallText text-secondary disabled:opacity-40 cursor-pointer"
                                >
                                  <span className="main-btn__icon" aria-hidden="true" />
                                  <span className="main-btn__label">
                                    <span className="main-btn__clip">
                                      <span className="main-btn__from">
                                        {loadingMore ? "Loading..." : "Load More"}
                                      </span>
                                      <span className="main-btn__to" aria-hidden="true">
                                        {loadingMore ? "Loading..." : "Load More"}
                                      </span>
                                    </span>
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </section>

                {/* Editorial Dark Footer (matching Home and Profile) */}
                <footer
                  data-nav-color="primary"
                  className="bg-secondary text-primary layout-grid py-[6vw] px-[var(--margin)] mt-[8vw] border-t border-primary/10 select-none"
                >
                  {/* Platform Links */}
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[8vw] sm:mb-0">
                    <span className="extraSmallText text-primary/40 font-mono">
                      listener archive
                    </span>
                    <div className="flex flex-col gap-[0.5vw]">
                      <Link
                        href="/"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                      >
                        musi5t home
                      </Link>
                      {currentUser && (
                        <Link
                          href={`/@${currentUser.username}`}
                          className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                        >
                          @{currentUser.username}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Back to top button */}
                  <div className="col-span-full sm:col-span-4 flex items-center justify-center mb-[8vw] sm:mb-0">
                    <button
                      type="button"
                      onClick={() => scrollTo("#feed-top")}
                      className="back-to-top extraSmallText text-primary/60 hover:text-primary cursor-pointer hover:scale-105 transition-transform"
                    >
                      <span className="back-to-top__clip">
                        <span className="back-to-top__from">
                          <span className="back-to-top__arrow mr-1">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                        <span className="back-to-top__to" aria-hidden="true">
                          <span className="back-to-top__arrow mr-1">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* Copyright & Legal */}
                  <div className="col-span-full sm:col-span-4 flex flex-col sm:items-end justify-between gap-[1vw]">
                    <span className="detailText text-primary/40">
                      © 2026 musi5t. The album-centric social network.
                    </span>
                    <div className="flex gap-[1vw] detailText text-primary/50">
                      <Link href="/" className="hover:text-primary transition-colors">
                        overview
                      </Link>
                      <span>,</span>
                      <Link href="/feed" className="hover:text-primary transition-colors">
                        discussions
                      </Link>
                      <span>,</span>
                      <span className="opacity-40">musi5t core</span>
                    </div>
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Album Tagging Modal (Rendered outside clip-path main) */}
      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        currentPath="/feed"
        accentColor="#FFE600"
        extraContent={
          <div className="space-y-2 pt-2 border-t border-secondary/10">
            <span className="text-[11px] uppercase tracking-wider text-secondary/40 font-semibold px-1">
              Feed Filter
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  switchFeedType("for-you");
                  setIsMobileMenuOpen(false);
                  scrollTo("#feed-top");
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  feedType === "for-you"
                    ? "bg-secondary text-primary"
                    : "bg-secondary/10 text-secondary hover:bg-secondary/15"
                }`}
              >
                For You
              </button>
              <button
                type="button"
                onClick={() => {
                  switchFeedType("global");
                  setIsMobileMenuOpen(false);
                  scrollTo("#feed-top");
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  feedType === "global"
                    ? "bg-secondary text-primary"
                    : "bg-secondary/10 text-secondary hover:bg-secondary/15"
                }`}
              >
                Global
              </button>
            </div>
          </div>
        }
      />

      {isTaggingAlbum && (
        <div data-lenis-prevent>
          <AlbumSearchModal
            isOpen={true}
            onClose={() => setIsTaggingAlbum(false)}
            onSelectAlbum={handleAddAlbumTag}
            accentColor="#FFE600"
          />
        </div>
      )}
    </div>
  );
}

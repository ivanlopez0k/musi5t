"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FeedPost } from "@/lib/feed/visibility";
import { AlbumSearchModal } from "@/components/profile/AlbumSearchModal";

interface FeedViewProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    themeKey: string;
  } | null;
  initialPosts: FeedPost[];
  initialType: "for-you" | "global";
}

export function FeedView({
  currentUser,
  initialPosts,
  initialType,
}: FeedViewProps) {
  const router = useRouter();
  const [feedType, setFeedType] = useState<"for-you" | "global">(initialType);
  const [postsList, setPostsList] = useState<FeedPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);

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
        setPostsList(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);

    if (!bodyText.trim()) return;
    if (!isPublic && taggedAlbums.length === 0) {
      setPostError("Seleccioná al menos una audiencia: marcá #public o etiquetá un álbum.");
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
        throw new Error(data.error || "Error al publicar.");
      }

      setBodyText("");
      setTaggedAlbums([]);
      setIsPublic(true);

      // Prepend optimistic post or reload
      await switchFeedType(feedType);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPostError(err.message);
      } else {
        setPostError("Error al publicar.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleLike = async (post: FeedPost) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const wasLiked = post.likedByMe;
    const newCount = wasLiked ? post.likesCount - 1 : post.likesCount + 1;

    // Optimistic UI update
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
      // Rollback on error
      setPostsList((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likedByMe: wasLiked, likesCount: post.likesCount } : p
        )
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("¿Eliminar este post?")) return;
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPostsList((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
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
            Para vos
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
          <div className="space-y-4">
            {postsList.map((post) => (
              <article
                key={post.id}
                className="border border-white/10 bg-[#161614]/70 backdrop-blur-sm rounded-2xl p-5 hover:border-white/20 transition-colors"
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
                      <h4 className="text-sm font-medium text-white group-hover:text-[#FFE600] transition-colors leading-tight">
                        {post.author.displayName}
                      </h4>
                      <span className="text-[11px] font-mono opacity-50">
                        @{post.author.username}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
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
                        className="text-xs font-mono text-red-400/60 hover:text-red-400 px-1.5 py-0.5 ml-1 transition-colors"
                        title="Delete post"
                      >
                        ✕
                      </button>
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
                        className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-1.5 pr-2.5 py-0.5 text-[11px] font-mono text-white/80 hover:text-[#FFE600] transition-colors"
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
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap mb-4 font-light">
                  {post.body}
                </p>

                {/* Bottom stats row */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      post.likedByMe
                        ? "text-red-400 bg-red-400/10 font-bold"
                        : "opacity-60 hover:opacity-100 hover:bg-white/5"
                    }`}
                  >
                    <span>{post.likedByMe ? "♥" : "♡"}</span>
                    <span>{post.likesCount}</span>
                  </button>

                  <span className="text-[10px] opacity-30">album-first social</span>
                </div>
              </article>
            ))}
          </div>
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

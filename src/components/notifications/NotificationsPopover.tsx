"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";

export interface NotificationItem {
  id: string;
  type: "like" | "reply" | "follow";
  read: boolean;
  createdAt: string;
  postId: string | null;
  replyId: string | null;
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    themeKey: string;
  };
  postPreview: string | null;
  replyPreview: string | null;
}

export function refreshNotifications() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("musi5t:notifications:refresh"));
  }
}

function getRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface NotificationsPopoverProps {
  className?: string;
  align?: "left" | "right";
  renderTrigger?: (unreadCount: number, toggleOpen: () => void) => React.ReactNode;
}

export function NotificationsPopover({
  className = "",
  align = "right",
  renderTrigger,
}: NotificationsPopoverProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetch("/api/v1/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setNotifications(data.notifications || []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
      });

    const handleRefresh = () => {
      fetch("/api/v1/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          setNotifications(data.notifications || []);
          setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
        })
        .catch(console.error);
    };

    window.addEventListener("musi5t:notifications:refresh", handleRefresh);
    const interval = setInterval(handleRefresh, 60000);

    return () => {
      isMounted = false;
      window.removeEventListener("musi5t:notifications:refresh", handleRefresh);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setLoading(true);
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      await fetch("/api/v1/notifications/read", { method: "POST" });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch("/api/v1/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id }),
      }).catch(console.error);
    }

    setIsOpen(false);

    if (notif.type === "follow") {
      router.push(`/@${notif.actor.username}`);
    } else if (notif.postId) {
      router.push(`/feed#post-${notif.postId}`);
    } else {
      router.push(`/@${notif.actor.username}`);
    }
  };

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {renderTrigger ? (
        renderTrigger(unreadCount, handleToggle)
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Notifications"
          aria-expanded={isOpen}
          className={`relative p-1.5 sm:p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-secondary/10 transition-all cursor-pointer flex items-center justify-center shrink-0 ${className}`}
          title="Notifications"
        >
          <svg
            className="w-[5vw] h-[5vw] sm:w-[1.25vw] sm:h-[1.25vw]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-[3.8vw] min-w-[3.8vw] sm:h-[1vw] sm:min-w-[1vw] px-1 items-center justify-center rounded-full bg-[#ffd83d] text-[#0E0E0E] text-[2.4vw] sm:text-[0.65vw] font-bold leading-none shadow-sm ring-2 ring-primary">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          data-lenis-prevent
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-2 w-[86vw] sm:w-[380px] max-w-[calc(100vw-2rem)] max-h-[75vh] flex flex-col bg-primary text-secondary border border-secondary/15 rounded-2xl drop-shadow-xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-secondary/10 flex items-center justify-between shrink-0 bg-primary/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-xs font-semibold text-secondary/80">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-secondary/70 hover:text-secondary hover:underline cursor-pointer transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-secondary/10">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-secondary/50 text-xs sm:text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-secondary/50 text-xs sm:text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-secondary/[0.05] ${
                    !notif.read ? "bg-secondary/[0.03]" : ""
                  }`}
                >
                  {/* Actor Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-secondary/20 flex items-center justify-center">
                      <UserAvatar
                        avatarUrl={notif.actor.avatarUrl}
                        displayName={notif.actor.displayName || notif.actor.username}
                        themeKey={notif.actor.themeKey}
                        textClassName="text-xs font-bold leading-none"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border border-secondary/20 flex items-center justify-center text-[9px] shadow-sm">
                      {notif.type === "like" && "❤️"}
                      {notif.type === "reply" && "💬"}
                      {notif.type === "follow" && "👤"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 text-xs sm:text-sm">
                    <div className="leading-snug">
                      <span className="font-semibold text-secondary hover:underline mr-1">
                        {notif.actor.displayName || notif.actor.username}
                      </span>
                      <span className="text-secondary/70">
                        {notif.type === "like" && "liked your post"}
                        {notif.type === "reply" &&
                          (notif.replyPreview
                            ? `replied: "${notif.replyPreview}"`
                            : "replied to your post")}
                        {notif.type === "follow" && "started following you"}
                      </span>
                    </div>

                    {notif.type === "like" && notif.postPreview && (
                      <p className="mt-1 text-[11px] sm:text-xs text-secondary/50 truncate italic border-l-2 border-secondary/20 pl-2">
                        &ldquo;{notif.postPreview}&rdquo;
                      </p>
                    )}

                    <span className="mt-1 block text-[10px] sm:text-[11px] text-secondary/40">
                      {getRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {/* Unread indicator */}
                  {!notif.read && (
                    <span
                      className="w-2 h-2 rounded-full bg-[#ffd83d] shrink-0 mt-2"
                      title="Unread"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { UserAvatar } from "./UserAvatar";
import { LogoutButton } from "./LogoutButton";
import { NotificationsPopover } from "../notifications/NotificationsPopover";

export interface MobileNavDrawerUser {
  id?: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  themeKey?: string | null;
}

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: MobileNavDrawerUser | null;
  currentPath?: string;
  accentColor?: string;
  extraContent?: React.ReactNode;
}

export function MobileMenuButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open mobile menu"
      className={`sm:hidden flex items-center justify-center w-[8.5vw] h-[8.5vw] rounded-full bg-secondary/[0.08] hover:bg-secondary/[0.15] text-secondary transition-colors cursor-pointer shrink-0 ${className}`}
    >
      <svg
        className="w-[4.8vw] h-[4.8vw]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
    </button>
  );
}

const NAV_ITEMS = [
  { href: "/feed", label: "Feed" },
  { href: "/lists", label: "Lists" },
  { href: "/rankings", label: "Rankings" },
  { href: "/releases", label: "Releases" },
];

export function MobileNavDrawer({
  isOpen,
  onClose,
  currentUser,
  currentPath = "/feed",
  accentColor = "#ffd83d",
  extraContent,
}: MobileNavDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] sm:hidden" data-lenis-prevent>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
        className="fixed inset-y-0 right-0 w-[86vw] max-w-[360px] bg-primary text-secondary border-l border-secondary/15 drop-shadow-soft flex flex-col justify-between overflow-hidden z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Top Bar with user info / guest info and close button */}
        <div className="p-5 border-b border-secondary/10 flex items-center justify-between shrink-0">
          {currentUser ? (
            <Link
              href={`/@${currentUser.username}`}
              onClick={onClose}
              className="flex items-center gap-3 min-w-0 group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-secondary/25 group-hover:border-secondary transition-colors shrink-0 flex items-center justify-center">
                <UserAvatar
                  avatarUrl={currentUser.avatarUrl}
                  displayName={currentUser.displayName || currentUser.username}
                  themeKey={currentUser.themeKey}
                  textClassName="text-sm font-bold leading-none"
                />
              </div>
              <div className="min-w-0 flex flex-col text-left">
                <span className="text-sm font-semibold text-secondary truncate group-hover:opacity-80 transition-opacity">
                  {currentUser.displayName || currentUser.username}
                </span>
                <span className="text-xs text-secondary/60 truncate">
                  @{currentUser.username}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold tracking-tight">musi5t</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary/70 font-medium">
                Guest
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {currentUser && <NotificationsPopover />}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-secondary/60 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main Navigation Links */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-secondary/40 font-semibold px-1">
              Explore
            </span>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href === "/feed" && currentPath.startsWith("/feed"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary/10 text-secondary font-semibold"
                        : "text-secondary/75 hover:text-secondary hover:bg-secondary/[0.05]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Extra View-Specific Content (e.g. Feed filters) */}
          {extraContent}

          {/* Account Actions */}
          <div className="space-y-1.5 pt-3 border-t border-secondary/10">
            <span className="text-[11px] uppercase tracking-wider text-secondary/40 font-semibold px-1">
              Account
            </span>

            {currentUser ? (
              <div className="flex flex-col gap-1">
                <NotificationsPopover
                  align="right"
                  renderTrigger={(unreadCount, toggleOpen) => (
                    <button
                      type="button"
                      onClick={toggleOpen}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-secondary/80 hover:text-secondary hover:bg-secondary/[0.05] transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#ffd83d] text-[#0E0E0E] text-[10px] font-bold leading-none">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-secondary/40">🔔</span>
                    </button>
                  )}
                />

                <Link
                  href={`/@${currentUser.username}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-secondary/80 hover:text-secondary hover:bg-secondary/[0.05] transition-colors"
                >
                  <span>My Profile</span>
                  <span className="text-xs text-secondary/40">→</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-secondary/80 hover:text-secondary hover:bg-secondary/[0.05] transition-colors"
                >
                  <span>Settings</span>
                  <span className="text-xs text-secondary/40">⚙</span>
                </Link>

                <div className="pt-2 px-1">
                  <LogoutButton className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium text-red-600/80 hover:text-red-600 bg-red-500/[0.06] hover:bg-red-500/[0.12] transition-colors text-center cursor-pointer block" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-center border border-secondary/20 hover:bg-secondary/[0.05] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-center shadow-sm transition-transform active:scale-98"
                  style={{
                    backgroundColor: accentColor,
                    color: "#0E0E0E",
                  }}
                >
                  Join musi5t
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-secondary/10 text-center shrink-0">
          <span className="text-[11px] text-secondary/40">musi5t &bull; album-first social</span>
        </div>
      </aside>
    </div>
  );
}

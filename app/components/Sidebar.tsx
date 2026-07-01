"use client";

import { useMemo, useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from "react";
import {
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  Plus,
  LogOut,
  User,
  ChevronDown,
  Brain,
  MessageSquare
} from "lucide-react";

import { Chat } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  setCurrentChatId,
  onNewChat,
}: SidebarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [showArchived, setShowArchived] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: globalThis.MouseEvent) => {
      if (activeMenuId && !(e.target as HTMLElement).closest(".chat-item-menu")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeMenuId]);

  const activeChats = useMemo(
    () => chats.filter((chat) => !chat.is_archived),
    [chats]
  );

  const archivedChats = useMemo(
    () => chats.filter((chat) => chat.is_archived),
    [chats]
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const handleRename = async (chat: Chat) => {
    setActiveMenuId(null);
    const newTitle = prompt("Rename chat", chat.title);

    if (!newTitle || newTitle.trim() === "") return;

    await supabase
      .from("chats")
      .update({
        title: newTitle.trim(),
      })
      .eq("id", chat.id);

    router.refresh();
    window.location.reload();
  };

  const handleArchive = async (chatId: string) => {
    setActiveMenuId(null);
    await supabase
      .from("chats")
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
      })
      .eq("id", chatId);

    router.refresh();
    window.location.reload();
  };

  const handleRestore = async (chatId: string) => {
    setActiveMenuId(null);
    await supabase
      .from("chats")
      .update({
        is_archived: false,
        archived_at: null,
      })
      .eq("id", chatId);

    router.refresh();
    window.location.reload();
  };

  const handleDelete = async (chatId: string) => {
    setActiveMenuId(null);
    const confirmed = confirm("Delete this chat permanently?");

    if (!confirmed) return;

    await supabase.from("messages").delete().eq("chat_id", chatId);
    await supabase.from("chats").delete().eq("id", chatId);

    router.refresh();
    window.location.reload();
  };

  // Extract user display name / initial
  const userInitial = useMemo(() => {
    if (!user?.email) return "?";
    return user.email[0].toUpperCase();
  }, [user]);

  const userDisplayName = useMemo(() => {
    if (!user?.email) return "AI explorer";
    return user.email.split("@")[0];
  }, [user]);

  return (
    <div 
      ref={sidebarRef}
      className="flex h-full w-full flex-col bg-[#0b0912] border-r border-white/5 select-none relative"
    >
      {/* Sidebar Header */}
      <div className="shrink-0 p-5 flex flex-col gap-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-md font-bold tracking-tight font-display text-white">
              MindScope AI
            </h2>
            <p className="text-[10px] text-violet-400/60 uppercase font-semibold tracking-wider">
              Reality Mirror
            </p>
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 shadow-lg text-white font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Active Chats List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-4 scrollbar-custom">
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-300/30">
            Recent Dialogues
          </div>

          <div className="space-y-1">
            {activeChats.length === 0 && (
              <div className="py-8 text-center text-xs text-indigo-200/30 font-medium">
                No chats yet
              </div>
            )}

            {activeChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                active={currentChatId === chat.id}
                menuOpen={activeMenuId === chat.id}
                onToggleMenu={(e: ReactMouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
                }}
                onSelect={() => {
                  setCurrentChatId(chat.id);
                  setActiveMenuId(null);
                }}
                onRename={() => handleRename(chat)}
                onArchive={() => handleArchive(chat.id)}
                onDelete={() => handleDelete(chat.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Archived Collapsible */}
      <div className="shrink-0 border-t border-white/5">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="flex w-full items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-widest text-indigo-300/30 hover:bg-white/[0.02] hover:text-indigo-200/50 transition-all cursor-pointer"
        >
          <span>Archived Files</span>
          <ChevronDown 
            size={14} 
            className={`transition-transform duration-300 ${showArchived ? "rotate-180 text-violet-400" : "text-indigo-300/30"}`} 
          />
        </button>

        {showArchived && (
          <div className="max-h-[160px] overflow-y-auto px-3 pb-3 space-y-1 scrollbar-custom border-t border-white/[0.02]">
            {archivedChats.length === 0 ? (
              <div className="py-4 text-center text-xs text-indigo-200/20 font-medium">
                No archived chats
              </div>
            ) : (
              archivedChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  archived
                  active={false}
                  menuOpen={activeMenuId === chat.id}
                  onToggleMenu={(e: ReactMouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
                  }}
                  onSelect={() => {
                    setCurrentChatId(chat.id);
                    setActiveMenuId(null);
                  }}
                  onRename={() => handleRename(chat)}
                  onRestore={() => handleRestore(chat.id)}
                  onDelete={() => handleDelete(chat.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modern User Profile & Logout Footer */}
      <div className="shrink-0 p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
            {userInitial !== "?" ? (
              <span className="text-sm font-bold text-violet-400 font-display">{userInitial}</span>
            ) : (
              <User size={16} className="text-violet-400" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate capitalize">
              {userDisplayName}
            </span>
            <span className="text-[10px] text-indigo-200/40 truncate">
              {user?.email || "Guest User"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-indigo-200/50 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all active:scale-[0.9] cursor-pointer"
          title="Sign out of Account"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

function ChatItem({
  chat,
  active,
  archived,
  menuOpen,
  onToggleMenu,
  onSelect,
  onRename,
  onArchive,
  onRestore,
  onDelete,
}: any) {
  return (
    <div
      className={`group rounded-xl transition-all relative border ${
        active
          ? "bg-violet-500/10 border-violet-500/20 text-white"
          : "border-transparent hover:bg-white/[0.02] hover:border-white/5 text-indigo-200/70"
      }`}
    >
      <div className="flex items-center justify-between pr-1">
        {/* Main Selection Button */}
        <button
          onClick={onSelect}
          className="flex-1 min-w-0 overflow-hidden px-3.5 py-3 text-left flex items-center gap-2.5 cursor-pointer"
        >
          <MessageSquare 
            size={14} 
            className={`shrink-0 ${active ? "text-violet-400" : "text-indigo-300/30 group-hover:text-indigo-200/50"}`} 
          />
          <span className="block truncate text-xs sm:text-sm font-medium tracking-wide">
            {chat.title}
          </span>
        </button>

        {/* Custom Actions Dropdown Wrapper */}
        <div className="relative chat-item-menu">
          <button 
            onClick={onToggleMenu}
            className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${menuOpen ? "text-violet-400 bg-white/5" : "text-indigo-200/40"}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-[999] w-40 overflow-hidden rounded-xl border border-white/5 bg-[#14121f] shadow-2xl animate-message">
              <button
                onClick={onRename}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Pencil size={12} className="text-violet-400" />
                Rename
              </button>

              {archived ? (
                <button
                  onClick={onRestore}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <ArchiveRestore size={12} className="text-teal-400" />
                  Restore
                </button>
              ) : (
                <button
                  onClick={onArchive}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <Archive size={12} className="text-amber-400" />
                  Archive
                </button>
              )}

              <div className="border-t border-white/5 w-full my-0.5" />

              <button
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
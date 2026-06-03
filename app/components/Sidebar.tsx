"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";

import { Chat } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (
    id: string
  ) => void;
  onNewChat: () => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  setCurrentChatId,
  onNewChat,
}: SidebarProps) {
  const router = useRouter();

  const [showArchived, setShowArchived] =
    useState(false);

  const activeChats = useMemo(
    () =>
      chats.filter(
        (chat) => !chat.is_archived
      ),
    [chats]
  );

  const archivedChats = useMemo(
    () =>
      chats.filter(
        (chat) => chat.is_archived
      ),
    [chats]
  );

  const handleLogout =
    async () => {
      await supabase.auth.signOut();

      router.replace("/login");
      router.refresh();
    };

  const handleRename =
    async (chat: Chat) => {
      const newTitle = prompt(
        "Rename chat",
        chat.title
      );

      if (
        !newTitle ||
        newTitle.trim() === ""
      )
        return;

      await supabase
        .from("chats")
        .update({
          title: newTitle.trim(),
        })
        .eq("id", chat.id);

      router.refresh();
      window.location.reload();
    };

  const handleArchive =
    async (chatId: string) => {
      await supabase
        .from("chats")
        .update({
          is_archived: true,
          archived_at:
            new Date().toISOString(),
        })
        .eq("id", chatId);

      router.refresh();
      window.location.reload();
    };

  const handleRestore =
    async (chatId: string) => {
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

  const handleDelete =
    async (chatId: string) => {
      const confirmed =
        confirm(
          "Delete this chat permanently?"
        );

      if (!confirmed) return;

      await supabase
        .from("messages")
        .delete()
        .eq("chat_id", chatId);

      await supabase
        .from("chats")
        .delete()
        .eq("id", chatId);

      router.refresh();
      window.location.reload();
    };

  return (
    <div className="flex h-full w-full flex-col bg-background">

      {/* Header */}
      <div className="shrink-0 border-b p-4">

        <div className="mb-4 text-center">

          <div className="text-4xl md:text-5xl">
            🧠
          </div>

          <h2 className="mt-2 text-base md:text-lg font-bold">
            MindScope AI
          </h2>

        </div>

        <div className="space-y-3">
  <Button
    onClick={onNewChat}
    className="
      w-full
      h-11
      rounded-xl
      text-sm
      md:text-base
    "
  >
    + New Chat
  </Button>

  <Button
    variant="destructive"
    onClick={handleLogout}
    className="
      w-full
      h-11
      rounded-xl
      text-sm
      md:text-base
    "
  >
    Logout
  </Button>
</div>

      </div>

      {/* Active Chats */}
      <div
  className="
    h-[35vh]
    overflow-y-auto
    overflow-x-hidden
    px-2
    space-y-2
    scrollbar-thin
  "
>
        <div className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
          Chats
        </div>

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            px-2
            space-y-2
          "
        >
          {activeChats.length ===
            0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No chats yet
            </div>
          )}

          {activeChats.map(
            (chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                active={
                  currentChatId ===
                  chat.id
                }
                onSelect={() =>
                  setCurrentChatId(
                    chat.id
                  )
                }
                onRename={() =>
                  handleRename(
                    chat
                  )
                }
                onArchive={() =>
                  handleArchive(
                    chat.id
                  )
                }
                onDelete={() =>
                  handleDelete(
                    chat.id
                  )
                }
              />
            )
          )}
        </div>

      </div>

      {/* Archived */}
      <div className="shrink-0 border-t">

        <button
          onClick={() =>
            setShowArchived(
              !showArchived
            )
          }
          className="
            flex
            w-full
            items-center
            justify-between
            px-3
            py-3
            text-xs
            font-semibold
            uppercase
            text-muted-foreground
            hover:bg-muted/50
          "
        >
          <span>
            Archived Chats
          </span>

          <span>
            {showArchived
              ? "−"
              : "+"}
          </span>
        </button>

        {showArchived && (
          <div
  className="
    h-[20vh]
    overflow-y-auto
    overflow-x-hidden
    px-2
    pb-2
    space-y-2
    scrollbar-thin
  "
>
            {archivedChats.length ===
            0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No archived chats
              </div>
            ) : (
              archivedChats.map(
                (chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    archived
                    active={false}
                    onSelect={() =>
                      setCurrentChatId(
                        chat.id
                      )
                    }
                    onRename={() =>
                      handleRename(
                        chat
                      )
                    }
                    onRestore={() =>
                      handleRestore(
                        chat.id
                      )
                    }
                    onDelete={() =>
                      handleDelete(
                        chat.id
                      )
                    }
                  />
                )
              )
            )}

          </div>
        )}

      </div>

      {/* Footer */}
      

    </div>
  );
}

function ChatItem({
  chat,
  active,
  archived,
  onSelect,
  onRename,
  onArchive,
  onRestore,
  onDelete,
}: any) {
  return (
    <div
      className={`group rounded-xl transition-all
      ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      }`}
    >
      <div className="flex items-center justify-between">

        <button
  onClick={onSelect}
  className="
    flex-1
    min-w-0
    overflow-hidden
    px-3
    py-3
    text-left
    text-sm
    md:text-base
  "
>
  <span className="block truncate">
    💬 {chat.title}
  </span>
</button>

        <div className="relative pr-2">

          <details>
            <summary className="list-none cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background/30">
              <MoreHorizontal size={16} />
            </summary>

            <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border bg-background shadow-xl">

              <button
                onClick={onRename}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
              >
                <Pencil size={14} />
                Rename
              </button>

              {archived ? (
                <button
                  onClick={
                    onRestore
                  }
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <ArchiveRestore size={14} />
                  Restore
                </button>
              ) : (
                <button
                  onClick={
                    onArchive
                  }
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <Archive size={14} />
                  Archive
                </button>
              )}

              <button
  onClick={onDelete}
  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted"
>
  <Trash2 size={14} />
  Delete
</button>

            </div>
          </details>

        </div>

      </div>
    </div>
  );
}
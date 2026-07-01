"use client";

import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { Chatbot } from "./components/Chatbox";
import Sidebar from "./components/Sidebar";

import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [currentChatId, setCurrentChatId] =
    useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const { chats, createChat, loading: chatsLoading } =
    useChats(user?.id);

  // Redirect new/unauthenticated users to the register page
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/register");
    }
  }, [user, loading, router]);

  // Auto-select or auto-create chat
  useEffect(() => {
    if (!user || chatsLoading) return;

    if (chats.length > 0) {
      if (!currentChatId) {
        setCurrentChatId(chats[0].id);
      }
    } else {
      const autoCreate = async () => {
        const chat = await createChat();
        if (chat) {
          setCurrentChatId(chat.id);
        }
      };
      autoCreate();
    }
  }, [user, chats, chatsLoading, currentChatId, createChat]);

  const handleNewChat = async () => {
    const chat = await createChat();

    if (chat) {
      setCurrentChatId(chat.id);
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl animate-pulse">
            🧠
          </div>

          <p className="text-muted-foreground">
            Loading MindScope AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-background">

      {/* Mobile Header */}
      <header
        className="
          md:hidden
          h-14
          border-b
          flex
          items-center
          justify-between
          px-4
          shrink-0
          bg-background
        "
      >
        <button
          onClick={() =>
            setSidebarOpen(true)
          }
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            hover:bg-muted
          "
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl">
            🧠
          </span>

          <span className="font-semibold truncate">
            MindScope AI
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-white/5
            bg-white/5
            text-indigo-200/50
            hover:bg-red-500/10
            hover:border-red-500/20
            hover:text-red-400
            transition-all
            active:scale-[0.9]
            cursor-pointer
          "
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Layout */}
      <div
        className="
          flex
          h-[calc(100vh-56px)]
          md:h-screen
          min-h-0
        "
      >

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="
              fixed
              inset-0
              z-40
              bg-black/50
              md:hidden
            "
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed
            top-0
            left-0
            z-50
            h-screen
            w-[85%]
            max-w-[320px]
            bg-background
            border-r
            shadow-xl
            transition-transform
            duration-300

            md:relative
            md:h-full
            md:w-80
            md:max-w-none
            md:translate-x-0
            md:shadow-none

            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >

          {/* Mobile Close */}
          <div className="flex justify-end p-3 md:hidden">
            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                hover:bg-muted
              "
            >
              <X size={22} />
            </button>
          </div>

          <div className="h-full overflow-hidden">
            <Sidebar
              chats={chats}
              currentChatId={
                currentChatId
              }
              setCurrentChatId={(
                id
              ) => {
                setCurrentChatId(id);
                setSidebarOpen(false);
              }}
              onNewChat={
                handleNewChat
              }
            />
          </div>
        </aside>

        {/* Chat Area */}
        <section
          className="
            flex
            flex-1
            min-w-0
            min-h-0
            flex-col
            overflow-hidden
          "
        >
          <div
            className="
              flex-1
              min-h-0
              min-w-0
              overflow-hidden
            "
          >
            <Chatbot
              currentChatId={
                currentChatId
              }
            />
          </div>
        </section>

      </div>

    </main>
  );
}
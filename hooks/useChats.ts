"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Chat } from "@/types/chat";

export function useChats(userId?: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] =
    useState(true);

  const loadChats = async () => {
    if (!userId) {
      setChats([]);
      setLoading(false);
      return;
    }

    const { data, error } =
      await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);
      return;
    }

    setChats(data || []);
    setLoading(false);
  };

  const createChat = async () => {
    if (!userId) return null;

    const { data, error } =
      await supabase
        .from("chats")
        .insert({
          user_id: userId,
          title: "New Chat",
        })
        .select()
        .single();

    if (error) {
      console.error(error);
      return null;
    }

    await loadChats();

    return data;
  };

  useEffect(() => {
    loadChats();
  }, [userId]);

  return {
    chats,
    loading,
    createChat,
    reloadChats: loadChats,
  };
}
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface ChatbotProps {
  currentChatId:
    string | null;
}

export function Chatbot({
  currentChatId,
}: ChatbotProps) {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!currentChatId) return;

    loadMessages();
  }, [currentChatId]);

  const loadMessages =
    async () => {
      if (!currentChatId) return;

      const { data, error } =
        await supabase
          .from("messages")
          .select("*")
          .eq(
            "chat_id",
            currentChatId
          )
          .order("created_at", {
            ascending: true,
          });

      if (error) {
        console.error(error);
        return;
      }

      setMessages(
        (data || []).map(
          (msg: any) => ({
            id: msg.id,
            role: msg.role,
            content:
              msg.content,
          })
        )
      );
    };

  const sendMessage =
    async () => {
      if (
  !input.trim() ||
  loading
)
  return;

      const text =
        input.trim();
if (!currentChatId) {
  alert(
    "Create a new chat first."
  );
  return;
}
      const tempUserMsg: Message =
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
        };

      setMessages((prev) => [
        ...prev,
        tempUserMsg,
      ]);
      await supabase
  .from("messages")
  .insert({
    chat_id: currentChatId,
    role: "user",
    content: text,
  });
      setInput("");
      setLoading(true);

      try {
        const res = await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              {
                message: text,
                chatId:
                  currentChatId,
              }
            ),
          }
        );

        const data =
          await res.json();

        const botMsg: Message =
          {
            id: crypto.randomUUID(),
            role:
              "assistant",
            content:
              data.answer ||
              "I couldn't generate a response.",
          };
await supabase
  .from("messages")
  .insert({
    chat_id: currentChatId,
    role: "assistant",
    content:
      botMsg.content,
  });
        setMessages((prev) => [
          ...prev,
          botMsg,
        ]);
      } catch (error) {
        console.error(error);

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role:
              "assistant",
            content:
              "Something went wrong.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="w-full h-[90vh] sm:h-[92vh] md:h-[94vh] flex flex-col overflow-hidden rounded-3xl border bg-background shadow-xl">
        <div className="border-b px-4 py-3 text-center shrink-0">
  <p className="text-sm sm:text-base font-medium text-muted-foreground">
    Reflect. Understand. Grow.
  </p>
</div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 scroll-smooth">
          {messages.length ===
            0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Start a conversation...
            </div>
          )}

          <div className="space-y-4">
            {messages.map(
              (msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-3xl text-sm sm:text-base whitespace-pre-wrap break-words shadow-sm max-w-[95%] sm:max-w-[85%] md:max-w-[75%]
                    ${
                      msg.role ===
                      "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {
                      msg.content
                    }
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-3xl px-4 py-3">
                  Thinking...
                </div>
              </div>
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </div>
        </div>

        <div className="border-t p-3 shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              disabled={
                loading
              }
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              className="h-12 rounded-xl"
            />

            <Button
              onClick={
                sendMessage
              }
              disabled={
  loading ||
  !input.trim()
}
              className="h-12 px-5 rounded-xl"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
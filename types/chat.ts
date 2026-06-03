export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;

  is_archived?: boolean;
  archived_at?: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
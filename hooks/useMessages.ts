import { supabase } from "@/lib/supabase";

export async function getMessages(
  chatId: string
) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at");

  return data || [];
}
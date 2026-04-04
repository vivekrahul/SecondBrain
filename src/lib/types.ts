export interface Profile {
  id: string;
  email: string;
  pin: string;
  telegram_chat_id: string | null;
  created_at: string;
}

export interface BrainDump {
  id: string;
  user_id: string;
  created_at: string;
  raw_text: string;
  category: string;
  status: 'Open' | 'Done' | 'Archived';
  reminder_date: string | null;
  context_tags: string[];
  clean_text: string | null;
}

export interface GroqResponse {
  Category: string;
  Reminder_Date: string | null;
  Tags: string[];
  Clean_Text: string;
}

export interface ProcessEntryPayload {
  text: string;
  userId: string;
}

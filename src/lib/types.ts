export interface Profile {
  id: string;
  email: string;
  pin: string;
  telegram_chat_id: string | null;
  created_at: string;
  hidden_tabs: string[];
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
  priority: 'low' | 'medium' | 'high';
  content_hash: string | null;
  workspace: 'home' | 'work';
  completed_at?: string | null;
}

export interface GroqEntry {
  Category: string;
  Reminder_Date: string | null;
  Tags: string[];
  Clean_Text: string;
  Priority: 'low' | 'medium' | 'high';
}

export interface GroqResponse {
  entries: GroqEntry[];
}

export interface ProcessEntryPayload {
  text: string;
  userId: string;
}

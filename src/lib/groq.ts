import type { GroqResponse } from './types';

import { supabaseAdmin } from './supabase';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are categorizing a personal to-do / brain dump database. Read the user's input. Return ONLY a JSON object with these keys:
- Category: one of "Grocery", "Gym", "Idea", "Task", "Uncategorized"
- Reminder_Date: calculate a future date if time is implied (e.g., "tomorrow", "next week", "in 3 days"), otherwise null. Format: YYYY-MM-DD. Use today's date as reference.
- Tags: array of short lowercase keyword strings extracted from the input (e.g., ["urgent", "legday", "project"])
- Clean_Text: a brief, clean summary of the input (1-2 sentences max)

CRITICAL CLASSIFICATION RULES — follow these precisely:
- "Task": Anything the user NEEDS TO DO, HAS TO DO, or SHOULD DO. Any sentence with an action verb implying personal obligation, errand, chore, phone call, appointment, follow-up, payment, meeting, or reminder. Examples: "call mom", "pay electricity bill", "take a shower", "schedule dentist", "reply to email", "submit report", "pick up laundry", "renew passport", "fix the sink", "book flight tickets".
- "Idea": ONLY abstract thoughts, creative concepts, business ideas, shower thoughts, or hypothetical musings with NO immediate action required. Examples: "what if we built an app for dog walkers", "maybe I should start a podcast someday", "interesting concept: AI-powered journaling".
- "Grocery": Items to buy for food/household. Examples: "buy milk", "eggs", "need detergent".
- "Gym": Anything related to exercise, workouts, fitness tracking. Examples: "bench press 80kg", "leg day", "run 5km".
- "Uncategorized": Only if nothing else fits.

IMPORTANT: When in doubt between Task and Idea, ALWAYS choose Task. Most user inputs are things they need to do, not abstract ideas.

No markdown. No explanation. Only the JSON object.`;

export async function categorizeEntry(text: string, userId?: string): Promise<GroqResponse> {
  if (!GROQ_API_KEY) {
    // Fallback when no API key is configured
    return {
      Category: 'Uncategorized',
      Reminder_Date: null,
      Tags: [],
      Clean_Text: text,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  let customContext = "";

  if (userId) {
    // Fetch user's recent manual corrections to use as few-shot learning
    const { data: corrections } = await supabaseAdmin
      .from('brain_dump')
      .select('raw_text, category, context_tags, clean_text')
      .eq('user_id', userId)
      .eq('is_human_corrected', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (corrections && corrections.length > 0) {
      customContext = "\n\nCRITICAL CONTEXT - The user has previously manually corrected categorizations. You MUST learn from these preferred patterns:\n";
      corrections.forEach(c => {
        customContext += `User Input: "${c.raw_text}" -> Category: "${c.category}", Tags: ${JSON.stringify(c.context_tags)}, Summary: "${c.clean_text}"\n`;
      });
    }
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + `\n\nToday's date is: ${today}` + customContext },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 256,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Groq API error:', error);
    return {
      Category: 'Uncategorized',
      Reminder_Date: null,
      Tags: [],
      Clean_Text: text,
    };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content) as GroqResponse;
    // Validate and sanitize
    const validCategories = ['Grocery', 'Gym', 'Idea', 'Task', 'Uncategorized'];
    if (!validCategories.includes(parsed.Category)) {
      parsed.Category = 'Uncategorized';
    }
    if (parsed.Reminder_Date && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.Reminder_Date)) {
      parsed.Reminder_Date = null;
    }
    if (!Array.isArray(parsed.Tags)) {
      parsed.Tags = [];
    }
    if (!parsed.Clean_Text) {
      parsed.Clean_Text = text;
    }
    return parsed;
  } catch {
    console.error('Failed to parse Groq response:', content);
    return {
      Category: 'Uncategorized',
      Reminder_Date: null,
      Tags: [],
      Clean_Text: text,
    };
  }
}

import type { GroqResponse } from './types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are categorizing a flat database. Read the user's input. Return ONLY a JSON object with these keys:
- Category: one of "Grocery", "Gym", "Idea", "Task", "Uncategorized"
- Reminder_Date: calculate a future date if time is implied (e.g., "tomorrow", "next week", "in 3 days"), otherwise null. Format: YYYY-MM-DD. Use today's date as reference.
- Tags: array of short lowercase keyword strings extracted from the input (e.g., ["urgent", "legday", "project"])
- Clean_Text: a brief, clean summary of the input (1-2 sentences max)

No markdown. No explanation. Only the JSON object.`;

export async function categorizeEntry(text: string): Promise<GroqResponse> {
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

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + `\n\nToday's date is: ${today}` },
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

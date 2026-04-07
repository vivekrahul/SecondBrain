import type { GroqResponse } from './types';

import { supabaseAdmin } from './supabase';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are categorizing a personal to-do / brain dump database. Formulate your response based ONLY on the user's input. The user might provide a single thought OR a complex sentence containing multiple separate thoughts, tasks, or items.

Your job is to break down the user's input into logical, discrete blocks. If the user mentions multiple tasks, ideas, or groceries, separate them!
Return ONLY a JSON object with the key "entries", containing an array of objects. Each object MUST have these keys:
- Category: one of "Grocery", "Gym", "Idea", "Task", "Uncategorized"
- Reminder_Date: calculate a future date if time is implied (e.g., "tomorrow", "next week", "in 3 days"), otherwise null. Format: YYYY-MM-DD. Use today's date as reference.
- Tags: array of short lowercase keyword strings extracted from the input (e.g., ["urgent", "legday", "project"])
- Clean_Text: a brief, clean summary of ONLY this specific item (1-2 sentences max)

CRITICAL CLASSIFICATION RULES — follow these precisely:
- "Task": Anything the user NEEDS TO DO, HAS TO DO, or SHOULD DO. Examples: "call mom", "pay electricity bill", "renew passport".
- "Idea": ONLY abstract thoughts, creative concepts, business ideas with NO immediate action required.
- "Grocery": Items to buy for food/household. (e.g., "buy milk", "eggs"). If a user says "buy milk and eggs", split this into TWO Grocery entries.
- "Gym": Anything related to exercise, workouts, fitness tracking.
- "Uncategorized": Only if nothing else fits.

IMPORTANT: When in doubt between Task and Idea, ALWAYS choose Task. Most user inputs are things they need to do.

Example User Input: "remind me to call sarah tomorrow and also buy bread. idea: what if we launch a newsletter"
Example Output:
{
  "entries": [
    {
      "Category": "Task",
      "Reminder_Date": "2026-04-08",
      "Tags": ["call", "sarah"],
      "Clean_Text": "Call Sarah"
    },
    {
      "Category": "Grocery",
      "Reminder_Date": null,
      "Tags": ["bread"],
      "Clean_Text": "Bread"
    },
    {
      "Category": "Idea",
      "Reminder_Date": null,
      "Tags": ["newsletter", "launch"],
      "Clean_Text": "Launch a newsletter"
    }
  ]
}

No markdown. No explanation. Only the JSON object.`;

export async function categorizeEntry(text: string, userId?: string): Promise<GroqResponse> {
  const fallbackResponse: GroqResponse = {
    entries: [{
      Category: 'Uncategorized',
      Reminder_Date: null,
      Tags: [],
      Clean_Text: text,
    }]
  };

  if (!GROQ_API_KEY) {
    return fallbackResponse;
  }

  const today = new Date().toISOString().split('T')[0];
  let customContext = "";

  if (userId) {
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
      max_tokens: 512,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    console.error('Groq API error:', await response.text());
    return fallbackResponse;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content) as { entries: any[] };
    if (!parsed.entries || !Array.isArray(parsed.entries)) {
       throw new Error('Missing entries array');
    }

    const validCategories = ['Grocery', 'Gym', 'Idea', 'Task', 'Uncategorized'];
    
    // Validate each entry
    const sanitizedEntries = parsed.entries.map((entry: any) => {
      let category = validCategories.includes(entry?.Category) ? entry.Category : 'Uncategorized';
      let rDate = (entry?.Reminder_Date && /^\d{4}-\d{2}-\d{2}$/.test(entry.Reminder_Date)) ? entry.Reminder_Date : null;
      let tags = Array.isArray(entry?.Tags) ? entry.Tags : [];
      let cText = entry?.Clean_Text || text;

      return {
        Category: category,
        Reminder_Date: rDate,
        Tags: tags,
        Clean_Text: cText
      };
    });

    return { entries: sanitizedEntries };
  } catch (err) {
    console.error('Failed to parse Groq response:', content, err);
    return fallbackResponse;
  }
}

import type { GroqResponse } from './types';

import { supabaseAdmin } from './supabase';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a personal brain-dump categorizer. You receive raw thoughts from a user and must classify each discrete idea into the correct category and assign a priority.

The user might provide ONE thought OR multiple thoughts in a single message. Break them into separate entries.

Return ONLY a JSON object with key "entries" — an array of objects. Each object MUST have:
- Category: one of "Grocery", "Gym", "Idea", "Task", "Uncategorized"
- Reminder_Date: a future date if a time is implied ("tomorrow", "next week", "in 3 days"), else null. Format: YYYY-MM-DD
- Tags: array of short lowercase keyword strings (e.g. ["urgent", "work", "api"])
- Clean_Text: a concise, clean rewrite of just this item (1-2 sentences max)
- Priority: one of "high", "medium", "low"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLASSIFICATION RULES — follow these exactly:

TASK — Use when:
  • The user needs to DO something (action required)
  • There is a concrete next step, even if vague ("figure out X", "look into Y")
  • It involves contacting someone, completing a process, buying something, making a call
  • Phrases like: "need to", "have to", "should", "remind me", "don't forget", "must", "book", "call", "pay", "renew", "fix", "send", "reply"
  Examples: "call mom", "pay electricity bill", "renew passport", "look into newsletter platforms"

IDEA — Use ONLY when:
  • The thought is an abstract concept, creative vision, or hypothetical with NO immediate action
  • There is nothing to do yet — it's a concept to ponder later
  • Phrases like: "what if", "imagine if", "wouldn't it be cool", "someday maybe", "I wonder"
  Examples: "what if I built an app that tracks moods", "imagine a newsletter about focus", "wouldn't it be cool to have a coworking space"

KEY DISTINCTION: "I want to start a podcast" = TASK (actionable intent). "Podcasts about productivity could work well for audiences" = IDEA (abstract observation).
When in doubt, choose TASK.

GROCERY — Food, household items to purchase
GYM — Exercise, workouts, fitness tracking
UNCATEGORIZED — Only if truly nothing else fits

━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIORITY RULES:
- "high": Has a deadline, urgent, blocks other tasks, time-sensitive ("today", "ASAP", "by Friday", "urgent")
- "medium": Important but not urgent, standard tasks without specific deadlines
- "low": Nice-to-have, someday items, no real deadline ("eventually", "when I get time", "someday")

━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLES:

Input: "remind me to call sarah tomorrow and also buy bread. what if we launch a newsletter someday"
Output:
{
  "entries": [
    {
      "Category": "Task",
      "Reminder_Date": "2026-04-09",
      "Tags": ["call", "sarah"],
      "Clean_Text": "Call Sarah",
      "Priority": "high"
    },
    {
      "Category": "Grocery",
      "Reminder_Date": null,
      "Tags": ["bread"],
      "Clean_Text": "Bread",
      "Priority": "medium"
    },
    {
      "Category": "Idea",
      "Reminder_Date": null,
      "Tags": ["newsletter", "launch"],
      "Clean_Text": "What if we launched a newsletter someday?",
      "Priority": "low"
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
      Priority: 'medium',
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
      customContext = "\n\nCRITICAL CONTEXT — The user has previously corrected categorizations. Learn from these patterns:\n";
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
      temperature: 0,
      max_tokens: 1024,
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
    const validPriorities = ['low', 'medium', 'high'];
    
    const sanitizedEntries = parsed.entries.map((entry: any) => {
      const category = validCategories.includes(entry?.Category) ? entry.Category : 'Uncategorized';
      const rDate = (entry?.Reminder_Date && /^\d{4}-\d{2}-\d{2}$/.test(entry.Reminder_Date)) ? entry.Reminder_Date : null;
      const tags = Array.isArray(entry?.Tags) ? entry.Tags : [];
      const cText = entry?.Clean_Text || text;
      const priority = validPriorities.includes(entry?.Priority?.toLowerCase()) 
        ? entry.Priority.toLowerCase() 
        : 'medium';

      return {
        Category: category,
        Reminder_Date: rDate,
        Tags: tags,
        Clean_Text: cText,
        Priority: priority,
      };
    });

    return { entries: sanitizedEntries };
  } catch (err) {
    console.error('Failed to parse Groq response:', content, err);
    return fallbackResponse;
  }
}

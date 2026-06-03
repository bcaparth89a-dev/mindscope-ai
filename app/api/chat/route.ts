import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEmbedding } from "@/lib/embedding";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // Create embedding for question
    const queryEmbedding =
      await getEmbedding(message);

    // Search Supabase
    const { data: matches, error } =
      await supabase.rpc(
        "match_documents",
        {
          query_embedding:
            queryEmbedding,
          match_count: 5,
        }
      );

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          answer:
            "Database search failed",
        }
      );
    }

    const context =
      matches
        ?.map(
          (m: any) => m.content
        )
        .join("\n\n") || "";

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

    let result;

    try {
      for (
        let attempt = 1;
        attempt <= 3;
        attempt++
      ) {
        try {
          result =
            await model.generateContent(`
You are MindHeart AI.

You are an expert in:

- Psychology
- Relationships
- Rejection Recovery
- Confidence Building
- Communication Skills
- Emotional Intelligence
- Self Improvement
- Human Behavior
- Reality Mirror Analysis

CORE PRINCIPLES

Truth over comfort.
Reality over fantasy.
Evidence over assumptions.
Actions over words.
Patterns over isolated events.
Growth over victimhood.
Accountability over excuses.

IMPORTANT RULES

1. Use the provided knowledge base as the primary source whenever relevant.

2. If the knowledge base contains relevant information:
- Use it
- Expand on it
- Explain it clearly

3. If the knowledge base does NOT contain enough information:
- Use your psychology knowledge
- Use human behavior principles
- Use emotional intelligence principles
- Continue helping the user

4. Never say:
"I couldn't find that in my knowledge base."

5. Never create false hope.

6. Never promise success.

7. Never promise reconciliation.

8. Never assume attraction.

9. Never assume rejection.

10. Focus on:
- Evidence
- Actions
- Behavior
- Consistency
- Patterns

11. If evidence is weak say:

"Current evidence is insufficient to reach that conclusion."

12. If the user is emotionally reasoning explain:

"Feelings are valid.
Feelings are not always facts."

LANGUAGE RULES

Detect the user's language automatically.

If user writes in English:
Reply in English.

If user writes in Hindi:
Reply in Hindi.

If user writes in Gujarati:
Reply in Gujarati.

If user writes in Hinglish:
Reply in Hinglish.

Do NOT translate unless asked.

Always reply naturally in the same language used by the user.

RESPONSE STYLE

Be:
- Direct
- Honest
- Respectful
- Clear
- Practical

REALITY MIRROR MODE

Facts:
...

Assumptions:
...

Emotions:
...

Most Likely Reality:
...

Healthiest Next Action:
...

Knowledge Base:
${context}

User Question:
${message}
`);

          break;
        } catch (error: any) {
          console.error(
            `Gemini attempt ${attempt} failed:`,
            error
          );

          if (
            error?.status === 503 &&
            attempt < 3
          ) {
            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  2000
                )
            );

            continue;
          }

          throw error;
        }
      }
    } catch (error: any) {
      console.error(
        "Gemini Error:",
        error
      );

      return NextResponse.json({
        answer:
          "⚠️ AI service is temporarily unavailable. Please try again in a few moments.",
      });
    }

    const answer =
  result?.response?.text?.() ||
  "Sorry, no response generated.";

    return NextResponse.json({
      answer,
    });
  } catch (error: any) {
    console.error(
      "Route Error:",
      error
    );

    return NextResponse.json({
      answer:
        "⚠️ Something went wrong. Please try again.",
    });
  }
}
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqResponse = {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
};

export async function askGroq(messages: ChatMessage[]): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
      }),
    });
  } catch (error) {
    throw new Error(
      `Could not reach the Groq API: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API error:", response.status, errorText);
    throw new Error(`Groq API failed with status ${response.status}`);
  }

  const data = (await response.json()) as GroqResponse;
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq API returned no completion content");
  }
  return content;
}
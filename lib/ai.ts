import { quotes, type Quotes } from "./quotes";


const quotesMap: Record<string, Quotes> = quotes.reduce((map, quote) => {
  map[quote.id] = quote;
  return map;
}, {} as Record<string, Quotes>);

let data = "id,quote\n";

data += quotes
  .map((quote) => {
    const { id, quote: content } = quote;
    const formattedContent = content.replace(/"/g, "").replace(/\\n/g, "\n");

    return `${id},"${formattedContent}"`;
  })
  .join("\n");

const systemPrompt = `
Anda adalah sistem yang membantu menemukan baris data yang paling relevan dari sebuah daftar dengan kata kunci tertentu.
Perhatikan baik-baik pada bagian 'quote' dalam data.
Temukan quote yang paling relevan dengan kata kunci yang nanti saya berikan:

data:
id,quote
${data}

contoh:
input: takut dukun
output: [
  {
    id: 1,
  },
  {
    id: 2,
  }
]

hanya berikan response berupa json array yang berisi objek-objek dengan id yang relevan. berikan id saja, tidak perlu menuliskan quote, post, atau img.
jika ada lebih dari 5 id yang relevan, batasi hanya 5 id yang paling relevan saja.
`;
export const getQuotes = async (quote: string, env: { OPENROUTER_TOKEN: string; APP_TITLE: string; APP_URL: string }) => {
  interface ApiResponse {
    choices: { message: { content: string } }[];
  }

  const response: ApiResponse = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_TOKEN}`,
        "HTTP-Referer": env.APP_URL, // Use APP_URL from environment variables.
        "X-Title": env.APP_TITLE, // Use APP_TITLE from environment variables.
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-001",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: quote,
          },
        ],
      }),
    }
  ).then((r) => r.json());

  const content = response?.choices[0].message.content || "";

  // Log the raw content for debugging
  // console.log("Raw API response:", content);

  // Extract JSON content from the response using regex
  let jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let jsonString = jsonMatch ? jsonMatch[1] : content;

  // Clean the JSON string further
  jsonString = jsonString.trim();

  // Try to fix common JSON formatting issues
  // Replace single quotes with double quotes
  jsonString = jsonString.replace(/'/g, '"');

  // Handle potential trailing commas in objects which are invalid in JSON
  jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");
  const result = JSON.parse(jsonString);

  const _result = result.map((item: { id: string; q?: Quotes }) => {
    return {
      id: item.id,
      q: quotesMap[item.id],
    };
  });

  // console.log("Cleaned JSON string:", _result);
  return _result;
};

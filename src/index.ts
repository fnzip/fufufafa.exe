import { getQuotes } from "../lib/ai";
import { quotes } from "../lib/quotes";

interface Env {
  OPENROUTER_TOKEN: string;
  APP_TITLE: string;
  APP_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/ai":
        if (request.method === "POST") {
          const body = (await request.json()) as { quote?: string };
          const quote = body.quote;

          if (!quote) {
            return new Response('Missing "quote" field in request body', {
              status: 400,
            });
          }

          const data = await getQuotes(quote, env); // Pass the env object to getQuotes

          return new Response(JSON.stringify({ data }), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else {
          return new Response("Method Not Allowed", { status: 405 });
        }
      case "/random":
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        return new Response(JSON.stringify(randomQuote), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      default:
        return new Response("Not Found", { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;

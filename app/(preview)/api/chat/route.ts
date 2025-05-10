import { NextRequest } from "next/server";

console.log("AGENT_ID in browser:", process.env.NEXT_PUBLIC_CONTEXTUAL_AGENT_ID);
const AGENT_ID = process.env.NEXT_PUBLIC_CONTEXTUAL_AGENT_ID;
const API_TOKEN = process.env.CONTEXTUAL_API_TOKEN!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  body.stream = false;
  console.log("Payload sent to Contextual AI:", JSON.stringify(body, null, 2));

  const res = await fetch(
    `https://api.contextual.ai/v1/agents/${AGENT_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  console.log("Contextual AI API response:", data);
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: res.status,
  });
}

import { NextRequest } from "next/server";

const AGENT_ID = process.env.NEXT_PUBLIC_CONTEXTUAL_AGENT_ID!;
const API_TOKEN = process.env.CONTEXTUAL_API_TOKEN!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agent_id = searchParams.get("agent_id");
  const message_id = searchParams.get("message_id");
  const content_id = searchParams.get("content_id");

  if (!agent_id || !message_id || !content_id) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
  }

  const url = `https://api.contextual.ai/v1/agents/${agent_id}/query/${message_id}/retrieval/info?content_ids=${encodeURIComponent(content_id)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: res.status,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Payload sent to Contextual AI:", body);

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
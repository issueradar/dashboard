import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import type { NextRequest, NextResponse } from 'next/server';

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}

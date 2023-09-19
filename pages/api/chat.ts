import OpenAI from 'openai';
import { OpenAIStream, streamToResponse } from 'ai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function AnalyseWithGPT(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = JSON.parse(req.body);

  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: body.messages,
  });

  const stream = OpenAIStream(aiResponse);

  /**
   * Converts the stream to a Node.js Response-like object
   */
  return streamToResponse(stream, res);
}

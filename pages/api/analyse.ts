import { Configuration, OpenAIApi } from 'openai';
import { HttpMethod } from '@/types';

import type { NextApiRequest, NextApiResponse } from 'next';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function AnalyseWithGPT(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HttpMethod.POST) {
    res.setHeader('Allow', [HttpMethod.POST]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // TODO: Find out the limit of messages.content of OpenAI
  // then clean it before feeding

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: req.body,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).end(error);
  }
}

export type { CreateChatCompletionResponse } from 'openai';

export type Role = 'system' | 'assistant' | 'user';
export type Message = {
  role: Role;
  content: string;
};

import OpenAI from 'openai';

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

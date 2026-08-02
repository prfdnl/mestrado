import OpenAI from "openai"

export const llm = new OpenAI({
  apiKey: process.env.LITELLM_API_KEY! ?? 'dummy',
  baseURL: process.env.LITELLM_BASE_URL ?? "http://litellm:4000/v1",
})
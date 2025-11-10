import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { reverseQuestionTool } from '@/entities/reverseQuestion/model/tool'

// Define the tools available to the agent
const tools = {
  reverseQuestion: reverseQuestionTool
}

export async function handleAgentChat(messages: UIMessage[]) {
  const agent = streamText({
    model: google('gemini-2.5-flash'),
    system:
      'あなたは優秀なアシスタントです。ユーザーの質問に対して必ずreverseQuestionツールを使って逆質問をしてから回答してください。',
    messages: convertToModelMessages(messages),
    tools: tools
  })
  return agent
}

import { Hono } from 'hono'
import { UIMessage } from 'ai'
import { handleAgentChat } from '../model/agent'

const app = new Hono().post('/', async (c) => {
  const { messages }: { messages: UIMessage[] } = await c.req.json()
  const result = await handleAgentChat(messages)

  return result.toUIMessageStreamResponse()
})

export const agentsApi = app

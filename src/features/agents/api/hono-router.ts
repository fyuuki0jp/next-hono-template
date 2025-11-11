import { Hono } from 'hono'
import { UIMessage } from 'ai'
import { agentServiceFactory } from '../model/factory'

const app = new Hono().post('/', async (c) => {
  const { messages }: { messages: UIMessage[] } = await c.req.json()
  const service = agentServiceFactory()
  const result = service.handleChat(messages)

  return result.toUIMessageStreamResponse()
})

export const agentsApi = app

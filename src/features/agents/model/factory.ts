import { depend } from 'velona'

import { createAgentService } from './agent'

export const agentServiceFactory = depend({}, () => {
  return createAgentService()
})

export type AgentServiceFactory = typeof agentServiceFactory

import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { greetingApi } from '@/features/greeting/server'
import { agentsApi } from '@/features/agents/api/hono-router'

const app = new Hono().basePath('/api')

const api = app.route('/hello', greetingApi).route('/chat', agentsApi)

export type ApiSchema = typeof api

export const GET = handle(app)
export const POST = handle(app)

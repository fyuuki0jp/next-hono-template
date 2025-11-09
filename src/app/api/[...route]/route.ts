import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { assistantApi } from '@/features/assistant/server'
import { greetingApi } from '@/features/greeting/server'

const app = new Hono().basePath('/api')

const api = app.route('/hello', greetingApi).route('/assistant', assistantApi)

export type ApiSchema = typeof api

export const GET = handle(app)
export const POST = handle(app)

import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { greetingApi } from '@/features/greeting/server'

const app = new Hono().basePath('/api')

const api = app.route('/hello', greetingApi)

export type ApiSchema = typeof api

export const GET = handle(app)
export const POST = handle(app)

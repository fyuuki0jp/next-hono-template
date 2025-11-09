import { z } from 'zod'

import type { GreetingRow } from '../../../shared/db/schema'

export const greetingMessageSchema = z.string().min(1)

export const greetingSchema = z.object({
  id: z.number().int().positive(),
  message: greetingMessageSchema
})

export type GreetingModel = z.infer<typeof greetingSchema>

export const parseGreeting = (input: unknown): GreetingModel => greetingSchema.parse(input)

export const fromRow = (row: GreetingRow): GreetingModel =>
  greetingSchema.parse({
    id: row.id,
    message: row.message
  })

import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const greetings = pgTable('greetings', {
  id: serial('id').primaryKey(),
  message: text('message').notNull()
})

export type GreetingRow = typeof greetings.$inferSelect
export type NewGreetingRow = typeof greetings.$inferInsert

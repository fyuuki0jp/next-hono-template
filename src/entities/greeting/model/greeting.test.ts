import { describe, expect, it } from 'vitest'
import {
  greetingMessageSchema,
  greetingSchema,
  parseGreeting,
  fromRow,
  type GreetingModel
} from './greeting'
import type { GreetingRow } from '@/shared/db/schema'

describe('entities/greeting/model/greeting', () => {
  describe('greetingMessageSchema', () => {
    it('空文字列を拒否する', () => {
      expect(() => greetingMessageSchema.parse('')).toThrow()
    })

    it('有効な文字列を受け入れる', () => {
      const result = greetingMessageSchema.parse('Hello, World!')
      expect(result).toBe('Hello, World!')
    })
  })

  describe('greetingSchema', () => {
    it('有効なGreetingオブジェクトをパースする', () => {
      const input = {
        id: 1,
        message: 'Hello, Vitest!'
      }
      const result = greetingSchema.parse(input)
      expect(result).toEqual(input)
    })

    it('負のIDを拒否する', () => {
      const input = {
        id: -1,
        message: 'Hello'
      }
      expect(() => greetingSchema.parse(input)).toThrow()
    })

    it('0のIDを拒否する', () => {
      const input = {
        id: 0,
        message: 'Hello'
      }
      expect(() => greetingSchema.parse(input)).toThrow()
    })

    it('空のメッセージを拒否する', () => {
      const input = {
        id: 1,
        message: ''
      }
      expect(() => greetingSchema.parse(input)).toThrow()
    })

    it('messageフィールドが欠けている場合はエラー', () => {
      const input = {
        id: 1
      }
      expect(() => greetingSchema.parse(input)).toThrow()
    })

    it('idフィールドが欠けている場合はエラー', () => {
      const input = {
        message: 'Hello'
      }
      expect(() => greetingSchema.parse(input)).toThrow()
    })
  })

  describe('parseGreeting', () => {
    it('有効な入力をGreetingModelに変換する', () => {
      const input: unknown = {
        id: 42,
        message: 'Test greeting'
      }
      const result = parseGreeting(input)
      const expected: GreetingModel = {
        id: 42,
        message: 'Test greeting'
      }
      expect(result).toEqual(expected)
    })

    it('不正な入力でエラーをスローする', () => {
      const input: unknown = {
        id: 'not-a-number',
        message: 'Test'
      }
      expect(() => parseGreeting(input)).toThrow()
    })
  })

  describe('fromRow', () => {
    it('GreetingRowをGreetingModelに変換する', () => {
      const row: GreetingRow = {
        id: 100,
        message: 'Database greeting'
      }
      const result = fromRow(row)
      const expected: GreetingModel = {
        id: 100,
        message: 'Database greeting'
      }
      expect(result).toEqual(expected)
    })

    it('無効なrowでエラーをスローする', () => {
      const invalidRow = {
        id: -5,
        message: 'Invalid'
      } as GreetingRow
      expect(() => fromRow(invalidRow)).toThrow()
    })
  })
})

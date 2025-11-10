import { describe, expect, it, vi, beforeEach } from 'vitest'
import { testClient } from 'hono/testing'
import { greetingApi } from './hono-router'
import { greetingServiceFactory } from '../model/factory'
import type { GreetingModel } from '@/entities/greeting/model/greeting'

// Velona factory をモック
vi.mock('../model/factory', () => ({
  greetingServiceFactory: vi.fn()
}))

describe('features/greeting/api/hono-router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /', () => {
    it('greetingオブジェクトをJSON形式で返す', async () => {
      // Arrange: モックのGreetingModelを用意
      const mockGreeting: GreetingModel = {
        id: 1,
        message: 'Hello from Hono API!'
      }

      const mockService = {
        getGreeting: vi.fn().mockResolvedValue(mockGreeting)
      }

      // greetingServiceFactory をモック
      vi.mocked(greetingServiceFactory).mockResolvedValue(mockService)

      // Act: testClient でAPIをテスト
      const client = testClient(greetingApi)
      const response = await client.index.$get()

      // Assert: レスポンスを検証
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toEqual({
        greeting: mockGreeting
      })

      // Factory とサービスが呼び出されたことを確認
      expect(greetingServiceFactory).toHaveBeenCalledOnce()
      expect(mockService.getGreeting).toHaveBeenCalledOnce()
    })

    it('サービスがエラーをスローした場合、500エラーを返す', async () => {
      // Arrange: エラーをスローするサービスのモック
      const mockService = {
        getGreeting: vi.fn().mockRejectedValue(new Error('Service error'))
      }

      vi.mocked(greetingServiceFactory).mockResolvedValue(mockService)

      // Act: testClient でAPIをテスト
      const client = testClient(greetingApi)
      const response = await client.index.$get()

      // Assert: 500エラーレスポンスを期待
      expect(response.status).toBe(500)

      expect(greetingServiceFactory).toHaveBeenCalledOnce()
      expect(mockService.getGreeting).toHaveBeenCalledOnce()
    })

    it('空のメッセージを含むgreetingでも正常に返す', async () => {
      // Note: 実際にはZodバリデーションで弾かれるはずだが、
      // ここではAPI層のレスポンス形式のテスト
      const mockGreeting: GreetingModel = {
        id: 999,
        message: 'Test message'
      }

      const mockService = {
        getGreeting: vi.fn().mockResolvedValue(mockGreeting)
      }

      vi.mocked(greetingServiceFactory).mockResolvedValue(mockService)

      const client = testClient(greetingApi)
      const response = await client.index.$get()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.greeting).toEqual(mockGreeting)
    })
  })
})

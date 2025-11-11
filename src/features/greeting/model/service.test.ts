import { describe, expect, it, vi } from 'vitest'
import { createGreetingService, type GreetingService } from './service'
import type { GreetingRepository } from '../api/repository'
import type { GreetingModel } from '@/entities/greeting/model/greeting'
import { ok } from '@/shared/lib/result'

describe('features/greeting/model/service', () => {
  describe('createGreetingService', () => {
    it('repositoryのgetLatestを呼び出してGreetingを返す', async () => {
      // Arrange: モックのGreetingとRepositoryを用意
      const mockGreeting: GreetingModel = {
        id: 1,
        message: 'Hello from mock repository!'
      }

      const mockRepository: GreetingRepository = {
        getLatest: vi.fn().mockResolvedValue(ok(mockGreeting))
      }

      // Act: Serviceを作成してgetGreeting()を呼び出す
      const service: GreetingService = createGreetingService(mockRepository)
      const result = await service.getGreeting()

      // Assert: 正しい結果が返り、repositoryが呼び出されたか確認
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual(mockGreeting)
      }
      expect(mockRepository.getLatest).toHaveBeenCalledOnce()
    })

    it('repositoryがエラーを返した場合、そのまま伝播する', async () => {
      // Arrange: エラーを返すRepositoryのモック
      const mockRepository: GreetingRepository = {
        getLatest: vi
          .fn()
          .mockResolvedValue({ ok: false, error: { type: 'not_found', message: 'Greeting not found' } })
      }

      // Act & Assert: エラーが伝播することを確認
      const service: GreetingService = createGreetingService(mockRepository)
      const result = await service.getGreeting()
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.message).toBe('Greeting not found')
      }
      expect(mockRepository.getLatest).toHaveBeenCalledOnce()
    })

    it('複数回呼び出しても正しく動作する', async () => {
      // Arrange
      const mockGreeting1: GreetingModel = { id: 1, message: 'First call' }
      const mockGreeting2: GreetingModel = { id: 2, message: 'Second call' }

      const mockRepository: GreetingRepository = {
        getLatest: vi.fn().mockResolvedValueOnce(ok(mockGreeting1)).mockResolvedValueOnce(ok(mockGreeting2))
      }

      const service: GreetingService = createGreetingService(mockRepository)

      // Act & Assert
      const result1 = await service.getGreeting()
      expect(result1.ok).toBe(true)
      if (result1.ok) {
        expect(result1.value).toEqual(mockGreeting1)
      }

      const result2 = await service.getGreeting()
      expect(result2.ok).toBe(true)
      if (result2.ok) {
        expect(result2.value).toEqual(mockGreeting2)
      }

      expect(mockRepository.getLatest).toHaveBeenCalledTimes(2)
    })
  })
})

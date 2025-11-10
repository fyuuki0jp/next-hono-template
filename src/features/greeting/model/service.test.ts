import { describe, expect, it, vi } from 'vitest'
import { createGreetingService, type GreetingService } from './service'
import type { GreetingRepository } from '@/entities/greeting/api/repository'
import type { GreetingModel } from '@/entities/greeting/model/greeting'

describe('features/greeting/model/service', () => {
  describe('createGreetingService', () => {
    it('repositoryのgetLatestを呼び出してGreetingを返す', async () => {
      // Arrange: モックのGreetingとRepositoryを用意
      const mockGreeting: GreetingModel = {
        id: 1,
        message: 'Hello from mock repository!'
      }

      const mockRepository: GreetingRepository = {
        getLatest: vi.fn().mockResolvedValue(mockGreeting)
      }

      // Act: Serviceを作成してgetGreeting()を呼び出す
      const service: GreetingService = createGreetingService(mockRepository)
      const result = await service.getGreeting()

      // Assert: 正しい結果が返り、repositoryが呼び出されたか確認
      expect(result).toEqual(mockGreeting)
      expect(mockRepository.getLatest).toHaveBeenCalledOnce()
    })

    it('repositoryがエラーをスローした場合、そのまま伝播する', async () => {
      // Arrange: エラーをスローするRepositoryのモック
      const mockError = new Error('Database connection failed')
      const mockRepository: GreetingRepository = {
        getLatest: vi.fn().mockRejectedValue(mockError)
      }

      // Act & Assert: エラーが伝播することを確認
      const service: GreetingService = createGreetingService(mockRepository)
      await expect(service.getGreeting()).rejects.toThrow('Database connection failed')
      expect(mockRepository.getLatest).toHaveBeenCalledOnce()
    })

    it('複数回呼び出しても正しく動作する', async () => {
      // Arrange
      const mockGreeting1: GreetingModel = { id: 1, message: 'First call' }
      const mockGreeting2: GreetingModel = { id: 2, message: 'Second call' }

      const mockRepository: GreetingRepository = {
        getLatest: vi.fn().mockResolvedValueOnce(mockGreeting1).mockResolvedValueOnce(mockGreeting2)
      }

      const service: GreetingService = createGreetingService(mockRepository)

      // Act & Assert
      const result1 = await service.getGreeting()
      expect(result1).toEqual(mockGreeting1)

      const result2 = await service.getGreeting()
      expect(result2).toEqual(mockGreeting2)

      expect(mockRepository.getLatest).toHaveBeenCalledTimes(2)
    })
  })
})

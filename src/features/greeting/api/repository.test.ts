import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createGreetingRepository, type GreetingRepository } from './repository'
import type { DbClient } from '@/shared/db/client'
import type { GreetingRow } from '@/shared/db/schema'

describe('entities/greeting/api/repository', () => {
  describe('createGreetingRepository', () => {
    let mockDb: DbClient
    let repository: GreetingRepository

    beforeEach(() => {
      // Drizzle ORM の select クエリビルダーをモック
      const mockSelect = vi.fn()
      const mockFrom = vi.fn()
      const mockOrderBy = vi.fn()
      const mockLimit = vi.fn()

      // チェーンメソッドの設定
      mockSelect.mockReturnValue({ from: mockFrom })
      mockFrom.mockReturnValue({ orderBy: mockOrderBy })
      mockOrderBy.mockReturnValue({ limit: mockLimit })

      mockDb = {
        select: mockSelect
      } as unknown as DbClient

      repository = createGreetingRepository(mockDb)
    })

    describe('getLatest', () => {
      it('最新のGreetingを返す', async () => {
        // Arrange: モックデータの準備
        const mockRow: GreetingRow = {
          id: 42,
          message: 'Latest greeting message'
        }

        // limit() が配列を返すようにモック
        const mockLimit = vi.fn().mockResolvedValue([mockRow])
        const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
        const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
        const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

        mockDb.select = mockSelect

        // Act: getLatest を呼び出す
        const result = await repository.getLatest()

        // Assert: 正しい結果が返ることを確認（Result型のok variant）
        expect(result).toEqual({
          ok: true,
          value: {
            id: 42,
            message: 'Latest greeting message'
          }
        })

        // クエリが正しく構築されたか確認
        expect(mockSelect).toHaveBeenCalledOnce()
        expect(mockFrom).toHaveBeenCalledOnce()
        expect(mockOrderBy).toHaveBeenCalledOnce()
        expect(mockLimit).toHaveBeenCalledWith(1)
      })

      it('Greetingが存在しない場合はエラーをスローする', async () => {
        // Arrange: 空の結果を返すモック
        const mockLimit = vi.fn().mockResolvedValue([])
        const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
        const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
        const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

        mockDb.select = mockSelect

        // Act: getLatest を呼び出す
        const result = await repository.getLatest()

        // Assert: Result型のerr variantが返されることを確認
        expect(result).toEqual({
          ok: false,
          error: {
            type: 'not_found',
            message: 'Greeting not found'
          }
        })
      })

      it('データベースエラーをそのまま伝播する', async () => {
        // Arrange: DBエラーをスローするモック
        const dbError = new Error('Database connection error')
        const mockLimit = vi.fn().mockRejectedValue(dbError)
        const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
        const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
        const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

        mockDb.select = mockSelect

        // Act: getLatest を呼び出す
        const result = await repository.getLatest()

        // Assert: Result型のerr variant（database_error）が返されることを確認
        expect(result).toEqual({
          ok: false,
          error: {
            type: 'database_error',
            message: 'Failed to fetch greeting from database',
            cause: dbError
          }
        })
      })

      it('fromRow で不正なデータの場合はエラーをスローする', async () => {
        // Arrange: 不正な形式のデータ
        const invalidRow = {
          id: -1, // 負のIDは不正
          message: 'Invalid'
        } as GreetingRow

        const mockLimit = vi.fn().mockResolvedValue([invalidRow])
        const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
        const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
        const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

        mockDb.select = mockSelect

        // Act: getLatest を呼び出す
        const result = await repository.getLatest()

        // Assert: Result型のerr variant（database_error with ZodError cause）が返されることを確認
        expect(result.ok).toBe(false)
        if (!result.ok) {
          expect(result.error.type).toBe('database_error')
          expect(result.error.message).toBe('Failed to fetch greeting from database')
          // Type guard for database_error to access cause
          if (result.error.type === 'database_error') {
            expect(result.error.cause).toBeDefined()
          }
        }
      })

      it('複数のGreetingが存在する場合、最新の1件のみを返す', async () => {
        // Arrange: 複数行が返される想定だが、limit(1) で1件のみ
        const mockRows: GreetingRow[] = [
          { id: 100, message: 'Newest' }
          // limit(1) なので実際には1件のみ返る
        ]

        const mockLimit = vi.fn().mockResolvedValue(mockRows)
        const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
        const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
        const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

        mockDb.select = mockSelect

        // Act
        const result = await repository.getLatest()

        // Assert: 最初の行が返される（Result型のok variant）
        expect(result).toEqual({
          ok: true,
          value: {
            id: 100,
            message: 'Newest'
          }
        })

        expect(mockLimit).toHaveBeenCalledWith(1)
      })
    })
  })
})

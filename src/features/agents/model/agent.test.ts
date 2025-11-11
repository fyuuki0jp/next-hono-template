import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createAgentService } from './agent'
import type { UIMessage } from 'ai'
import { streamText } from 'ai'

// AI SDKのstreamText関数をモック
vi.mock('ai', async () => {
  const actual = await vi.importActual('ai')
  return {
    ...actual,
    streamText: vi.fn(),
    convertToModelMessages: vi.fn((messages) => messages) // そのまま返す
  }
})

// Google AI SDKをモック
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mocked-model')
}))

describe('features/agents/model/agent', () => {
  describe('createAgentService', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('streamTextを正しいパラメータで呼び出す', async () => {
      // Arrange: モックメッセージ
      const messages = [
        {
          id: '1',
          role: 'user',
          display: 'こんにちは'
        }
      ] as unknown as UIMessage[]

      // streamTextのモック戻り値
      const mockStreamResult = {
        toUIMessageStreamResponse: vi.fn().mockReturnValue('mock-stream-response')
      }
      vi.mocked(streamText).mockReturnValue(mockStreamResult as any)

      // Act
      const service = createAgentService()
      const result = service.handleChat(messages)

      // Assert: streamTextが呼び出された
      expect(streamText).toHaveBeenCalledOnce()

      // 呼び出し時の引数を検証
      const callArgs = vi.mocked(streamText).mock.calls[0][0]
      expect(callArgs).toMatchObject({
        model: 'mocked-model',
        system: expect.stringContaining('reverseQuestion')
      })

      // toolsが含まれていることを確認
      expect(callArgs.tools).toBeDefined()
      if (callArgs.tools) {
        expect(callArgs.tools.reverseQuestion).toBeDefined()
      }

      // messagesが変換されて渡されていることを確認
      expect(callArgs.messages).toBeDefined()

      // toUIMessageStreamResponseが返されることを確認
      expect(result.toUIMessageStreamResponse).toBeDefined()
    })

    it('複数のメッセージを処理する', async () => {
      // Arrange: 複数のメッセージ
      const messages = [
        {
          id: '1',
          role: 'user',
          display: '最初のメッセージ'
        },
        {
          id: '2',
          role: 'assistant',
          display: '応答'
        },
        {
          id: '3',
          role: 'user',
          display: '次のメッセージ'
        }
      ] as unknown as UIMessage[]

      const mockStreamResult = {
        toUIMessageStreamResponse: vi.fn()
      }
      vi.mocked(streamText).mockReturnValue(mockStreamResult as any)

      // Act
      const service = createAgentService()
      service.handleChat(messages)

      // Assert: streamTextが呼び出された
      expect(streamText).toHaveBeenCalledOnce()

      const callArgs = vi.mocked(streamText).mock.calls[0][0]
      expect(callArgs.messages).toBeDefined()
    })

    it('空のメッセージ配列でも処理できる', async () => {
      // Arrange
      const messages: UIMessage[] = []

      const mockStreamResult = {
        toUIMessageStreamResponse: vi.fn()
      }
      vi.mocked(streamText).mockReturnValue(mockStreamResult as any)

      // Act
      const service = createAgentService()
      service.handleChat(messages)

      // Assert: エラーをスローせず正常に実行
      expect(streamText).toHaveBeenCalledOnce()
    })

    it('systemプロンプトにreverseQuestionの指示が含まれる', async () => {
      // Arrange
      const messages = [{ id: '1', role: 'user', display: 'test' }] as unknown as UIMessage[]

      const mockStreamResult = {
        toUIMessageStreamResponse: vi.fn()
      }
      vi.mocked(streamText).mockReturnValue(mockStreamResult as any)

      // Act
      const service = createAgentService()
      service.handleChat(messages)

      // Assert
      const callArgs = vi.mocked(streamText).mock.calls[0][0]
      expect(callArgs.system).toContain('reverseQuestion')
      expect(callArgs.system).toContain('逆質問')
    })

    it('reverseQuestionツールが正しく設定される', async () => {
      // Arrange
      const messages = [{ id: '1', role: 'user', display: 'test' }] as unknown as UIMessage[]

      const mockStreamResult = {
        toUIMessageStreamResponse: vi.fn()
      }
      vi.mocked(streamText).mockReturnValue(mockStreamResult as any)

      // Act
      const service = createAgentService()
      service.handleChat(messages)

      // Assert
      const callArgs = vi.mocked(streamText).mock.calls[0][0]
      expect(callArgs.tools).toHaveProperty('reverseQuestion')

      // reverseQuestionツールがdescriptionとinputSchemaを持つことを確認
      if (callArgs.tools) {
        const tool = callArgs.tools.reverseQuestion
        expect(tool).toHaveProperty('description')
        expect(tool).toHaveProperty('inputSchema')
      }
    })
  })
})

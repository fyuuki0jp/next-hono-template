import { describe, expect, it } from 'vitest'
import { reverseQuestionTool, reverseQuestionInputSchema, type ReverseQuestionInput } from './tool'

describe('entities/reverseQuestion/model/tool', () => {
  describe('reverseQuestionInputSchema validation', () => {
    it('text型の質問を正しくバリデーションする', () => {
      const input: ReverseQuestionInput = {
        question: 'お名前を教えてください',
        type: 'text',
        placeholder: '山田太郎',
        required: true
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(input)
      }
    })

    it('select型の質問を正しくバリデーションする', () => {
      const input: ReverseQuestionInput = {
        question: 'プログラミング言語を選択してください',
        type: 'select',
        options: [
          { label: 'TypeScript', value: 'ts', description: '型安全なJS' },
          { label: 'Python', value: 'py', description: '汎用言語' },
          { label: 'Rust', value: 'rust' }
        ],
        required: false
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(input)
      }
    })

    it('必須フィールドのみの最小構成を受け入れる', () => {
      const input: ReverseQuestionInput = {
        question: '何か教えてください',
        type: 'text'
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('空の質問文を拒否する', () => {
      const input = {
        question: '',
        type: 'text'
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('questionフィールドが欠けている場合はエラー', () => {
      const input = {
        type: 'text'
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('typeフィールドが欠けている場合はエラー', () => {
      const input = {
        question: 'test'
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('不正なtype値を拒否する', () => {
      const input = {
        question: 'test question',
        type: 'checkbox' // 'text' or 'select' のみ許可
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('optionsの各要素が正しい構造を持つことを検証する', () => {
      const input: ReverseQuestionInput = {
        question: 'Choose one',
        type: 'select',
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2', description: 'Description' }
        ]
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('optionsのlabelが欠けている場合はエラー', () => {
      const input = {
        question: 'Choose one',
        type: 'select',
        options: [{ value: 'opt1' }] // labelが欠けている
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('optionsのvalueが欠けている場合はエラー', () => {
      const input = {
        question: 'Choose one',
        type: 'select',
        options: [{ label: 'Option 1' }] // valueが欠けている
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('text型でもoptionsフィールドを持つことができる（警告なし）', () => {
      // スキーマ上はtext型でもoptionsを持てる（バリデーションエラーにならない）
      const input = {
        question: 'test',
        type: 'text' as const,
        options: [{ label: 'dummy', value: 'dummy' }]
      }

      const result = reverseQuestionInputSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('reverseQuestionToolがdescriptionを持つ', () => {
      expect(reverseQuestionTool.description).toBeDefined()
      expect(reverseQuestionTool.description).toContain('質問')
    })
  })
})

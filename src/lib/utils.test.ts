import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('lib/utils', () => {
  describe('cn', () => {
    it('単一のクラス名を返す', () => {
      expect(cn('text-center')).toBe('text-center')
    })

    it('複数のクラス名を結合する', () => {
      expect(cn('text-center', 'font-bold')).toBe('text-center font-bold')
    })

    it('条件付きクラスを処理する', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('falseの条件付きクラスを無視する', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class')
    })

    it('Tailwindの競合するクラスを適切にマージする', () => {
      // twMerge は後のクラスを優先する
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('配列形式のクラスを処理する', () => {
      const result = cn(['text-sm', 'font-medium'])
      expect(result).toBe('text-sm font-medium')
    })

    it('オブジェクト形式のクラスを処理する', () => {
      const result = cn({
        'text-red-500': true,
        'text-blue-500': false,
        'font-bold': true
      })
      expect(result).toBe('text-red-500 font-bold')
    })

    it('undefinedとnullを無視する', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toBe('base end')
    })

    it('複雑な組み合わせを処理する', () => {
      const isDisabled = false
      const size = 'large' as 'large' | 'small'
      const result = cn(
        'button',
        {
          'button-disabled': isDisabled,
          'button-large': size === 'large',
          'button-small': size === 'small'
        },
        'rounded'
      )
      expect(result).toBe('button button-large rounded')
    })

    it('空の入力で空文字列を返す', () => {
      expect(cn()).toBe('')
    })
  })
})

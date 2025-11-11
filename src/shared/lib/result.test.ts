import { describe, it, expect, vi } from 'vitest'
import {
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  map,
  mapErr,
  andThen,
  tap,
  tapErr,
  match,
  tryCatch,
  tryCatchAsync,
  combine,
  type Result
} from './result'

describe('Result type', () => {
  describe('ok and err constructors', () => {
    it('should create Ok result', () => {
      const result = ok(42)
      expect(result.ok).toBe(true)
      expect(result.value).toBe(42)
    })

    it('should create Err result', () => {
      const error = new Error('test error')
      const result = err(error)
      expect(result.ok).toBe(false)
      expect(result.error).toBe(error)
    })
  })

  describe('isOk and isErr', () => {
    it('should identify Ok result', () => {
      const result = ok(42)
      expect(isOk(result)).toBe(true)
      expect(isErr(result)).toBe(false)
    })

    it('should identify Err result', () => {
      const result = err(new Error('test'))
      expect(isOk(result)).toBe(false)
      expect(isErr(result)).toBe(true)
    })

    it('should narrow types correctly', () => {
      const result: Result<number, Error> = ok(42)
      if (isOk(result)) {
        // Type should be narrowed to Ok<number>
        expect(result.value).toBe(42)
      }
    })
  })

  describe('unwrap', () => {
    it('should unwrap Ok value', () => {
      const result = ok(42)
      expect(unwrap(result)).toBe(42)
    })

    it('should throw on Err', () => {
      const error = new Error('test error')
      const result = err(error)
      expect(() => unwrap(result)).toThrow(error)
    })
  })

  describe('unwrapOr', () => {
    it('should return value for Ok', () => {
      const result = ok(42)
      expect(unwrapOr(result, 0)).toBe(42)
    })

    it('should return default for Err', () => {
      const result = err(new Error('test'))
      expect(unwrapOr(result, 0)).toBe(0)
    })
  })

  describe('map', () => {
    it('should map over Ok value', () => {
      const result = ok(42)
      const mapped = map(result, (x) => x * 2)
      expect(unwrap(mapped)).toBe(84)
    })

    it('should not map over Err', () => {
      const error = new Error('test')
      const result: Result<number, Error> = err(error)
      const mapped = map(result, (x: number) => x * 2)
      expect(isErr(mapped)).toBe(true)
      if (!mapped.ok) {
        expect(mapped.error).toBe(error)
      }
    })
  })

  describe('mapErr', () => {
    it('should map over Err value', () => {
      const result: Result<number, string> = err('error')
      const mapped = mapErr(result, (e) => e.toUpperCase())
      expect(isErr(mapped)).toBe(true)
      if (!mapped.ok) {
        expect(mapped.error).toBe('ERROR')
      }
    })

    it('should not map over Ok', () => {
      const result: Result<number, string> = ok(42)
      const mapped = mapErr(result, (e: string) => e.toUpperCase())
      expect(unwrap(mapped)).toBe(42)
    })
  })

  describe('andThen', () => {
    it('should chain Ok results', () => {
      const result = ok(42)
      const chained = andThen(result, (x) => ok(x * 2))
      expect(unwrap(chained)).toBe(84)
    })

    it('should return Err if initial is Err', () => {
      const error = new Error('initial error')
      const result: Result<number, Error> = err(error)
      const chained = andThen(result, (x: number) => ok(x * 2))
      expect(isErr(chained)).toBe(true)
      if (!chained.ok) {
        expect(chained.error).toBe(error)
      }
    })

    it('should return Err if chain returns Err', () => {
      const result = ok(42)
      const chainError = new Error('chain error')
      const chained = andThen(result, () => err(chainError))
      expect(isErr(chained)).toBe(true)
      if (!chained.ok) {
        expect(chained.error).toBe(chainError)
      }
    })
  })

  describe('tap and tapErr', () => {
    it('should execute side effect on Ok', () => {
      const sideEffect = vi.fn()
      const result = ok(42)
      const tapped = tap(result, sideEffect)
      expect(sideEffect).toHaveBeenCalledWith(42)
      expect(tapped).toBe(result)
    })

    it('should not execute side effect on Err', () => {
      const sideEffect = vi.fn()
      const result: Result<number, Error> = err(new Error('test'))
      const tapped = tap(result, sideEffect)
      expect(sideEffect).not.toHaveBeenCalled()
      expect(tapped).toBe(result)
    })

    it('should execute side effect on Err', () => {
      const sideEffect = vi.fn()
      const error = new Error('test')
      const result: Result<number, Error> = err(error)
      const tapped = tapErr(result, sideEffect)
      expect(sideEffect).toHaveBeenCalledWith(error)
      expect(tapped).toBe(result)
    })

    it('should not execute side effect on Ok', () => {
      const sideEffect = vi.fn()
      const result = ok(42)
      const tapped = tapErr(result, sideEffect)
      expect(sideEffect).not.toHaveBeenCalled()
      expect(tapped).toBe(result)
    })
  })

  describe('match', () => {
    it('should match Ok pattern', () => {
      const result = ok(42)
      const matched = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`
      })
      expect(matched).toBe('Success: 42')
    })

    it('should match Err pattern', () => {
      const result: Result<number, string> = err('test error')
      const matched = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`
      })
      expect(matched).toBe('Error: test error')
    })
  })

  describe('tryCatch', () => {
    it('should catch exceptions and return Err', () => {
      const result = tryCatch(() => {
        throw new Error('test error')
      })
      expect(isErr(result)).toBe(true)
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error)
        expect((result.error as Error).message).toBe('test error')
      }
    })

    it('should return Ok for successful execution', () => {
      const result = tryCatch(() => 42)
      expect(unwrap(result)).toBe(42)
    })

    it('should use custom error mapper', () => {
      const result = tryCatch(
        () => {
          throw new Error('test error')
        },
        (e) => `Custom: ${(e as Error).message}`
      )
      expect(isErr(result)).toBe(true)
      if (!result.ok) {
        expect(result.error).toBe('Custom: test error')
      }
    })
  })

  describe('tryCatchAsync', () => {
    it('should catch async exceptions and return Err', async () => {
      const result = await tryCatchAsync(async () => {
        throw new Error('async error')
      })
      expect(isErr(result)).toBe(true)
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error)
        expect((result.error as Error).message).toBe('async error')
      }
    })

    it('should return Ok for successful async execution', async () => {
      const result = await tryCatchAsync(async () => 42)
      expect(unwrap(result)).toBe(42)
    })

    it('should use custom error mapper', async () => {
      const result = await tryCatchAsync(
        async () => {
          throw new Error('async error')
        },
        (e) => `Custom: ${(e as Error).message}`
      )
      expect(isErr(result)).toBe(true)
      if (!result.ok) {
        expect(result.error).toBe('Custom: async error')
      }
    })
  })

  describe('combine', () => {
    it('should combine all Ok results', () => {
      const results = [ok(1), ok(2), ok(3)]
      const combined = combine(results)
      expect(unwrap(combined)).toEqual([1, 2, 3])
    })

    it('should return first Err', () => {
      const error = new Error('test error')
      const results: Result<number, Error>[] = [ok(1), err(error), ok(3)]
      const combined = combine(results)
      expect(isErr(combined)).toBe(true)
      if (!combined.ok) {
        expect(combined.error).toBe(error)
      }
    })

    it('should handle empty array', () => {
      const results: Result<number, Error>[] = []
      const combined = combine(results)
      expect(unwrap(combined)).toEqual([])
    })
  })
})

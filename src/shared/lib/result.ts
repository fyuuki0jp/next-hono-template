/**
 * Result type for explicit error handling without exceptions
 * Inspired by Rust's Result<T, E> and functional programming patterns
 */

export type Result<T, E = Error> = Ok<T> | Err<E>

export type Ok<T> = {
  readonly ok: true
  readonly value: T
}

export type Err<E> = {
  readonly ok: false
  readonly error: E
}

/**
 * Create a successful Result
 */
export const ok = <T>(value: T): Ok<T> => ({
  ok: true,
  value
})

/**
 * Create a failed Result
 */
export const err = <E>(error: E): Err<E> => ({
  ok: false,
  error
})

/**
 * Type guard to check if Result is Ok
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok

/**
 * Type guard to check if Result is Err
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok

/**
 * Unwrap Result value or throw error
 * Use only when you're certain the Result is Ok
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value
  }
  throw result.error
}

/**
 * Unwrap Result value or return default value
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return result.ok ? result.value : defaultValue
}

/**
 * Map over Ok value, leave Err untouched
 */
export const map = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
  return result.ok ? ok(fn(result.value)) : result
}

/**
 * Map over Err value, leave Ok untouched
 */
export const mapErr = <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> => {
  return result.ok ? result : err(fn(result.error))
}

/**
 * Chain Result-returning operations (flatMap/bind)
 */
export const andThen = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> => {
  return result.ok ? fn(result.value) : result
}

/**
 * Execute side effect if Result is Ok
 */
export const tap = <T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E> => {
  if (result.ok) {
    fn(result.value)
  }
  return result
}

/**
 * Execute side effect if Result is Err
 */
export const tapErr = <T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> => {
  if (!result.ok) {
    fn(result.error)
  }
  return result
}

/**
 * Match pattern for Result handling
 */
export const match = <T, E, U>(
  result: Result<T, E>,
  patterns: {
    ok: (value: T) => U
    err: (error: E) => U
  }
): U => {
  return result.ok ? patterns.ok(result.value) : patterns.err(result.error)
}

/**
 * Wrap a throwing function in a Result
 */
export const tryCatch = <T, E = Error>(
  fn: () => T,
  onError: (error: unknown) => E = (e) => e as E
): Result<T, E> => {
  try {
    return ok(fn())
  } catch (error) {
    return err(onError(error))
  }
}

/**
 * Wrap an async throwing function in a Result
 */
export const tryCatchAsync = async <T, E = Error>(
  fn: () => Promise<T>,
  onError: (error: unknown) => E = (e) => e as E
): Promise<Result<T, E>> => {
  try {
    const value = await fn()
    return ok(value)
  } catch (error) {
    return err(onError(error))
  }
}

/**
 * Combine multiple Results into a single Result
 * If all are Ok, returns Ok with array of values
 * If any is Err, returns the first Err
 */
export const combine = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = []
  for (const result of results) {
    if (!result.ok) {
      return result
    }
    values.push(result.value)
  }
  return ok(values)
}

'use client'

import { GreetingMessage } from '@/entities/greeting/ui/GreetingMessage'
import type { GreetingModel } from '@/entities/greeting/model/greeting'
import { useGreeting } from '../hook/useGreeting'

type GreetingProps = {
  initialGreeting: GreetingModel
  apiBaseUrl: string
}

export const Greeting = ({ initialGreeting, apiBaseUrl }: GreetingProps) => {
  const { greeting, refresh, isPending } = useGreeting({ initialGreeting, apiBaseUrl })

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      {greeting ? <GreetingMessage greeting={greeting} /> : <p>Loading...</p>}
      <button
        type="button"
        onClick={() => refresh()}
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? '更新中...' : '再読み込み'}
      </button>
    </section>
  )
}

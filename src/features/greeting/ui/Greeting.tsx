'use client'

import { GreetingMessage } from '@/entities/greeting/ui/GreetingMessage'
import type { GreetingModel } from '@/entities/greeting/model/greeting'
import { useGreeting } from '../hook/useGreeting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type GreetingProps = {
  initialGreeting: GreetingModel
  apiBaseUrl: string
}

export const Greeting = ({ initialGreeting, apiBaseUrl }: GreetingProps) => {
  const { greeting, refresh, isPending } = useGreeting({ initialGreeting, apiBaseUrl })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello world!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {greeting ? <GreetingMessage greeting={greeting} /> : <p className="text-muted-foreground">Loading...</p>}
        <Button
          onClick={() => refresh()}
          disabled={isPending}
          variant="default"
        >
          {isPending ? '更新中...' : '再読み込み'}
        </Button>
      </CardContent>
    </Card>
  )
}

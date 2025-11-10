import type { GreetingModel } from '@/entities/greeting/model/greeting'

type GreetingMessageProps = {
  greeting: GreetingModel
}

export const GreetingMessage = ({ greeting }: GreetingMessageProps) => (
  <p className="text-lg text-foreground">{greeting.message}</p>
)

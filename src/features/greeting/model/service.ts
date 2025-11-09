import type { GreetingModel } from '@/entities/greeting/model/greeting'
import type { GreetingRepository } from '@/entities/greeting/api/repository'

export interface GreetingService {
  getGreeting(): Promise<GreetingModel>
}

export const createGreetingService = (repository: GreetingRepository): GreetingService => ({
  getGreeting: () => repository.getLatest()
})

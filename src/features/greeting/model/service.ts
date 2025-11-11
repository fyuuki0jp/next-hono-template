import type { GreetingModel } from '@/entities/greeting/model/greeting'
import type { GreetingRepository, GreetingRepositoryError } from '../api/repository'
import type { Result } from '@/shared/lib/result'

export type GreetingServiceError = GreetingRepositoryError

export interface GreetingService {
  getGreeting(): Promise<Result<GreetingModel, GreetingServiceError>>
}

export const createGreetingService = (repository: GreetingRepository): GreetingService => ({
  getGreeting: () => repository.getLatest()
})

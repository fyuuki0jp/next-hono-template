'use client'

import { useMemo } from 'react'

import { parseGreeting, type GreetingModel } from '@/entities/greeting/model/greeting'

export const useGreetingValue = (input: unknown): GreetingModel =>
  useMemo(() => parseGreeting(input), [input])

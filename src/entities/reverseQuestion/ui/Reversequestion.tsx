import { useEffect, useState, type FormEvent } from 'react'
import type { ReverseQuestionOption } from '../model'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type QuestionType = 'text' | 'select'

type ReverseQuestionProps = {
  question: string
  type: QuestionType
  options?: ReverseQuestionOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: string
  submitLabel?: string
  onSubmit: (value: string) => void
}

export const ReverseQuestion = ({
  question,
  type,
  options,
  placeholder,
  required = true,
  disabled = false,
  defaultValue = '',
  submitLabel = '送信',
  onSubmit
}: ReverseQuestionProps) => {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalized = type === 'text' ? value.trim() : value

    if (required && !normalized) {
      setError('回答を入力してください')
      return
    }

    setError(null)
    onSubmit(normalized)
  }

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setError(null)
          }}
          disabled={disabled}
        >
          <option value="" disabled>
            選択してください
          </option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <Input
        type="text"
        className="mt-3"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setError(null)
        }}
        disabled={disabled}
      />
    )
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <form onSubmit={handleSubmit} className="flex flex-col p-4 space-y-3">
        <p className="font-semibold text-foreground">{question}</p>
        {renderInput()}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={disabled}>
          {submitLabel}
        </Button>
      </form>
    </Card>
  )
}

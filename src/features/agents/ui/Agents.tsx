'use client'

import { ReverseQuestion } from '@/entities/reverseQuestion'
import type { ReverseQuestionInput } from '@/entities/reverseQuestion'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AgentsProps = {
  apiBaseUrl: string
}

export default function Agents({ apiBaseUrl }: AgentsProps) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: apiBaseUrl
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls
  })

  const handleReverseQuestionSubmit =
    (toolCallId: string, question: ReverseQuestionInput) => (answer: string) => {
      const selectedOption =
        question.type === 'select'
          ? question.options?.find((option) => option.value === answer)
          : undefined

      addToolOutput({
        tool: 'reverseQuestion',
        toolCallId,
        output: {
          answer: question.type === 'select' ? (selectedOption?.label ?? answer) : answer,
          optionValue: selectedOption?.value,
          optionLabel: selectedOption?.label,
          type: question.type,
          question: question.question
        }
      })
    }

  const renderMessage = (message: UIMessage) => {
    return message.parts.map((part, index) => {
      if (part.type === 'text') {
        return <ReactMarkdown key={index}>{part.text}</ReactMarkdown>
      }
      if (part.type === 'tool-reverseQuestion') {
        const questionInput = part.input as ReverseQuestionInput | undefined

        if (!questionInput) {
          return (
            <span key={index} className="text-muted-foreground">
              質問を準備しています...
            </span>
          )
        }

        if (part.state === 'output-available') {
          const output = part.output as { answer?: string } | undefined
          return (
            <div
              key={index}
              className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm"
            >
              <p className="font-semibold">{questionInput.question}</p>
              <p className="mt-1 text-muted-foreground">回答: {output?.answer ?? '送信済み'}</p>
            </div>
          )
        }

        if (part.state === 'output-error') {
          return (
            <div
              key={index}
              className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm"
            >
              <p className="font-semibold">{questionInput.question}</p>
              <p className="mt-1 text-destructive">
                回答処理でエラーが発生しました。もう一度お試しください。
              </p>
            </div>
          )
        }

        if (part.state === 'input-available') {
          if (
            questionInput.type === 'select' &&
            (!questionInput.options || questionInput.options.length === 0)
          ) {
            return (
              <div
                key={index}
                className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm"
              >
                選択式の質問ですが、選択肢が定義されていません。
              </div>
            )
          }

          return (
            <ReverseQuestion
              key={index}
              question={questionInput.question}
              type={questionInput.type}
              options={questionInput.options}
              placeholder={questionInput.placeholder}
              required={questionInput.required}
              onSubmit={handleReverseQuestionSubmit(part.toolCallId, questionInput)}
            />
          )
        }

        return (
          <span key={index} className="text-muted-foreground">
            質問内容を受信中...
          </span>
        )
      }
      return null
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 min-h-[200px] max-h-[500px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {renderMessage(message)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim()) {
              sendMessage({ text: input })
              setInput('')
            }
          }}
          className="flex gap-2"
        >
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim()}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

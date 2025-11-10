# Agent Implementation Pattern

This document describes the pattern for implementing AI agents in this Next.js + Hono project using the AI SDK.

## Architecture Overview

The agent feature follows FSD (Feature-Sliced Design) architecture with clear separation of concerns:

```
features/agents/
├── api/              # API routing (Hono)
│   ├── hono-router.ts
│   └── index.ts
├── config/           # Configuration (currently empty)
│   └── index.ts
├── model/            # Core agent logic
│   ├── agent.ts
│   └── index.ts
├── ui/               # React UI components
│   ├── Agents.tsx
│   └── index.ts
└── index.ts          # Main export barrel
```

## Implementation Layers

### 1. Model Layer (`model/agent.ts`)

Core agent logic using AI SDK's `streamText` function:

```typescript
import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { reverseQuestionTool } from "@/entities/reverseQuestion/model/tool";

// Define available tools
const tools = {
  reverseQuestion: reverseQuestionTool,
}

export async function handleAgentChat(messages: UIMessage[]) {
  const agent = streamText({
    model: google('gemini-2.5-flash'),
    system: 'System prompt here',
    messages: convertToModelMessages(messages),
    tools: tools,
  });
  return agent;
}
```

**Key points:**
- Import tool definitions from entities layer
- Define tools object mapping tool names to tool instances
- Use `streamText` with model, system prompt, messages, and tools
- Return the streaming result directly

### 2. API Layer (`api/hono-router.ts`)

Hono router exposing the agent endpoint:

```typescript
import { Hono } from 'hono';
import { UIMessage } from 'ai';
import { handleAgentChat } from '../model/agent';

const app = new Hono().post('/', async (c) => {
  const { messages }: { messages: UIMessage[] } = await c.req.json()
  const result = await handleAgentChat(messages);

  return result.toUIMessageStreamResponse();
});

export const agentsApi = app;
```

**Key points:**
- POST endpoint at root path
- Receives `messages` array from client
- Calls `handleAgentChat` from model layer
- Returns streaming response using `.toUIMessageStreamResponse()`

### 3. Route Registration (`app/api/[...route]/route.ts`)

Mount the agent API on the main Hono app:

```typescript
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { greetingApi } from '@/features/greeting/server'
import { agentsApi } from '@/features/agents/api/hono-router'

const app = new Hono().basePath('/api')

const api = app.route('/hello', greetingApi).route('/chat', agentsApi)

export type ApiSchema = typeof api

export const GET = handle(api)
export const POST = handle(api)
```

**Key points:**
- Import agent API from feature
- Mount on specific path (e.g., `/chat`)
- Export ApiSchema type for type-safe client
- Export GET/POST handlers for Next.js

### 4. UI Layer (`ui/Agents.tsx`)

React client component using AI SDK's `useChat` hook:

```typescript
'use client'

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useState } from "react"

type AgentsProps = {
  apiBaseUrl: string
}

export default function Agents({ apiBaseUrl }: AgentsProps) {
  const [input, setInput] = useState("")
  const { messages, sendMessage, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: apiBaseUrl,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  })

  const handleToolSubmit = (toolCallId: string, output: unknown) => {
    addToolOutput({
      tool: 'toolName',
      toolCallId,
      output,
    });
  };

  // Render messages with tool call handling
  const renderMessage = (message: UIMessage) => {
    return message.parts.map((part, index) => {
      if (part.type === "text") {
        return <div key={index}>{part.text}</div>
      }
      if (part.type === "tool-toolName") {
        // Handle tool call states: input-available, output-available, output-error
        if (part.state === 'input-available') {
          return <ToolComponent onSubmit={handleToolSubmit(part.toolCallId, part.input)} />
        }
        if (part.state === 'output-available') {
          return <div>Tool output: {part.output}</div>
        }
      }
    })
  }

  return (
    <div>
      {messages.map((msg) => renderMessage(msg))}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={() => sendMessage(input)}>Send</button>
    </div>
  )
}
```

**Key points:**
- Must be marked with `'use client'`
- Accept `apiBaseUrl` prop for API endpoint
- Use `useChat` with `DefaultChatTransport`
- Use `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` for automatic tool output submission
- Use `addToolOutput` to submit tool results
- Render message parts handling both text and tool calls
- Tool call part types: `tool-{toolName}` (e.g., `tool-reverseQuestion`)
- Tool call states: `input-available`, `output-available`, `output-error`

### 5. Page Integration (`app/page.tsx`)

Server component that creates API URL and passes to agent UI:

```typescript
'use server'

import { Agents } from '@/features/agents'
import { ApiSchema } from './api/[...route]/route'
import { createHonoClient } from '@/shared/utils/client'

export default async function HomePage() {
  const client = await createHonoClient<ApiSchema>()
  const agentsApiUrl = client.api.chat.$url().toString()

  return (
    <main>
      <Agents apiBaseUrl={agentsApiUrl} />
    </main>
  )
}
```

**Key points:**
- Server component marked with `'use server'`
- Create type-safe Hono client with ApiSchema
- Generate API URL using `$url().toString()`
- Pass API URL to Agents UI component

## Tool Definition Pattern (Entities Layer)

Tools are defined in the entities layer with Zod schemas:

```typescript
// entities/{toolName}/model/tool.ts
import { z } from 'zod';
import { tool } from 'ai';

export const toolInputSchema = z.object({
  param1: z.string().describe('Description'),
  param2: z.enum(['option1', 'option2']).describe('Description'),
  // ... more parameters
});

export type ToolInput = z.infer<typeof toolInputSchema>;

export const toolName = tool({
  description: 'Tool description for the AI model',
  inputSchema: toolInputSchema,
});
```

**Key points:**
- Use Zod for input schema definition
- Use `.describe()` for parameter descriptions (visible to AI)
- Export both schema and inferred type
- Use AI SDK's `tool()` function to create tool
- No `execute` function needed for interactive tools

## Example: ReverseQuestion Tool

The project includes a reference implementation of an interactive tool:

**Tool Definition** (`entities/reverseQuestion/model/tool.ts`):
```typescript
export const reverseQuestionInputSchema = z.object({
  question: z.string().min(1).describe('ユーザーに確認したい質問文'),
  type: z.enum(['text', 'select']).describe('質問種別。text=自由記述, select=選択式'),
  options: z.array(reverseQuestionOptionSchema).optional().describe('typeがselectの場合に提示する選択肢'),
  placeholder: z.string().optional().describe('自由記述のプレースホルダー'),
  required: z.boolean().optional().describe('trueの場合、回答必須として扱う'),
});

export const reverseQuestionTool = tool({
  description: 'ユーザーのリクエストを満たすために不足している情報を質問として提示し、回答を受け取るためのツール',
  inputSchema: reverseQuestionInputSchema,
});
```

**UI Component** (`entities/reverseQuestion/ui/Reversequestion.tsx`):
- Renders form based on question type (text input or select dropdown)
- Handles validation and submission
- Accepts `onSubmit` callback to send answer back

**Integration in Agent UI**:
- Check part type: `part.type === "tool-reverseQuestion"`
- Check state: `part.state === 'input-available'`
- Render ReverseQuestion component with `onSubmit` callback
- Use `addToolOutput` to submit the answer

## Checklist for Creating a New Agent

1. **Create feature structure**:
   - `features/{agentName}/model/agent.ts` - Core agent logic
   - `features/{agentName}/api/hono-router.ts` - API endpoint
   - `features/{agentName}/ui/{AgentName}.tsx` - UI component
   - `features/{agentName}/index.ts` - Export barrel

2. **Define tools** (if needed):
   - Create tool in `entities/{toolName}/model/tool.ts`
   - Create UI component in `entities/{toolName}/ui/`
   - Export from `entities/{toolName}/index.ts`

3. **Implement agent model**:
   - Import tools from entities
   - Define tools object
   - Create `handleAgentChat` function with `streamText`
   - Configure model, system prompt, and tools

4. **Implement API router**:
   - Create Hono app with POST endpoint
   - Parse messages from request
   - Call agent model function
   - Return `.toUIMessageStreamResponse()`

5. **Implement UI component**:
   - Mark with `'use client'`
   - Use `useChat` hook with `DefaultChatTransport`
   - Implement message rendering with tool call handling
   - Handle tool states: input-available, output-available, output-error
   - Use `addToolOutput` for submitting tool results

6. **Register API route**:
   - Import agent API in `app/api/[...route]/route.ts`
   - Mount on appropriate path using `.route()`
   - Refresh ApiSchema type export

7. **Integrate in page**:
   - Import agent UI component
   - Create Hono client with ApiSchema
   - Generate API URL using `$url().toString()`
   - Pass URL to agent UI component

## Best Practices

- **Tool naming**: Use camelCase for tool names, consistent between tool definition and UI rendering
- **Tool descriptions**: Write clear descriptions for the AI model to understand when to use the tool
- **Parameter descriptions**: Use `.describe()` on all Zod schema fields for better AI understanding
- **Error handling**: Handle tool output errors in UI (`part.state === 'output-error'`)
- **Type safety**: Always use ApiSchema for type-safe client creation
- **Export pattern**: Use barrel exports (index.ts) for clean imports
- **UI states**: Handle all tool call states (input-available, output-available, output-error)
- **Automatic submission**: Use `sendAutomaticallyWhen` for seamless tool output handling

## Dependencies

Key packages used:
- `ai` - AI SDK core
- `@ai-sdk/react` - React hooks
- `@ai-sdk/google` - Google AI provider
- `hono` - API routing
- `zod` - Schema validation

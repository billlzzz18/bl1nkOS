กุแปลง README.md ของฝั่ง SDK ให้เป็นแบรนด์ @bl1nk เรียบร้อยแล้วมึง โดยเปลี่ยนชื่อฟังก์ชัน, คลาส, และ Environment Variables ให้สอดคล้องกับระบบของมึงทั้งหมด
ก๊อปไปวางที่ packages/sdk/README.md ได้เลยมึง:
# @bl1nk/sdk

SDK for [bl1nkOS](https://github.com/billlzzz18/bl1nkOS) — AI agents with up-to-date knowledge base access.

Provides [AI SDK](https://ai-sdk.dev) compatible tools to query content in a sandboxed environment.

> See also: [Main README](../../README.md), [Architecture](../../docs/ARCHITECTURE.md), [Environment Variables](../../docs/ENVIRONMENT.md)

## Installation

```bash
npm install @bl1nk/sdk
# or
bun add @bl1nk/sdk
# or
pnpm add @bl1nk/sdk

Configuration
Set the following environment variables:
| Variable | Required | Description |
|---|---|---|
| BL1NK_API_URL | Yes | Base URL of your API |
| BL1NK_API_KEY | No | API key for authentication (Better Auth API key). |
Quick Start
import { createBl1nk } from '@bl1nk/sdk'
import { generateText } from 'ai'

const bl1nk = createBl1nk({
  apiUrl: process.env.BL1NK_API_URL!,
  apiKey: process.env.BL1NK_API_KEY, // Optional if API doesn't require auth
})

const { text } = await generateText({
  model: 'google/gemini-3-flash',
  tools: bl1nk.tools,
  maxSteps: 10,
  prompt: 'How do I configure authentication?',
})

console.log(text)

API Reference
createBl1nk(config)
Creates an instance with API client and AI SDK tools.
import { createBl1nk } from '@bl1nk/sdk'

const bl1nk = createBl1nk({
  apiUrl: process.env.BL1NK_API_URL!,
  apiKey: process.env.BL1NK_API_KEY,
  sessionId: 'optional-session-id', // For sandbox reuse
  onToolCall: (info) => {
    // Optional callback for tool execution states
    console.log(`Tool ${info.toolName}: ${info.state}`)
  },
})

Config Options
| Option | Type | Required | Description |
|---|---|---|---|
| apiUrl | string | Yes | Base URL of your API |
| apiKey | string | No | API key for authentication |
| sessionId | string | No | Reuse an existing sandbox session |
| source | string | No | Usage source identifier (e.g. 'github-bot'). Defaults to 'sdk'. |
| sourceId | string | No | Tracking ID (e.g. 'issue-123'). Can be overridden per reportUsage() call. |
| onToolCall | function | No | Callback fired on tool execution (loading/done/error) |
Returns
interface Bl1nk {
  client: Bl1nkClient           // Low-level HTTP client
  tools: {
    bash: Tool                   // Execute single bash command
    bash_batch: Tool             // Execute multiple commands (more efficient)
  }
  getSessionId(): string | undefined
  setSessionId(sessionId: string): void
  getAgentConfig(): Promise<AgentConfig>
  reportUsage(result: GenerateResult, options?: ReportUsageOptions): Promise<void>
}

Tools
bash
Execute a single bash command in the documentation sandbox.
const { text } = await generateText({
  model,
  tools: { bash: bl1nk.tools.bash },
  prompt: 'List all markdown files in the docs folder',
})

bash_batch
Execute multiple bash commands in a single request. More efficient than multiple single calls as the sandbox is reused between commands.
const { text } = await generateText({
  model,
  tools: { bash_batch: bl1nk.tools.bash_batch },
  prompt: 'Find all TypeScript files and show their first 10 lines',
})

Bl1nkClient
Low-level HTTP client for direct API access. Use createBl1nk() for the high-level interface.
import { Bl1nkClient } from '@bl1nk/sdk'

const client = new Bl1nkClient({
  apiUrl: process.env.BL1NK_API_URL!,
  apiKey: process.env.BL1NK_API_KEY,
})

// Execute bash command
const result = await client.bash('ls -la')
console.log(result.stdout)

// Execute multiple commands
const batchResult = await client.bashBatch(['pwd', 'ls', 'cat README.md'])

// Get sources configuration
const sources = await client.getSources()

// Trigger sync
await client.sync({ reset: false, push: true })

// Get agent configuration
const config = await client.getAgentConfig()

// Report usage from an AI SDK generate result
await client.reportUsage(result, { startTime: Date.now() })

Error Handling
The SDK exports two error classes:
Bl1nkError
Thrown when the API returns an error response.
import { Bl1nkError } from '@bl1nk/sdk'

try {
  await client.bash('some-command')
} catch (error) {
  if (error instanceof Bl1nkError) {
    console.log(error.statusCode) // HTTP status code
    console.log(error.message)    // Error message

    if (error.isAuthError()) {
      // Handle 401
    } else if (error.isRateLimitError()) {
      // Handle 429
    } else if (error.isServerError()) {
      // Handle 5xx
    }
  }
}

NetworkError
Thrown when the request fails to reach the API (network issues, DNS errors, etc.).
import { NetworkError } from '@bl1nk/sdk'

try {
  await client.bash('some-command')
} catch (error) {
  if (error instanceof NetworkError) {
    console.log(error.message)
    console.log(error.cause) // Original error
  }
}

Types
All types are exported for TypeScript users:
import type {
  Bl1nkConfig,
  ShellResponse,
  ShellBatchResponse,
  SyncOptions,
  SyncResponse,
  SourcesResponse,
  AgentConfig,
  GenerateResult,
  ReportUsageOptions,
  ToolCallInfo,
  ToolCallCallback,
  ToolCallState,
} from '@bl1nk/sdk'

License
MIT
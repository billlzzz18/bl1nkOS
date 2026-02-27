# @bl1nk/agent

Framework-agnostic agent core for BL1NK Knowledge Agent. Handles question routing, prompt management, agent creation, and AI tool definitions.

โครงสร้างหลักของ Agent สำหรับ BL1NK Knowledge Agent จัดการเรื่องการเลือกเส้นทางคำถาม (Routing), การจัดการ Prompt, การสร้าง Agent และการกำหนดค่าเครื่องมือ AI (Tools)

> See also: [Main README](../../README.md), [Architecture](../../docs/ARCHITECTURE.md), [Customization](../../docs/CUSTOMIZATION.md)

---

## Overview / ภาพรวม

This package provides the AI agent infrastructure used by the chat interface and bots. It is designed to be consumed by `apps/app` but can also be used independently.

แพ็กเกจนี้เป็นโครงสร้างพื้นฐานของ AI Agent ที่ใช้งานในหน้าแชทและบอท ถูกออกแบบมาเพื่อใช้งานร่วมกับ `apps/app` แต่ก็สามารถนำไปใช้งานแยกต่างหากได้

---

## Components / ส่วนประกอบหลัก

### Router
The router classifies incoming questions by complexity and selects the appropriate model and step count.
ตัวเลือกเส้นทางจะคัดแยกประเภทคำถามตามความซับซ้อน เพื่อเลือกโมเดลและจำนวนขั้นตอน (Step) ที่เหมาะสม

| Complexity | Max Steps | Model |
|-----------|-----------|-------|
| trivial | 4 | gemini-3-flash |
| simple | 8 | gemini-3-flash |
| moderate | 15 | claude-sonnet-4.6 |
| complex | 25 | claude-opus-4.6 |

```typescript
import { routeQuestion } from '@bl1nk/agent'

const config = await routeQuestion(question)
// { complexity: 'moderate', maxSteps: 15, model: 'claude-sonnet-4.6', reasoning: '...' }
```

### Prompts
System prompts for different contexts:
System Prompts สำหรับบริบทต่าง ๆ:

| File | Function | Purpose |
|------|----------|---------|
| `router.ts` | `ROUTER_SYSTEM_PROMPT` | คัดแยกประเภทคำถาม |
| `chat.ts` | `buildChatSystemPrompt()` | สำหรับหน้าแชทหลัก |
| `chat.ts` | `buildAdminSystemPrompt()` | สำหรับระบบ Admin |
| `bot.ts` | `buildBotSystemPrompt()` | สำหรับการตอบกลับของบอท |
| `shared.ts` | `applyAgentConfig()` | การตั้งค่าเสริม (สไตล์, ภาษา, การอ้างอิง) |

### Agents
Pre-configured agent factories:
ฟังก์ชันสำหรับสร้าง Agent ตามการใช้งาน:

- **`createAgent()`** — Agent พื้นฐานสำหรับแชทและบอท
- **`createAdminAgent()`** — Agent สำหรับผู้ดูแลระบบ (พร้อมเครื่องมือจัดการสถิติ)
- **`createSourceAgent()`** — Agent สำหรับเจาะจงแหล่งข้อมูล

### Tools
- **`webSearchTool`** — เครื่องมือค้นหาเว็บสำหรับข้อมูลที่ไม่มีใน Sandbox

### Types
Key types exported:

```typescript
import type {
  AgentConfigData,
  ThreadContext,
  RoutingResult,
  AgentExecutionContext,
  CreateAgentOptions,
  AgentCallOptions,
  AgentConfig,
} from '@bl1nk/agent'
```

---

## Customization / การปรับแต่ง

To customize AI behavior:
การปรับแต่งพฤติกรรมของ AI:

1. **Admin UI** — ปรับเปลี่ยนสไตล์การตอบ, ภาษา หรือค่า Temperature ได้ที่หน้า `/admin/agent`
2. **Prompts** — แก้ไขไฟล์ใน `src/prompts/` เพื่อการปรับแต่งที่ลึกขึ้น
3. **Router** — แก้ไข `src/prompts/router.ts` เพื่อปรับเกณฑ์การแยกความซับซ้อนของคำถาม
4. **Tools** — เพิ่มเครื่องมือใหม่ ๆ ได้ใน `src/tools/`

---

## License
MIT

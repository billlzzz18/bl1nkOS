# 🛠️ เพิ่ม Bot Adapter (Add Bot Adapter) - BL1NK Edition

คู่มือสำหรับการเพิ่ม Platform Adapter ใหม่ (Slack, Linear, ฯลฯ) เข้ากับระบบ Bot ของ BL1NK Knowledge Agent

## สถาปัตยกรรม (Architecture)

ระบบ Bot ใช้ [Vercel Chat SDK](https://github.com/vercel-labs/chat) สำหรับการทำ Platform Abstraction โดยแต่ละ Adapter จะต้อง Implement ตาม Chat SDK Interface

## แหล่งอ้างอิง: Adapter ที่มีอยู่แล้ว

- **Discord**: ใช้ `@chat-adapter/discord` (Official Adapter)
- **GitHub**: ใช้ `Bl1nkGitHubAdapter` (Custom อยู่ใน `apps/app/src/lib/bot/`)

Adapter ของ GitHub เป็นตัวอย่างที่ดีในการใช้เป็นต้นแบบสำหรับสร้าง Custom Adapter ใหม่

---

## ขั้นตอนการดำเนินงาน

### 1. สร้าง Adapter

สร้างไฟล์ที่ `apps/app/src/lib/bot/adapters/my-platform.ts`:

```typescript
import type { Adapter } from 'chat'

export class MyPlatformAdapter implements Adapter {
  name = 'my-platform'

  // Implement Method ที่จำเป็น:
  // - sendMessage(threadId, message)
  // - editMessage(threadId, messageId, message)
  // - deleteMessage(threadId, messageId)
  // ฯลฯ
}
```

สามารถดูรายละเอียด `Adapter` Interface ทั้งหมดได้จากคู่มือของ Chat SDK

### 2. ลงทะเบียน Adapter

ในไฟล์ `apps/app/src/lib/bot/index.ts` ให้เพิ่ม Adapter ของมึงเข้าไปใน Chat Instance:

```typescript
import { MyPlatformAdapter } from './adapters/my-platform'

// เพิ่มเข้าไปใน Chat Instance
chat.addAdapter(new MyPlatformAdapter())
```

### 3. สร้าง Webhook Endpoint (สำหรับ Next.js)

สร้างไฟล์ที่ `apps/app/src/app/api/webhooks/my-platform/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  // 1. ตรวจสอบ Webhook Signature (ขึ้นอยู่กับแต่ละ Platform)
  // 2. Parse เหตุการณ์ (Event) ที่ส่งมา
  // 3. ส่งต่อให้ Chat SDK ประมวลผล

  return NextResponse.json({ ok: true })
}
```

### 4. เพิ่ม Environment Variables

เพิ่มตัวแปรเฉพาะของแต่ละ Platform ใน:
- `apps/app/.env.example`
- `docs/ENVIRONMENT.md`
- `apps/app/src/config/index.ts` (หรือส่วนจัดการ Config ของโปรเจกต์)

### 5. เพิ่มเอกสารการใช้งาน

สร้างไฟล์ `apps/app/src/content/docs/my-platform-bot.md` โดยอ้างอิงรูปแบบจาก `discord-bot.md` หรือ `bot-setup.md`

---

## รูปแบบ Thread ID (Thread ID Format)

ใช้รูปแบบมาตรฐาน: `{platform}:{identifier}:{type}:{id}`

**ตัวอย่าง:**
- GitHub: `github:owner/repo:issue:123`
- Discord: `discord:guild:channel:thread`
- แพลตฟอร์มของมึง: `my-platform:{workspace}:{channel}:{thread}`
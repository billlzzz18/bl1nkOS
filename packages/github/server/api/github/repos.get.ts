import { createHash } from 'node:crypto'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

import { listUserRepos, listAppRepos, type RepoInfo } from '../../utils'
import { resolveGitHubAuth, type GitHubAuth } from '../../utils/auth'
// สมมติว่า useLogger และ requireAdmin ถูกปรับให้รับ NextRequest แล้วใน utils ของมึง
import { useLogger } from '../../utils/logger'
import { requireAdmin } from '../../utils/admin'

function buildFingerprint(auth: GitHubAuth): string {
  const hasher = createHash('sha256')
  hasher.update(auth.type === 'pat' ? `pat|${auth.token}` : `app|${auth.appId}`)
  return hasher.digest('hex')
}

// แปลงระบบ Cache จาก Nuxt มาใช้ unstable_cache ของ Next.js
const getCachedRepos = (auth: GitHubAuth) => {
  const fingerprint = buildFingerprint(auth)
  return unstable_cache(
    async () => {
      return auth.type === 'pat'
        ? await listUserRepos(auth.token)
        : await listAppRepos(auth)
    },
    [`github-repos-${fingerprint}`],
    { revalidate: 60 } // เทียบเท่า maxAge: 60 และ swr: true
  )()
}

const querySchema = z.object({
  owner: z.string().optional(),
  force: z.coerce.boolean().optional(),
})

export async function GET(request: NextRequest) {
  const requestLog = useLogger(request)
  await requireAdmin(request)

  // ดึง Search Params แทนการใช้ getValidatedQuery ของ Nuxt
  const searchParams = request.nextUrl.searchParams
  const query = querySchema.parse({
    owner: searchParams.get('owner') || undefined,
    force: searchParams.get('force') === 'true',
  })

  // สร้าง Config จาก Environment Variables แทน useRuntimeConfig()
  const config = {
    github: {
      token: process.env.BL1NK_GITHUB_TOKEN || process.env.NUXT_GITHUB_TOKEN,
      appId: process.env.BL1NK_GITHUB_APP_ID || process.env.NUXT_GITHUB_APP_ID,
      privateKey: process.env.BL1NK_GITHUB_APP_PRIVATE_KEY || process.env.NUXT_GITHUB_APP_PRIVATE_KEY,
    }
  }

  const auth = resolveGitHubAuth(config.github)
  
  if (!auth) {
    return NextResponse.json(
      {
        message: 'GitHub credentials not configured',
        data: {
          why: 'Missing BL1NK_GITHUB_TOKEN or BL1NK_GITHUB_APP_ID/BL1NK_GITHUB_APP_PRIVATE_KEY',
          fix: 'Set one of these in your environment variables',
        },
      },
      { status: 400 }
    )
  }

  const repos = query.force
    ? await (auth.type === 'pat' ? listUserRepos(auth.token) : listAppRepos(auth))
    : await getCachedRepos(auth)

  const filtered = query.owner
    ? repos.filter(repo => repo.owner.toLowerCase() === query.owner?.toLowerCase())
    : repos

  requestLog.set({
    ownerFilter: query.owner || null,
    force: query.force === true,
    cacheMode: query.force ? 'bypass' : 'swr',
    totalRepos: repos.length,
    returnedRepos: filtered.length,
  })

  return NextResponse.json({
    count: filtered.length,
    repositories: filtered,
  })
}

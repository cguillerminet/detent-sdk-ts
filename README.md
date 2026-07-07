# @detent/sdk

[![CI](https://github.com/cguillerminet/detent-sdk-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/cguillerminet/detent-sdk-ts/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@detent/sdk.svg)](https://www.npmjs.com/package/@detent/sdk)

Typed TypeScript client for the [Detent](https://detent.dev) rate-limiting API.

> Status: pre-1.0 — the API may change between minor versions until 1.0.0.

## Install

```bash
npm i @detent/sdk
```

## Usage

```ts
import { Detent } from '@detent/sdk'

const rg = new Detent({ apiKey: process.env.DETENT_API_KEY! })

// Rate-limit check (always resolves; fails open by default on transport error)
const { allowed } = await rg.limit({ namespace: 'api', key: userId })
if (!allowed) return res.status(429).end()

// Concurrent-limit lease
await rg.withLease({ namespace: 'jobs', key: userId }, async () => {
  await runExpensiveJob()
})

// Read-only usage stats
const stats = await rg.getStats({ namespace: 'api' })
```

### Express

Enforce limits with middleware — one shared client, applied per route:

```ts
import express from 'express'
import {
  Detent,
  DetentLeaseDeniedError,
  DetentQuotaExceededError,
  DetentPaymentRequiredError,
} from '@detent/sdk'

const rg = new Detent({ apiKey: process.env.DETENT_API_KEY! })
const app = express()

// Throttle identity: an API key, a user id, or the client IP. Trust the client
// IP only behind a proxy you control (`app.set('trust proxy', …)`).
const keyFor = (req: express.Request) => req.header('x-api-key') ?? req.ip ?? 'anon'

const rateLimit =
  (namespace: string): express.RequestHandler =>
  async (req, res, next) => {
    try {
      const r = await rg.limit({ namespace, key: keyFor(req) })
      res.set('X-RateLimit-Remaining', String(r.remaining))
      if (!r.allowed) {
        // a verdict, not a throw — you send the 429
        res.set('Retry-After', String(Math.max(1, Math.ceil(r.resetMs / 1000))))
        return res.status(429).json({ error: 'rate_limited' })
      }
      next()
    } catch (err) {
      next(err) // policy errors (quota / payment) + 4xx → error handler below
    }
  }

app.get('/search', rateLimit('api'), (req, res) => {
  res.json({ q: req.query.q })
})
```

For a **concurrency cap**, run the handler inside `withLease` so the slot is
released even if it throws; a full namespace throws `DetentLeaseDeniedError`:

```ts
const withSlot =
  (namespace: string, handler: express.RequestHandler): express.RequestHandler =>
  async (req, res, next) => {
    try {
      await rg.withLease({ namespace, key: keyFor(req) }, () => handler(req, res, next))
    } catch (err) {
      if (err instanceof DetentLeaseDeniedError) {
        return res.status(429).json({ error: 'too_many_concurrent' })
      }
      next(err)
    }
  }

app.post(
  '/report',
  withSlot('jobs', async (req, res) => {
    res.json(await generateReport())
  }),
)
```

Map the account-level policy errors in an error handler (Express 5 forwards
async rejections automatically; on Express 4 the `try/catch … next(err)` above does):

```ts
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof DetentQuotaExceededError) return res.status(429).json({ error: 'monthly_hard_cap' })
  if (err instanceof DetentPaymentRequiredError) return res.status(402).json({ error: 'payment_required' })
  next(err)
})
```

### Configuration

| Option      | Default                    | Notes                                            |
|-------------|----------------------------|--------------------------------------------------|
| `apiKey`    | — (required)               | `dt_live_…` / `dt_test_…`                         |
| `baseUrl`   | `https://api.detent.dev`   | Override for self-host / tests                    |
| `timeoutMs` | `1000`                     | Client-side transport timeout                     |
| `failMode`  | `'open'`                   | `'open'` allows, `'closed'` denies on transport error |
| `onError`   | —                          | Called on transport errors and 5xx responses before fail-open/closed |

`limit()` never throws on a transport error or a 5xx server error — it returns `{ degraded: true }` and respects `failMode`.
Only 4xx client errors (bad key, plan gate, unknown rule, malformed request) throw `DetentApiError`.

**`acquire()` / `withLease()` do *not* fail open** — unlike `limit()`, they throw `DetentTransportError`
when Detent is unreachable, regardless of `failMode`. A failed-open acquire would return no `leaseId`, so
the work would run holding a slot it can never release (a lease leak). Propagating the error lets you decide
whether to proceed or shed load. Note this is distinct from the server's own Redis fail-open, where the API
still returns `200` with `allowed: true` and a `null` leaseId.

When an account exceeds its monthly hard ceiling the API returns `429`, and `limit()`/`acquire()`
throw **`DetentQuotaExceededError`** (a `DetentApiError` subclass, so it carries `status`/`body`). It is
**never** failed open — the cap is a deliberate block, not a transport degradation. Catch it to alert
or prompt an upgrade:

```ts
import { DetentQuotaExceededError } from '@detent/sdk'

try {
  const { allowed } = await detent.limit({ namespace: 'api', key: userId })
  if (!allowed) return res.status(429).end() // routine per-key rate deny
} catch (err) {
  if (err instanceof DetentQuotaExceededError) {
    // account is over its monthly ceiling — page ops / show an upgrade nudge
  }
  throw err
}
```

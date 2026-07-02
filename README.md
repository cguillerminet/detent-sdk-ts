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

### Configuration

| Option      | Default                    | Notes                                            |
|-------------|----------------------------|--------------------------------------------------|
| `apiKey`    | — (required)               | `rg_live_…` / `rg_test_…`                         |
| `baseUrl`   | `https://api.detent.dev`   | Override for self-host / tests                    |
| `timeoutMs` | `1000`                     | Client-side transport timeout                     |
| `failMode`  | `'open'`                   | `'open'` allows, `'closed'` denies on transport error |
| `onError`   | —                          | Called on transport errors and 5xx responses before fail-open/closed |

`limit()` never throws on a transport error or a 5xx server error — it returns `{ degraded: true }` and respects `failMode`.
Only 4xx client errors (bad key, plan gate, unknown rule, malformed request) throw `DetentApiError`.

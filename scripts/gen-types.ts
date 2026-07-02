import { readFile, writeFile, mkdir } from 'node:fs/promises'
import openapiTS, { astToString } from 'openapi-typescript'

const SPEC = new URL('../openapi/detent.json', import.meta.url)
const OUT = new URL('../src/generated/openapi.ts', import.meta.url)

async function main() {
  const spec = JSON.parse(await readFile(SPEC, 'utf8'))
  const ast = await openapiTS(spec)
  await mkdir(new URL('../src/generated/', import.meta.url), { recursive: true })
  await writeFile(OUT, `/* AUTO-GENERATED from openapi/detent.json — do not edit. */\n${astToString(ast)}`)
  console.log('wrote', OUT.pathname)
}

main().catch((e) => { console.error(e); process.exit(1) })

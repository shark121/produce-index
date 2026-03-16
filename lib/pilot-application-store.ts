import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PilotApplicationInput, PilotApplicationRecord } from '@/lib/types'

const storageDir = join(process.cwd(), '.local')
const storagePath = join(storageDir, 'pilot-applications.json')

async function readStoredApplications(): Promise<PilotApplicationRecord[]> {
  try {
    const raw = await readFile(storagePath, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data as PilotApplicationRecord[] : []
  } catch {
    return []
  }
}

export async function saveMockPilotApplication(
  input: PilotApplicationInput,
): Promise<PilotApplicationRecord> {
  const record: PilotApplicationRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    storageMode: 'mock-file',
  }

  const existing = await readStoredApplications()

  await mkdir(storageDir, { recursive: true })
  await writeFile(
    storagePath,
    JSON.stringify([record, ...existing], null, 2),
    'utf8',
  )

  return record
}

import { promises as fs } from 'fs'
import path from 'path'

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), '.logs')
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const LOG_FILE = process.env.LOG_FILE || 'app.log'

const levelPriority = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function shouldLog(level) {
  return levelPriority[level] >= levelPriority[LOG_LEVEL]
}

async function ensureLogDir() {
  await fs.mkdir(LOG_DIR, { recursive: true })
}

async function writeLog(entry) {
  await ensureLogDir()
  const line = JSON.stringify(entry) + '\n'
  await fs.appendFile(path.join(LOG_DIR, LOG_FILE), line, 'utf8')
}

export async function log(level, message, meta) {
  if (!shouldLog(level)) return
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
  }

  try {
    await writeLog(entry)
  } catch {
    // ignore logging errors
  }
}

export async function logInfo(message, meta) {
  await log('info', message, meta)
}

export async function logWarn(message, meta) {
  await log('warn', message, meta)
}

export async function logError(message, meta) {
  await log('error', message, meta)
}

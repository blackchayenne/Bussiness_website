import { promises as fs } from 'fs'
import path from 'path'
import { parseDriveUrl } from '../drive/parser'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'drives.json')

const DEFAULT_CONFIG = {
  drives: [],
  settings: {
    autoSync: true,
    syncIntervalMinutes: 5,
  },
}

export async function readDrivesConfig() {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8')
    const config = JSON.parse(content)

    config.drives = config.drives.map((drive) => {
      if (drive.url && !drive.folderId) {
        const parsed = parseDriveUrl(drive.url)
        if (parsed.id) {
          drive.folderId = parsed.id
        }
      }
      return drive
    })

    return config
  } catch (error) {
    console.error('Error reading drives config:', error)
    return DEFAULT_CONFIG
  }
}

export async function writeDrivesConfig(config) {
  try {
    const configDir = path.dirname(CONFIG_PATH)
    await fs.mkdir(configDir, { recursive: true })
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing drives config:', error)
    throw error
  }
}

export async function addDrive(drive) {
  const config = await readDrivesConfig()
  const parsed = parseDriveUrl(drive.url)
  if (!parsed.id) {
    throw new Error('Invalid Google Drive URL')
  }

  const newDrive = {
    ...drive,
    folderId: parsed.id,
  }

  if (config.drives.some((d) => d.folderId === newDrive.folderId)) {
    throw new Error('This drive folder is already added')
  }

  config.drives.push(newDrive)
  await writeDrivesConfig(config)
  return newDrive
}

export async function removeDrive(driveId) {
  const config = await readDrivesConfig()
  config.drives = config.drives.filter((d) => d.id !== driveId)
  await writeDrivesConfig(config)
}

export async function updateDrive(driveId, updates) {
  const config = await readDrivesConfig()
  const index = config.drives.findIndex((d) => d.id === driveId)
  if (index === -1) {
    return null
  }

  if (updates.url) {
    const parsed = parseDriveUrl(updates.url)
    if (parsed.id) {
      updates.folderId = parsed.id
    }
  }

  config.drives[index] = { ...config.drives[index], ...updates }
  await writeDrivesConfig(config)
  return config.drives[index]
}

export async function getEnabledDrives() {
  const config = await readDrivesConfig()
  return config.drives.filter((d) => d.enabled && d.folderId)
}

export async function updateSettings(settings) {
  const config = await readDrivesConfig()
  config.settings = { ...config.settings, ...settings }
  await writeDrivesConfig(config)
}

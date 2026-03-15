import fs from 'fs'
import path from 'path'

const SNAPSHOT_DIR = path.join(process.cwd(), 'snapshots')
const MAX_SNAPSHOTS = 5

interface ScanSnapshot {
  id: string
  url: string
  timestamp: string
  apiRoute: string
  scores: { seo: number; aeo: number; geo: number }
  siteType?: string
  rawAiScores?: any
  graderBreakdown?: any
  structuralData?: any
  schemas?: any[]
  enhancedPenalties?: any[]
  fullResult?: any
}

export function saveScanSnapshot(snapshot: ScanSnapshot) {
  try {
    // Ensure directory exists
    if (!fs.existsSync(SNAPSHOT_DIR)) {
      fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
    }

    // Read existing index
    const indexPath = path.join(SNAPSHOT_DIR, 'index.json')
    let index: string[] = []
    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    }

    // Save snapshot file
    const filename = `${snapshot.id}.json`
    const filepath = path.join(SNAPSHOT_DIR, filename)
    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2))

    // Update index (keep last MAX_SNAPSHOTS)
    index.push(snapshot.id)
    if (index.length > MAX_SNAPSHOTS) {
      const removed = index.shift()
      if (removed) {
        const removedPath = path.join(SNAPSHOT_DIR, `${removed}.json`)
        if (fs.existsSync(removedPath)) {
          fs.unlinkSync(removedPath)
        }
      }
    }
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))

    console.log(`[Snapshot] Saved: ${snapshot.url} → ${filename}`)
  } catch (error) {
    console.error('[Snapshot] Failed to save:', error)
  }
}

export function getRecentSnapshots(): ScanSnapshot[] {
  try {
    const indexPath = path.join(SNAPSHOT_DIR, 'index.json')
    if (!fs.existsSync(indexPath)) return []

    const index: string[] = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    return index.map(id => {
      const filepath = path.join(SNAPSHOT_DIR, `${id}.json`)
      if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
      }
      return null
    }).filter(Boolean)
  } catch (error) {
    console.error('[Snapshot] Failed to read:', error)
    return []
  }
}

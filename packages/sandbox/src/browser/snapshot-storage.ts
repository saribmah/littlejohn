import { Log } from "../utils"
import type { Extractor } from "./extractor"

export namespace SnapshotStorage {
  const log = Log.create({ service: "browser.snapshot-storage" })

  /**
   * Element in a snapshot
   */
  export interface SnapshotElement {
    snapId: string
    tag: string
    text: string
    locators: Extractor.LocatorBundle
  }

  /**
   * Snapshot of a page
   */
  export interface Snapshot {
    snapshotId: string
    url: string
    frameId: string
    createdAt: number
    html: string // downsampled HTML
    elements: SnapshotElement[]
    meta: {
      tokenCount: number
      elementCount: number
      reductionPercent: number
    }
  }

  // Storage: sessionId -> snapshotId -> Snapshot
  const storage = new Map<string, Map<string, Snapshot>>()

  // Max snapshots per session
  const MAX_SNAPSHOTS = 3

  /**
   * Store a snapshot for a session
   */
  export function store(sessionId: string, snapshot: Snapshot): string {
    log.info("storing snapshot", {
      sessionId,
      snapshotId: snapshot.snapshotId,
      elementCount: snapshot.elements.length,
    })

    // Get or create session storage
    let sessionStorage = storage.get(sessionId)
    if (!sessionStorage) {
      sessionStorage = new Map()
      storage.set(sessionId, sessionStorage)
    }

    // Add snapshot
    sessionStorage.set(snapshot.snapshotId, snapshot)

    // Expire old snapshots if needed
    if (sessionStorage.size > MAX_SNAPSHOTS) {
      const snapshots = Array.from(sessionStorage.values())
        .sort((a, b) => b.createdAt - a.createdAt) // newest first

      // Keep only the newest MAX_SNAPSHOTS
      const toKeep = new Set(snapshots.slice(0, MAX_SNAPSHOTS).map(s => s.snapshotId))

      for (const [id, snap] of sessionStorage.entries()) {
        if (!toKeep.has(id)) {
          sessionStorage.delete(id)
          log.info("expired old snapshot", { sessionId, snapshotId: id })
        }
      }
    }

    return snapshot.snapshotId
  }

  /**
   * Get a snapshot by ID
   */
  export function get(sessionId: string, snapshotId: string): Snapshot | null {
    const sessionStorage = storage.get(sessionId)
    if (!sessionStorage) {
      log.warn("session not found", { sessionId })
      return null
    }

    const snapshot = sessionStorage.get(snapshotId)
    if (!snapshot) {
      log.warn("snapshot not found", { sessionId, snapshotId })
      return null
    }

    log.info("retrieved snapshot", {
      sessionId,
      snapshotId,
      elementCount: snapshot.elements.length,
    })

    return snapshot
  }

  /**
   * Get element from snapshot by snapId
   */
  export function getElement(
    sessionId: string,
    snapshotId: string,
    snapId: string
  ): SnapshotElement | null {
    const snapshot = get(sessionId, snapshotId)
    if (!snapshot) return null

    const element = snapshot.elements.find(e => e.snapId === snapId)
    if (!element) {
      log.warn("element not found in snapshot", { sessionId, snapshotId, snapId })
      return null
    }

    return element
  }

  /**
   * Clear all snapshots for a session
   */
  export function clear(sessionId: string): void {
    const sessionStorage = storage.get(sessionId)
    if (sessionStorage) {
      log.info("clearing snapshots", { sessionId, count: sessionStorage.size })
      storage.delete(sessionId)
    }
  }

  /**
   * Get all snapshot IDs for a session (for debugging)
   */
  export function list(sessionId: string): string[] {
    const sessionStorage = storage.get(sessionId)
    if (!sessionStorage) return []
    return Array.from(sessionStorage.keys())
  }

  /**
   * Get storage stats (for debugging)
   */
  export function stats() {
    const sessions = storage.size
    let totalSnapshots = 0
    for (const sessionStorage of storage.values()) {
      totalSnapshots += sessionStorage.size
    }
    return { sessions, totalSnapshots }
  }
}

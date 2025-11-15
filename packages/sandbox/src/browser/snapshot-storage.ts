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

  // Single storage instance - snapshots by ID
  const storage = new Map<string, Snapshot>()

  // Max snapshots
  const MAX_SNAPSHOTS = 3

  /**
   * Store a snapshot
   */
  export function store(snapshot: Snapshot): string {
    log.info("storing snapshot", {
      snapshotId: snapshot.snapshotId,
      elementCount: snapshot.elements.length,
    })

    // Add snapshot
    storage.set(snapshot.snapshotId, snapshot)

    // Expire old snapshots if needed
    if (storage.size > MAX_SNAPSHOTS) {
      const snapshots = Array.from(storage.values())
        .sort((a, b) => b.createdAt - a.createdAt) // newest first

      // Keep only the newest MAX_SNAPSHOTS
      const toKeep = new Set(snapshots.slice(0, MAX_SNAPSHOTS).map(s => s.snapshotId))

      for (const [id,] of storage.entries()) {
        if (!toKeep.has(id)) {
          storage.delete(id)
          log.info("expired old snapshot", { snapshotId: id })
        }
      }
    }

    return snapshot.snapshotId
  }

  /**
   * Get a snapshot by ID
   */
  export function get(snapshotId: string): Snapshot | null {
    const snapshot = storage.get(snapshotId)
    if (!snapshot) {
      log.warn("snapshot not found", { snapshotId })
      return null
    }

    log.info("retrieved snapshot", {
      snapshotId,
      elementCount: snapshot.elements.length,
    })

    return snapshot
  }

  /**
   * Get an element from a snapshot by its snapId
   */
  export function getElement(snapshotId: string, snapId: string): SnapshotElement | null {
    const snapshot = get(snapshotId)
    if (!snapshot) return null

    const element = snapshot.elements.find(el => el.snapId === snapId)
    if (!element) {
      log.warn("element not found in snapshot", { snapshotId, snapId })
      return null
    }

    return element
  }

  /**
   * Clear all snapshots
   */
  export function clear(): void {
    log.info("clearing snapshots", { count: storage.size })
    storage.clear()
  }

  /**
   * Get all snapshot IDs (for debugging)
   */
  export function list(): string[] {
    return Array.from(storage.keys())
  }

  /**
   * Get storage stats (for debugging)
   */
  export function stats() {
    return { snapshots: storage.size }
  }
}

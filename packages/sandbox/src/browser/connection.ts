import CDP from "chrome-remote-interface"
import { Instance } from "../project"
import { BrowserStealth } from "./stealth"
import {Log} from "../utils";

export namespace BrowserConnection {
  const log = Log.create({ service: "browser.connection" })

  export interface Client {
    cdp: CDP.Client
    host: string
    port: number
    target?: string
  }

  export const state = Instance.state(
    () => {
      const connections = new Map<string, Client>()
      return { connections }
    },
    async (state) => {
      // Cleanup: close all connections
      for (const [sessionID, client] of state.connections) {
        try {
          await client.cdp.close()
          log.info("connection closed", { sessionID })
        } catch (error) {
          log.error("failed to close connection", { sessionID, error })
        }
      }
      state.connections.clear()
    }
  )

  export async function connect(input: {
    sessionID: string
    host?: string
    port?: number
    target?: string
  }): Promise<Client> {
    const host = input.host || "localhost"
    const port = input.port || 9222

    log.info("connecting to browser", { host, port, target: input.target })

    // Retry logic for browser startup
    const maxRetries = 10
    const retryDelay = 500 // ms
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get list of targets
        const targets = await CDP.List({ host, port })
        log.info("available targets", { count: targets.length, attempt })

        // Find the target to connect to
        let targetId: string | undefined = input.target

        if (!targetId) {
          // Connect to the first available page
          const pageTarget = targets.find((t) => t.type === "page")
          if (!pageTarget) {
            throw new Error("No browser page found")
          }
          targetId = pageTarget.id
        }

        // Connect to the target
        const cdp = await CDP({ host, port, target: targetId })

        // Enable required domains
        await cdp.Page.enable()
        await cdp.Runtime.enable()
        await cdp.Network.enable()

        // Inject stealth scripts to mask automation signals
        try {
          await BrowserStealth.maskAutomation(cdp)
          log.info("stealth scripts injected", { sessionID: input.sessionID })
        } catch (error) {
          log.warn("failed to inject stealth scripts, continuing anyway", { error })
          // Don't fail connection if stealth injection fails
        }

        const client: Client = {
          cdp,
          host,
          port,
          target: targetId,
        }

        // Store connection
        state().connections.set(input.sessionID, client)
        log.info("connected successfully", { sessionID: input.sessionID, target: targetId, attempt })

        return client
      } catch (error) {
        lastError = error as Error
        if (attempt < maxRetries) {
          log.info("connection attempt failed, retrying", { attempt, maxRetries, delay: retryDelay })
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    log.error("connection failed after all retries", { error: lastError, host, port })
    throw new Error(
      `Failed to connect to browser at ${host}:${port} after ${maxRetries} attempts. ` +
        `Make sure Chrome is running with: chrome --remote-debugging-port=${port}. ` +
        `Last error: ${lastError?.message}`
    )
  }

  export async function get(sessionID: string): Promise<Client | undefined> {
    return state().connections.get(sessionID)
  }

  export async function getOrConnect(input: {
    sessionID: string
    host?: string
    port?: number
    target?: string
  }): Promise<Client> {
    const existing = await get(input.sessionID)
    if (existing) return existing
    return connect(input)
  }

  export async function disconnect(sessionID: string): Promise<void> {
    const client = await get(sessionID)
    if (!client) return

    try {
      await client.cdp.close()
      state().connections.delete(sessionID)
      log.info("disconnected", { sessionID })
    } catch (error) {
      log.error("disconnect failed", { sessionID, error })
      throw error
    }
  }

  export async function isConnected(sessionID: string): Promise<boolean> {
    const client = await get(sessionID)
    return !!client
  }
}

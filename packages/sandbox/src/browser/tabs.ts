import CDP from "chrome-remote-interface"
import { Instance } from "../project"
import { Log } from "../utils"
import { BrowserConnection } from "./connection"

export namespace BrowserTabs {
  const log = Log.create({ service: "browser.tabs" })

  export interface Tab {
    id: string          // CDP target ID
    cdp: CDP.Client     // CDP connection to this specific tab
    url: string         // Current URL
    title: string       // Page title
    createdAt: number   // Timestamp
  }

  export interface BrowserInstance {
    host: string
    port: number
    tabs: Map<string, Tab>  // tabId -> Tab
  }

  export const state = Instance.state(
    () => {
      const browsers = new Map<string, BrowserInstance>()  // `${host}:${port}` -> BrowserInstance
      const sessionActiveTab = new Map<string, string>()  // sessionID -> activeTabId
      return { browsers, sessionActiveTab }
    },
    async (state) => {
      // Cleanup: close all tab connections
      for (const [browserKey, browser] of state.browsers) {
        for (const [tabId, tab] of browser.tabs) {
          try {
            await tab.cdp.close()
            log.info("tab connection closed", { browserKey, tabId })
          } catch (error) {
            log.error("failed to close tab connection", { browserKey, tabId, error })
          }
        }
        browser.tabs.clear()
      }
      state.browsers.clear()
      state.sessionActiveTab.clear()
    }
  )

  function getBrowserKey(host: string, port: number): string {
    return `${host}:${port}`
  }

  export async function initialize(sessionID: string): Promise<void> {
    // Get the browser connection for this session
    const connection = await BrowserConnection.get(sessionID)
    if (!connection) {
      throw new Error("No browser connection found for session. Connect to browser first.")
    }

    const { host, port } = connection
    const browserKey = getBrowserKey(host, port)

    // Check if this browser is already initialized
    let browser = state().browsers.get(browserKey)
    if (!browser) {
      // Create new browser instance
      browser = {
        host,
        port,
        tabs: new Map(),
      }
      state().browsers.set(browserKey, browser)
    }

    // Add the initial tab if it's not already there
    if (connection.target && !browser.tabs.has(connection.target)) {
      const result = await connection.cdp.Runtime.evaluate({
        expression: `JSON.stringify({ url: window.location.href, title: document.title })`,
        returnByValue: true,
      })
      const pageInfo = JSON.parse(result.result.value as string)

      const tab: Tab = {
        id: connection.target,
        cdp: connection.cdp,
        url: pageInfo.url,
        title: pageInfo.title,
        createdAt: Date.now(),
      }

      browser.tabs.set(connection.target, tab)
    }

    // Set this tab as active for this session if no active tab is set
    if (!state().sessionActiveTab.has(sessionID) && connection.target) {
      state().sessionActiveTab.set(sessionID, connection.target)
    }

    log.info("tabs initialized", { sessionID, browserKey, initialTabId: connection.target })
  }

  export async function getTab(sessionID: string, tabId?: string): Promise<Tab | undefined> {
    const connection = await BrowserConnection.get(sessionID)
    if (!connection) return undefined

    const browserKey = getBrowserKey(connection.host, connection.port)
    const browser = state().browsers.get(browserKey)

    if (!browser) {
      // Try to initialize if not yet initialized
      await initialize(sessionID)
      return getTab(sessionID, tabId)
    }

    // If tabId specified, return that tab
    if (tabId) {
      return browser.tabs.get(tabId)
    }

    // Otherwise return active tab for this session
    const activeTabId = state().sessionActiveTab.get(sessionID)
    if (!activeTabId) return undefined
    return browser.tabs.get(activeTabId)
  }

  export async function listTabs(sessionID: string): Promise<Tab[]> {
    const connection = await BrowserConnection.get(sessionID)
    if (!connection) return []

    const browserKey = getBrowserKey(connection.host, connection.port)
    const browser = state().browsers.get(browserKey)

    if (!browser) {
      await initialize(sessionID)
      return listTabs(sessionID)
    }

    return Array.from(browser.tabs.values())
  }

  export async function getActiveTabId(sessionID: string): Promise<string | null> {
    return state().sessionActiveTab.get(sessionID) || null
  }

  export async function createTab(input: {
    sessionID: string
    url?: string
  }): Promise<Tab> {
    // Get the browser connection to get host/port
    const connection = await BrowserConnection.get(input.sessionID)
    if (!connection) {
      throw new Error("No browser connection found for session")
    }

    const { host, port } = connection
    const browserKey = getBrowserKey(host, port)

    // Ensure browser is initialized
    let browser = state().browsers.get(browserKey)
    if (!browser) {
      await initialize(input.sessionID)
      browser = state().browsers.get(browserKey)
    }

    if (!browser) {
      throw new Error("Failed to initialize browser tabs")
    }

    // Create a new target (tab) via CDP HTTP API using PUT method
    const newTabUrl = input.url || "about:blank"
    const createUrl = `http://${host}:${port}/json/new?${encodeURIComponent(newTabUrl)}`

    log.info("creating new tab", { browserKey, createUrl, sessionID: input.sessionID })

    const createResponse = await fetch(createUrl, {
      method: "PUT",  // Chrome CDP expects PUT for /json/new
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      log.error("failed to create tab via CDP", {
        status: createResponse.status,
        statusText: createResponse.statusText,
        errorText,
        browserKey
      })
      throw new Error(`Failed to create tab: ${createResponse.status} ${createResponse.statusText}`)
    }

    const responseText = await createResponse.text()
    log.info("received CDP response", { responseText, browserKey })

    let newTarget: { id: string; url: string; title: string }

    try {
      newTarget = JSON.parse(responseText)
      log.info("parsed new target", { newTarget, browserKey })
    } catch (error) {
      log.error("failed to parse CDP response", { responseText, error, browserKey })
      throw new Error(`Failed to parse CDP response when creating tab: ${responseText}`)
    }

    // Connect to the new target
    const cdp = await CDP({ host, port, target: newTarget.id })
    await cdp.Page.enable()
    await cdp.Runtime.enable()
    await cdp.Network.enable()

    // Wait for page to load if URL was provided
    if (input.url) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 5000)
        cdp.Page.loadEventFired(() => {
          clearTimeout(timeout)
          resolve()
        })
      })
    }

    // Get page info
    const result = await cdp.Runtime.evaluate({
      expression: `JSON.stringify({ url: window.location.href, title: document.title })`,
      returnByValue: true,
    })
    const pageInfo = JSON.parse(result.result.value as string)

    const tab: Tab = {
      id: newTarget.id,
      cdp,
      url: pageInfo.url,
      title: pageInfo.title,
      createdAt: Date.now(),
    }

    browser.tabs.set(newTarget.id, tab)
    log.info("tab created", { sessionID: input.sessionID, browserKey, tabId: newTarget.id, url: input.url })

    return tab
  }

  export async function switchTab(sessionID: string, tabId: string): Promise<void> {
    const connection = await BrowserConnection.get(sessionID)
    if (!connection) {
      throw new Error("No browser connection found for session")
    }

    const browserKey = getBrowserKey(connection.host, connection.port)
    const browser = state().browsers.get(browserKey)

    if (!browser) {
      throw new Error("Browser not initialized")
    }

    if (!browser.tabs.has(tabId)) {
      throw new Error(`Tab ${tabId} not found in browser ${browserKey}`)
    }

    state().sessionActiveTab.set(sessionID, tabId)
    log.info("switched tab", { sessionID, tabId, browserKey })
  }

  export async function closeTab(sessionID: string, tabId: string): Promise<void> {
    const connection = await BrowserConnection.get(sessionID)
    if (!connection) {
      throw new Error("No browser connection found for session")
    }

    const browserKey = getBrowserKey(connection.host, connection.port)
    const browser = state().browsers.get(browserKey)

    if (!browser) {
      throw new Error("Browser not initialized")
    }

    const tab = browser.tabs.get(tabId)
    if (!tab) {
      throw new Error(`Tab ${tabId} not found`)
    }

    // Don't allow closing the last tab
    if (browser.tabs.size === 1) {
      throw new Error("Cannot close the last tab. At least one tab must remain open.")
    }

    // Close CDP connection
    await tab.cdp.close()

    // Close the target via CDP HTTP API
    await fetch(`http://${connection.host}:${connection.port}/json/close/${tabId}`)

    // Remove from tabs
    browser.tabs.delete(tabId)

    // If this was the active tab for this session, switch to another tab
    if (state().sessionActiveTab.get(sessionID) === tabId) {
      const remainingTabs = Array.from(browser.tabs.keys())
      const firstTab = remainingTabs[0]
      if (firstTab) {
        state().sessionActiveTab.set(sessionID, firstTab)
      } else {
        state().sessionActiveTab.delete(sessionID)
      }
    }

    log.info("tab closed", { sessionID, tabId, browserKey })
  }

  export async function closeAll(sessionID: string): Promise<void> {
    const connection = await BrowserConnection.get(sessionID)
    if (!connection) return

    const browserKey = getBrowserKey(connection.host, connection.port)
    const browser = state().browsers.get(browserKey)
    if (!browser) return

    // Close all tab CDP connections
    for (const [tabId, tab] of browser.tabs) {
      try {
        await tab.cdp.close()
        log.info("tab connection closed", { browserKey, tabId })
      } catch (error) {
        log.error("failed to close tab", { browserKey, tabId, error })
      }
    }

    state().browsers.delete(browserKey)
    state().sessionActiveTab.delete(sessionID)
    log.info("closed all tabs for browser", { sessionID, browserKey })
  }
}

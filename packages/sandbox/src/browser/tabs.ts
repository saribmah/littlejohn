import CDP from "chrome-remote-interface"
import { Log } from "../utils"
import { BrowserLauncher } from "./launcher"

export namespace BrowserTabs {
  const log = Log.create({ service: "browser.tabs" })

  export interface Tab {
    id: string          // CDP target ID
    cdp: CDP.Client     // CDP connection to this specific tab
    url: string         // Current URL
    title: string       // Page title
    createdAt: number   // Timestamp
  }

  // Single browser instance with tabs
  const tabs = new Map<string, Tab>()  // tabId -> Tab
  let activeTabId: string | null = null

  export async function initialize(): Promise<void> {
    // Get the browser instance
    const browser = await BrowserLauncher.get()
    if (!browser) {
      throw new Error("No browser running. Launch browser first.")
    }

    // Add the initial tab if it's not already there
    if (!tabs.has(browser.target)) {
      const result = await browser.cdp.Runtime.evaluate({
        expression: `JSON.stringify({ url: window.location.href, title: document.title })`,
        returnByValue: true,
      })
      const pageInfo = JSON.parse(result.result.value as string)

      const tab: Tab = {
        id: browser.target,
        cdp: browser.cdp,
        url: pageInfo.url,
        title: pageInfo.title,
        createdAt: Date.now(),
      }

      tabs.set(browser.target, tab)
    }

    // Set this tab as active if no active tab is set
    if (!activeTabId) {
      activeTabId = browser.target
    }

    log.info("tabs initialized", { initialTabId: browser.target })
  }

  export async function getTab(tabId?: string): Promise<Tab | undefined> {
    // If no browser initialized, try to initialize
    if (tabs.size === 0) {
      await initialize()
    }

    // If tabId specified, return that tab
    if (tabId) {
      return tabs.get(tabId)
    }

    // Otherwise return active tab
    if (!activeTabId) return undefined
    return tabs.get(activeTabId)
  }

  export async function listTabs(): Promise<Tab[]> {
    if (tabs.size === 0) {
      await initialize()
    }
    return Array.from(tabs.values())
  }

  export async function getActiveTabId(): Promise<string | null> {
    return activeTabId
  }

  export async function createTab(input: {
    url?: string
  }): Promise<Tab> {
    // Get the browser instance
    const browser = await BrowserLauncher.get()
    if (!browser) {
      throw new Error("No browser running")
    }

    const host = 'localhost'
    const port = browser.port

    // Ensure tabs initialized
    if (tabs.size === 0) {
      await initialize()
    }

    // Create a new target (tab) via CDP HTTP API using PUT method
    const newTabUrl = input.url || "about:blank"
    const createUrl = `http://${host}:${port}/json/new?${encodeURIComponent(newTabUrl)}`

    log.info("creating new tab", { createUrl })

    const createResponse = await fetch(createUrl, {
      method: "PUT",  // Chrome CDP expects PUT for /json/new
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      log.error("failed to create tab via CDP", {
        status: createResponse.status,
        statusText: createResponse.statusText,
        errorText,
      })
      throw new Error(`Failed to create tab: ${createResponse.status} ${createResponse.statusText}`)
    }

    const responseText = await createResponse.text()
    log.info("received CDP response", { responseText })

    let newTarget: { id: string; url: string; title: string }

    try {
      newTarget = JSON.parse(responseText)
      log.info("parsed new target", { newTarget })
    } catch (error) {
      log.error("failed to parse CDP response", { responseText, error })
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

    tabs.set(newTarget.id, tab)
    log.info("tab created", { tabId: newTarget.id, url: input.url })

    return tab
  }

  export async function switchTab(tabId: string): Promise<void> {
    if (!tabs.has(tabId)) {
      throw new Error(`Tab ${tabId} not found`)
    }

    activeTabId = tabId
    log.info("switched tab", { tabId })
  }

  export async function closeTab(tabId: string): Promise<void> {
    const tab = tabs.get(tabId)
    if (!tab) {
      throw new Error(`Tab ${tabId} not found`)
    }

    // Don't allow closing the last tab
    if (tabs.size === 1) {
      throw new Error("Cannot close the last tab. At least one tab must remain open.")
    }

    const browser = await BrowserLauncher.get()
    if (!browser) {
      throw new Error("No browser running")
    }

    // Close CDP connection
    await tab.cdp.close()

    // Close the target via CDP HTTP API
    await fetch(`http://localhost:${browser.port}/json/close/${tabId}`)

    // Remove from tabs
    tabs.delete(tabId)

    // If this was the active tab, switch to another tab
    if (activeTabId === tabId) {
      const remainingTabs = Array.from(tabs.keys())
      const firstTab = remainingTabs[0]
      if (firstTab) {
        activeTabId = firstTab
      } else {
        activeTabId = null
      }
    }

    log.info("tab closed", { tabId })
  }

  export async function closeAll(): Promise<void> {
    // Close all tab CDP connections
    for (const [tabId, tab] of tabs) {
      try {
        await tab.cdp.close()
        log.info("tab connection closed", { tabId })
      } catch (error) {
        log.error("failed to close tab", { tabId, error })
      }
    }

    tabs.clear()
    activeTabId = null
    log.info("closed all tabs")
  }
}

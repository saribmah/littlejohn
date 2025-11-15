import { spawn, type Subprocess } from "bun"
import CDP from "chrome-remote-interface"
import { Log } from "../utils"
import { BrowserStealth } from "./stealth"

export namespace BrowserLauncher {
  const log = Log.create({ service: "browser.launcher" })

  export interface LaunchOptions {
    port?: number
    headless?: boolean
    stealth?: boolean  // Enable stealth mode (uses headed mode + anti-detection features)
    userDataDir?: string
    args?: string[]
  }

  export interface BrowserInstance {
    process: Subprocess
    port: number
    pid: number
    cdp: CDP.Client     // CDP connection
    target: string      // Target ID
  }

  // Single browser instance with CDP connection
  let browserInstance: BrowserInstance | null = null

  export async function launch(options: LaunchOptions = {}): Promise<BrowserInstance> {
    const port = options.port || 9222

    // If stealth mode is enabled, force headed mode (headless is more detectable)
    const headless = options.stealth ? false : (options.headless !== false) // default to true

    log.info("launching browser", { port, headless, stealth: options.stealth })

    // Check if browser already running
    if (browserInstance) {
      log.info("browser already running", { port: browserInstance.port })
      return browserInstance
    }

    // Use a temporary user data directory if none specified
    // This prevents conflicts with existing Chrome instances
    const userDataDir = options.userDataDir || `/tmp/chrome-remote-${port}`

    // Build Chrome arguments
    const baseArgs = [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=TranslateUI",
      "--disable-popup-blocking",
      ...(headless ? ["--headless=new"] : []),
    ]

    // Add stealth args if stealth mode is enabled
    const stealthArgs = options.stealth ? BrowserStealth.getStealthArgs() : []

    // Combine all args (filter out duplicates from stealth args that may already be in baseArgs)
    const allArgs = [...baseArgs]
    for (const arg of stealthArgs) {
      const argName = arg.split("=")[0] || arg
      if (!allArgs.some((a) => a.startsWith(argName))) {
        allArgs.push(arg)
      }
    }

    const args = [...allArgs, ...(options.args || [])]

    // Try to find Chrome executable
    const chromePaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS
      "/usr/bin/google-chrome", // Linux
      "/usr/bin/chromium-browser", // Linux Chromium
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Windows
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", // Windows 32-bit
    ]

    let chromePath: string | undefined
    for (const path of chromePaths) {
      const file = Bun.file(path)
      if (await file.exists()) {
        chromePath = path
        break
      }
    }

    if (!chromePath) {
      // Try using PATH
      chromePath = "google-chrome"
    }

    try {
      const process = spawn([chromePath, ...args], {
        stdout: "pipe",
        stderr: "pipe",
      })

      // Log Chrome output
      if (process.stdout) {
        process.stdout.pipeTo(new WritableStream({
          write(chunk) {
            const text = new TextDecoder().decode(chunk)
            if (text.trim()) {
              log.info("chrome stdout", { port, text: text.trim() })
            }
          }
        })).catch(() => {})
      }

      if (process.stderr) {
        process.stderr.pipeTo(new WritableStream({
          write(chunk) {
            const text = new TextDecoder().decode(chunk)
            if (text.trim()) {
              log.info("chrome stderr", { port, text: text.trim() })
            }
          }
        })).catch(() => {})
      }

      log.info("browser launched, connecting via CDP", { port, pid: process.pid, headless, userDataDir })

      // Wait a bit for Chrome to start
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Connect to browser via CDP with retry logic
      const maxRetries = 10
      const retryDelay = 500
      let lastError: Error | undefined
      let cdpClient: CDP.Client | undefined
      let targetId: string | undefined

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Get list of targets
          const targets = await CDP.List({ host: 'localhost', port })
          log.info("available targets", { count: targets.length, attempt })

          // Find the first page target
          const pageTarget = targets.find((t) => t.type === "page")
          if (!pageTarget) {
            throw new Error("No browser page found")
          }
          targetId = pageTarget.id

          // Connect to the target
          cdpClient = await CDP({ host: 'localhost', port, target: targetId })

          // Enable required domains
          await cdpClient.Page.enable()
          await cdpClient.Runtime.enable()
          await cdpClient.Network.enable()

          // Inject stealth scripts if stealth mode enabled
          if (options.stealth) {
            try {
              await BrowserStealth.maskAutomation(cdpClient)
              log.info("stealth scripts injected")
            } catch (error) {
              log.warn("failed to inject stealth scripts, continuing anyway", { error })
            }
          }

          log.info("CDP connected successfully", { target: targetId, attempt })
          break
        } catch (error) {
          lastError = error as Error
          if (attempt < maxRetries) {
            log.info("CDP connection attempt failed, retrying", { attempt, maxRetries, delay: retryDelay })
            await new Promise(resolve => setTimeout(resolve, retryDelay))
          }
        }
      }

      if (!cdpClient || !targetId) {
        // Kill the browser process since we couldn't connect
        process.kill()
        throw new Error(
          `Failed to connect to browser via CDP after ${maxRetries} attempts. Last error: ${lastError?.message}`
        )
      }

      browserInstance = {
        process,
        port,
        pid: process.pid,
        cdp: cdpClient,
        target: targetId,
      }

      log.info("browser fully initialized", { port, pid: process.pid, target: targetId })

      return browserInstance
    } catch (error) {
      log.error("failed to launch browser", { error, chromePath })
      throw new Error(`Failed to launch Chrome at ${chromePath}: ${error}`)
    }
  }

  export async function kill(): Promise<void> {
    if (!browserInstance) {
      throw new Error("No browser running")
    }

    try {
      // Close CDP connection first
      await browserInstance.cdp.close()
      log.info("CDP connection closed")
      
      // Kill browser process
      browserInstance.process.kill()
      log.info("browser killed", { port: browserInstance.port, pid: browserInstance.pid })
      browserInstance = null
    } catch (error) {
      log.error("failed to kill browser", { error })
      throw error
    }
  }

  export async function get(): Promise<BrowserInstance | null> {
    return browserInstance
  }

  export async function getCDP(): Promise<CDP.Client> {
    if (!browserInstance) {
      throw new Error("No browser running. Call launch() first.")
    }
    return browserInstance.cdp
  }

  export async function getTarget(): Promise<string> {
    if (!browserInstance) {
      throw new Error("No browser running. Call launch() first.")
    }
    return browserInstance.target
  }
}

import { spawn, type Subprocess } from "bun"
import { Log } from "../utils"
import { Instance } from "../project"
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

  export interface BrowserProcess {
    process: Subprocess
    port: number
    pid: number
  }

  export const state = Instance.state(
    () => {
      const browsers = new Map<number, BrowserProcess>()
      return { browsers }
    },
    async (state) => {
      // Cleanup: kill all browser processes
      for (const [port, browser] of state.browsers) {
        try {
          browser.process.kill()
          log.info("browser killed", { port, pid: browser.pid })
        } catch (error) {
          log.error("failed to kill browser", { port, pid: browser.pid, error })
        }
      }
      state.browsers.clear()
    }
  )

  export async function launch(options: LaunchOptions = {}): Promise<BrowserProcess> {
    const port = options.port || 9222

    // If stealth mode is enabled, force headed mode (headless is more detectable)
    const headless = options.stealth ? false : (options.headless !== false) // default to true

    log.info("launching browser", { port, headless, stealth: options.stealth })

    // Check if browser already running on this port
    const existing = state().browsers.get(port)
    if (existing) {
      log.info("browser already running on port", { port })
      return existing
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

      const browser: BrowserProcess = {
        process,
        port,
        pid: process.pid,
      }

      state().browsers.set(port, browser)
      log.info("browser launched", { port, pid: process.pid, headless, userDataDir })

      // Wait a bit for Chrome to start
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return browser
    } catch (error) {
      log.error("failed to launch browser", { error, chromePath })
      throw new Error(`Failed to launch Chrome at ${chromePath}: ${error}`)
    }
  }

  export async function kill(port: number): Promise<void> {
    const browser = state().browsers.get(port)
    if (!browser) {
      throw new Error(`No browser running on port ${port}`)
    }

    try {
      browser.process.kill()
      state().browsers.delete(port)
      log.info("browser killed", { port, pid: browser.pid })
    } catch (error) {
      log.error("failed to kill browser", { port, pid: browser.pid, error })
      throw error
    }
  }

  export async function list(): Promise<BrowserProcess[]> {
    return Array.from(state().browsers.values())
  }

  export async function get(port: number): Promise<BrowserProcess | undefined> {
    return state().browsers.get(port)
  }
}

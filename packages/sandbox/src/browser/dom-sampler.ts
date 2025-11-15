import * as D2Snap from "@surfly/d2snap"
import { JSDOM } from "jsdom"
import { Log } from "../utils"
import type { Extractor } from "./extractor"

export namespace DOMSampler {
  const log = Log.create({ service: "browser.dom-sampler" })

  export interface SampleOptions {
    html: string
    elements: Extractor.ElementInfo[] // Elements with locator bundles from extractor
    maxTokens?: number
    maxIterations?: number
    assignUniqueIDs?: boolean
    filterHidden?: boolean
  }

  export interface SampleResult {
    html: string
    tokenCount: number
    elementCount: number
    reductionPercent: number
    elements: Extractor.ElementInfo[] // Full elements with locator bundles
  }

  /**
   * Sample and downsample DOM using D2Snap algorithm
   */
  export async function sample(options: SampleOptions): Promise<SampleResult> {
    const {
      html,
      elements,
      maxTokens = 4096,
      maxIterations = 5,
      assignUniqueIDs = false, // Don't inject IDs into the DOM
      filterHidden = true,
    } = options

    const startTime = Date.now()

    log.info("sampling DOM", {
      inputLength: html.length,
      maxTokens,
      maxIterations,
      elementCount: elements.length,
      filterHidden,
    })

    // Parse HTML with jsdom for server-side processing
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Filter hidden elements if requested
    if (filterHidden) {
      filterHiddenElements(document)
    }

    // Run D2Snap adaptive downsampling
    const downsampledResult = await D2Snap.adaptiveD2Snap(
      document.documentElement,
      maxTokens,
      maxIterations,
      {
        assignUniqueIDs, // Keep false to avoid DOM mutation
        debug: false,
      }
    )

    // Get HTML from result
    const downsampledHTML = downsampledResult.serializedHtml

    // Use D2Snap's token estimation
    const tokenCount = downsampledResult.meta.estimatedTokens
    const originalTokenCount = Math.ceil(html.length / 4)
    const reductionPercent = Math.round(
      ((originalTokenCount - tokenCount) / originalTokenCount) * 100
    )

    const samplingTime = Date.now() - startTime

    log.info("sampling complete", {
      originalTokens: originalTokenCount,
      downsampledTokens: tokenCount,
      reductionPercent,
      elementCount: elements.length,
      samplingTime,
    })

    return {
      html: downsampledHTML,
      tokenCount,
      elementCount: elements.length,
      reductionPercent,
      elements, // Use elements from extractor with full locator bundles
    }
  }

  /**
   * Filter out hidden elements from the DOM
   * This is a simplified version - in production, you'd need to
   * actually compute styles, which requires a headless browser
   */
  function filterHiddenElements(document: Document): void {
    const hiddenSelectors = [
      '[style*="display: none"]',
      '[style*="display:none"]',
      '[style*="visibility: hidden"]',
      '[style*="visibility:hidden"]',
      '[hidden]',
      '[aria-hidden="true"]',
    ]

    let removedCount = 0
    hiddenSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.remove()
        removedCount++
      })
    })

    if (removedCount > 0) {
      log.info("filtered hidden elements", { count: removedCount })
    }
  }

}

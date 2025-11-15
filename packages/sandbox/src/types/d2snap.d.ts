declare module "@surfly/d2snap" {
  interface D2SnapOptions {
    assignUniqueIDs?: boolean
    debug?: boolean
  }

  interface D2SnapResult {
    serializedHtml: string
    meta: {
      originalSize: number
      snapshotSize: number
      sizeRatio: number
      estimatedTokens: number
    }
    parameters: {
      k: number
      l: number
      m: number
      adaptiveIterations: number
    }
  }

  namespace D2Snap {
    /**
     * Manual DOM downsampling with specific parameters
     * @param dom - Document, Element, or HTML string
     * @param k - Horizontal sampling parameter
     * @param l - Vertical sampling parameter
     * @param m - Depth/complexity parameter
     * @param options - Configuration options
     * @returns Downsampled result with HTML and metadata
     */
    function d2Snap(
      dom: Document | Element | string,
      k: number,
      l: number,
      m: number,
      options?: D2SnapOptions
    ): Promise<D2SnapResult>

    /**
     * Adaptive DOM downsampling with automatic parameter tuning
     * @param dom - Document, Element, or HTML string
     * @param maxTokens - Target maximum token count (default: 4096)
     * @param maxIterations - Maximum refinement iterations (default: 5)
     * @param options - Configuration options
     * @returns Downsampled result with HTML and metadata
     */
    function adaptiveD2Snap(
      dom: Document | Element | string,
      maxTokens?: number,
      maxIterations?: number,
      options?: D2SnapOptions
    ): Promise<D2SnapResult>
  }

  export = D2Snap
}

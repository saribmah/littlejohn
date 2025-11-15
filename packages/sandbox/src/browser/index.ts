/**
 * Browser Management Module
 * Provides CDP-based browser automation with tab management and stealth capabilities
 */

// Core browser management exports
export { BrowserLauncher } from './launcher';
export { BrowserConnection } from './connection';
export { BrowserTabs } from './tabs';
export { BrowserStealth } from './stealth';

// Additional browser utilities
export { DOMSampler } from './dom-sampler';
export { Extractor } from './extractor';
export { Resolver } from './resolver';
export { SnapshotStorage } from './snapshot-storage';

/**
 * Browser Tabs Management
 * Manages browser tabs/pages per session
 */

import { browserManager } from './index';
import { BrowserConnection } from './connection';
import type { Page } from 'playwright';

export interface Tab {
  id: string;
  url: string;
  title: string;
  cdp: BrowserConnection['cdp'];
  page: Page;
  isActive: boolean;
}

class TabsManager {
  private sessions: Map<string, Map<string, Tab>> = new Map();
  private activeTabs: Map<string, string> = new Map(); // sessionID -> activeTabID

  /**
   * Get or create a tab
   */
  async getTab(sessionID: string, tabId?: string): Promise<Tab | null> {
    let sessionTabs = this.sessions.get(sessionID);
    
    if (!sessionTabs) {
      sessionTabs = new Map();
      this.sessions.set(sessionID, sessionTabs);
    }

    // If no tabId provided, get active tab or create default tab
    if (!tabId) {
      const activeTabId = this.activeTabs.get(sessionID);
      if (activeTabId) {
        return sessionTabs.get(activeTabId) || null;
      }
      
      // Create default tab if none exists
      return await this.createTab(sessionID);
    }

    return sessionTabs.get(tabId) || null;
  }

  /**
   * Create a new tab
   */
  async createTab(sessionID: string, url?: string): Promise<Tab> {
    const page = await browserManager.newPage();
    
    if (url) {
      await page.goto(url);
    }

    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const connection = new BrowserConnection(page);

    const tab: Tab = {
      id: tabId,
      url: url || 'about:blank',
      title: (await page.title()) || '',
      cdp: connection.cdp,
      page,
      isActive: false
    };

    let sessionTabs = this.sessions.get(sessionID);
    if (!sessionTabs) {
      sessionTabs = new Map();
      this.sessions.set(sessionID, sessionTabs);
    }

    sessionTabs.set(tabId, tab);

    // Set as active if it's the first tab
    if (sessionTabs.size === 1) {
      this.setActiveTab(sessionID, tabId);
    }

    return tab;
  }

  /**
   * List all tabs for a session
   */
  listTabs(sessionID: string): Tab[] {
    const sessionTabs = this.sessions.get(sessionID);
    if (!sessionTabs) {
      return [];
    }
    return Array.from(sessionTabs.values());
  }

  /**
   * Set active tab
   */
  setActiveTab(sessionID: string, tabId: string): void {
    const sessionTabs = this.sessions.get(sessionID);
    if (!sessionTabs) {
      return;
    }

    // Deactivate all tabs
    for (const tab of sessionTabs.values()) {
      tab.isActive = false;
    }

    // Activate selected tab
    const tab = sessionTabs.get(tabId);
    if (tab) {
      tab.isActive = true;
      this.activeTabs.set(sessionID, tabId);
    }
  }

  /**
   * Close a tab
   */
  async closeTab(sessionID: string, tabId: string): Promise<void> {
    const sessionTabs = this.sessions.get(sessionID);
    if (!sessionTabs) {
      return;
    }

    const tab = sessionTabs.get(tabId);
    if (!tab) {
      return;
    }

    await tab.page.close();
    sessionTabs.delete(tabId);

    // If this was the active tab, set another tab as active
    if (this.activeTabs.get(sessionID) === tabId) {
      this.activeTabs.delete(sessionID);
      const remainingTabs = Array.from(sessionTabs.values());
      if (remainingTabs.length > 0 && remainingTabs[0]) {
        this.setActiveTab(sessionID, remainingTabs[0].id);
      }
    }
  }

  /**
   * Close all tabs for a session
   */
  async closeSession(sessionID: string): Promise<void> {
    const sessionTabs = this.sessions.get(sessionID);
    if (!sessionTabs) {
      return;
    }

    for (const tab of sessionTabs.values()) {
      await tab.page.close();
    }

    this.sessions.delete(sessionID);
    this.activeTabs.delete(sessionID);
  }
}

export const BrowserTabs = new TabsManager();

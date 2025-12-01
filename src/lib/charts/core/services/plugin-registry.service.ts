/**
 * Plugin registry service managing chart plugins and their lifecycle
 */

import { Injectable } from '@angular/core';
import { IChart, IChartPlugin } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class PluginRegistry {
  private plugins = new Map<string, IChartPlugin>();

  /**
   * Register a plugin
   */
  register(plugin: IChartPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  /**
   * Unregister a plugin
   */
  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  /**
   * Get a plugin by id
   */
  get(id: string): IChartPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Get all plugins
   */
  getAll(): IChartPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Notify plugins of a lifecycle event
   * Returns false if any plugin returns false, preventing the action
   */
  notify(
    hook: keyof IChartPlugin,
    chart: IChart
  ): boolean {
    for (const plugin of this.plugins.values()) {
      const method = plugin[hook] as Function | undefined;
      if (typeof method === 'function') {
        const result = method.call(plugin, chart);
        if (result === false) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.clear();
  }
}

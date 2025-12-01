/**
 * Factory pattern service for creating chart rendering strategies
 */

import { Injectable } from '@angular/core';
import { ChartType, IChartStrategy } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ChartStrategyFactory {
  private strategies = new Map<ChartType, () => IChartStrategy>();

  /**
   * Register a chart strategy
   */
  registerStrategy(type: ChartType, factory: () => IChartStrategy): void {
    this.strategies.set(type, factory);
  }

  /**
   * Create a chart strategy instance
   */
  create(type: ChartType): IChartStrategy {
    const factory = this.strategies.get(type);
    if (!factory) {
      throw new Error(`Unknown chart type: ${type}`);
    }
    return factory();
  }

  /**
   * Check if a strategy is registered
   */
  has(type: ChartType): boolean {
    return this.strategies.has(type);
  }

  /**
   * Get all registered strategy types
   */
  getRegisteredTypes(): ChartType[] {
    return Array.from(this.strategies.keys());
  }
}

/**
 * Strategy pattern interface for chart rendering implementations
 */

import { DataPoint, ChartScales } from './types';

export interface IChartStrategy {
  /**
   * Render the chart in the given container
   */
  render(
    container: SVGGElement,
    data: DataPoint[],
    scales: ChartScales
  ): void;

  /**
   * Update the chart with new data
   */
  update(
    data: DataPoint[],
    scales: ChartScales
  ): void;

  /**
   * Cleanup and destroy the chart rendering
   */
  destroy(): void;

  /**
   * Get the DOM elements created by this strategy
   */
  getElements(): SVGElement[];
}

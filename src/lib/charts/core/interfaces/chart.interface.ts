/**
 * Main chart interface defining the contract for all chart implementations
 */

import { ChartConfig, DataPoint } from './types';

export interface IChart {
  /**
   * Unique identifier for the chart instance
   */
  id: string;

  /**
   * Current chart configuration
   */
  config: ChartConfig;

  /**
   * Current data points
   */
  data: DataPoint[];

  /**
   * Initialize the chart with config and data
   */
  initialize(config: ChartConfig, data: DataPoint[]): void;

  /**
   * Update chart data
   */
  updateData(data: DataPoint[]): void;

  /**
   * Update chart configuration
   */
  updateConfig(config: Partial<ChartConfig>): void;

  /**
   * Render the chart
   */
  render(): void;

  /**
   * Resize the chart to new dimensions
   */
  resize(width: number, height: number): void;

  /**
   * Destroy the chart and cleanup resources
   */
  destroy(): void;

  /**
   * Get the SVG element containing the chart
   */
  getSvgElement(): SVGSVGElement | null;
}

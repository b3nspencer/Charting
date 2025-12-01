/**
 * Builder pattern service for fluent chart configuration
 */

import { Injectable } from '@angular/core';
import { ChartConfig, ChartType, DataPoint, Margin, SeriesConfig, YAxisConfig } from '../core/interfaces';

@Injectable({ providedIn: 'root' })
export class ChartBuilderService {
  private config: ChartConfig = { type: 'line' };

  /**
   * Start building a new chart
   */
  static start(): ChartBuilderService {
    return new ChartBuilderService();
  }

  /**
   * Set chart type
   */
  type(type: ChartType): this {
    this.config.type = type;
    return this;
  }

  /**
   * Set chart dimensions
   */
  dimensions(width: number, height: number): this {
    this.config.width = width;
    this.config.height = height;
    return this;
  }

  /**
   * Set chart margins
   */
  margins(margin: Partial<Margin>): this {
    this.config.margin = margin;
    return this;
  }

  /**
   * Set chart data
   */
  data(data: DataPoint[]): this {
    this.config.data = data;
    return this;
  }

  /**
   * Add a Y axis
   */
  addYAxis(config: YAxisConfig): this {
    if (!this.config.yAxes) {
      this.config.yAxes = [];
    }
    this.config.yAxes.push(config);
    return this;
  }

  /**
   * Add a data series
   */
  addSeries(config: SeriesConfig): this {
    if (!this.config.series) {
      this.config.series = [];
    }
    this.config.series.push(config);
    return this;
  }

  /**
   * Enable zoom feature
   */
  enableZoom(enable: boolean = true): this {
    if (!this.config.features) {
      this.config.features = {};
    }
    this.config.features.zoom = enable;
    return this;
  }

  /**
   * Enable tooltip feature
   */
  enableTooltip(enable: boolean = true): this {
    if (!this.config.features) {
      this.config.features = {};
    }
    this.config.features.tooltip = enable;
    return this;
  }

  /**
   * Enable legend feature
   */
  enableLegend(enable: boolean = true): this {
    if (!this.config.features) {
      this.config.features = {};
    }
    this.config.features.legend = enable;
    return this;
  }

  /**
   * Enable brush feature
   */
  enableBrush(enable: boolean = true): this {
    if (!this.config.features) {
      this.config.features = {};
    }
    this.config.features.brush = enable;
    return this;
  }

  /**
   * Set custom configuration
   */
  configure(key: string, value: any): this {
    (this.config as any)[key] = value;
    return this;
  }

  /**
   * Get the current configuration
   */
  getConfig(): ChartConfig {
    return { ...this.config };
  }

  /**
   * Build and return the chart configuration
   */
  build(): ChartConfig {
    if (!this.config.width) {
      this.config.width = 800;
    }
    if (!this.config.height) {
      this.config.height = 400;
    }
    if (!this.config.margin) {
      this.config.margin = {
        top: 20,
        right: 30,
        bottom: 40,
        left: 50,
      };
    }

    return { ...this.config };
  }

  /**
   * Reset builder state
   */
  reset(): this {
    this.config = { type: 'line' };
    return this;
  }
}

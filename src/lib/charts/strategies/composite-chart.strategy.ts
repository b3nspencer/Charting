/**
 * Composite chart strategy supporting multiple chart types on the same canvas
 */

import { DataPoint, ChartScales, IChartStrategy, SeriesConfig } from '../core/interfaces';
import { LineChartStrategy } from './line-chart.strategy';
import { BarChartStrategy } from './bar-chart.strategy';
import { ScatterChartStrategy } from './scatter-chart.strategy';
import { AreaChartStrategy } from './area-chart.strategy';

export class CompositeChartStrategy implements IChartStrategy {
  private strategies: Map<string, IChartStrategy> = new Map();
  private seriesConfigs: SeriesConfig[] = [];

  constructor(seriesConfigs: SeriesConfig[] = []) {
    this.seriesConfigs = seriesConfigs;
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.seriesConfigs.forEach((config, index) => {
      const id = config.id || `series-${index}`;
      let strategy: IChartStrategy | null = null;

      switch (config.type) {
        case 'line':
          strategy = new LineChartStrategy(config.color, config.strokeWidth);
          break;
        case 'bar':
          strategy = new BarChartStrategy(config.color);
          break;
        case 'scatter':
          strategy = new ScatterChartStrategy(config.color, 4);
          break;
        case 'area':
          strategy = new AreaChartStrategy(config.color, config.opacity);
          break;
      }

      if (strategy) {
        this.strategies.set(id, strategy);
      }
    });
  }

  render(
    container: SVGGElement,
    data: DataPoint[],
    scales: ChartScales
  ): void {
    // Create a group for each series
    let index = 0;
    this.strategies.forEach((strategy, id) => {
      const seriesGroup = d3
        .select(container)
        .selectAll<SVGGElement, unknown>(`g.series-group-${index}`)
        .data([null])
        .join('g')
        .attr('class', `series-group series-group-${index}`);

      // Filter data for this series if needed
      const seriesData = data; // All series share the same data for now
      strategy.render(seriesGroup.node()!, seriesData, scales);

      index++;
    });
  }

  update(data: DataPoint[], scales: ChartScales): void {
    this.strategies.forEach((strategy) => {
      strategy.update(data, scales);
    });
  }

  destroy(): void {
    this.strategies.forEach((strategy) => {
      strategy.destroy();
    });
    this.strategies.clear();
  }

  getElements(): SVGElement[] {
    const elements: SVGElement[] = [];
    this.strategies.forEach((strategy) => {
      elements.push(...strategy.getElements());
    });
    return elements;
  }

  addSeries(config: SeriesConfig): void {
    this.seriesConfigs.push(config);
    const id = config.id || `series-${this.seriesConfigs.length - 1}`;
    let strategy: IChartStrategy | null = null;

    switch (config.type) {
      case 'line':
        strategy = new LineChartStrategy(config.color, config.strokeWidth);
        break;
      case 'bar':
        strategy = new BarChartStrategy(config.color);
        break;
      case 'scatter':
        strategy = new ScatterChartStrategy(config.color, 4);
        break;
      case 'area':
        strategy = new AreaChartStrategy(config.color, config.opacity);
        break;
    }

    if (strategy) {
      this.strategies.set(id, strategy);
    }
  }

  removeSeries(id: string): void {
    const strategy = this.strategies.get(id);
    if (strategy) {
      strategy.destroy();
      this.strategies.delete(id);
    }
  }
}

// Import d3 for composite chart
import * as d3 from 'd3';

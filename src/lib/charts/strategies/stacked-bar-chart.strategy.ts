/**
 * Stacked bar chart rendering strategy using D3 stack generator
 */

import * as d3 from 'd3';
import { DataPoint, ChartScales, IChartStrategy } from '../core/interfaces';

interface StackedDataPoint extends DataPoint {
  [key: string]: any;
}

export class StackedBarChartStrategy implements IChartStrategy {
  private groups: any = null;
  private data: StackedDataPoint[] = [];
  private colors: string[] = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
  private keys: string[] = [];

  constructor(keys: string[] = [], colors: string[] = []) {
    this.keys = keys;
    if (colors.length > 0) {
      this.colors = colors;
    }
  }

  render(
    container: SVGGElement,
    data: StackedDataPoint[],
    scales: ChartScales
  ): void {
    this.data = data;

    if (this.keys.length === 0 && data.length > 0) {
      // Auto-detect keys from first data point
      this.keys = Object.keys(data[0]).filter(
        (k) => k !== 'id' && k !== 'category' && k !== 'timestamp' && typeof data[0][k] === 'number'
      );
    }

    const xScale = scales.x as any;
    const yScale = scales.y;

    // Create stack generator
    const stack = d3.stack<StackedDataPoint>().keys(this.keys);
    const stackedData = stack(data);

    // Create color scale
    const colorScale = d3
      .scaleOrdinal<string, string>()
      .domain(this.keys)
      .range(this.colors.slice(0, this.keys.length));

    const selection = d3.select(container) as any;

    // Bind stacked data to groups
    this.groups = selection
      .selectAll('g.stack-group')
      .data(stackedData as any)
      .join('g')
      .attr('class', 'stack-group')
      .attr('fill', (d: any) => colorScale(d.key));

    // Bind individual bars to rects
    this.groups
      .selectAll('rect')
      .data((d: any) => d as any)
      .join('rect')
      .attr('x', (d: any) => {
        const category = (d.data as any).category;
        return xScale(category) as number;
      })
      .attr('y', (d: any) => yScale(d[1]))
      .attr('height', (d: any) => yScale(d[0]) - yScale(d[1]))
      .attr('width', (xScale as any).bandwidth ? (xScale as any).bandwidth() : 20)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);
  }

  update(data: StackedDataPoint[], scales: ChartScales): void {
    this.data = data;

    const xScale = scales.x as any;
    const yScale = scales.y;

    // Create stack generator
    const stack = d3.stack<StackedDataPoint>().keys(this.keys);
    const stackedData = stack(data);

    // Create color scale
    const colorScale = d3
      .scaleOrdinal<string, string>()
      .domain(this.keys)
      .range(this.colors.slice(0, this.keys.length));

    // Update groups
    if (this.groups) {
      this.groups = this.groups
        .data(stackedData as any)
        .attr('fill', (d: any) => colorScale(d.key));

      // Update rects with transition
      this.groups
        .selectAll('rect')
        .data((d: any) => d as any)
        .transition()
        .duration(750)
        .attr('y', (d: any) => yScale(d[1]))
        .attr('height', (d: any) => yScale(d[0]) - yScale(d[1]));
    }
  }

  destroy(): void {
    if (this.groups) {
      this.groups.remove();
      this.groups = null;
    }
  }

  getElements(): SVGElement[] {
    return this.groups ? [this.groups.node()!] : [];
  }

  setKeys(keys: string[]): void {
    this.keys = keys;
  }

  setColors(colors: string[]): void {
    this.colors = colors;
  }
}

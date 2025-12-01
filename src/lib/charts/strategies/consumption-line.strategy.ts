/**
 * Consumption line overlay strategy
 * Designed to overlay a line on a stacked bar chart using category-based X positioning
 * Aggregates consumption data to match bar data granularity (one point per bar)
 */

import * as d3 from 'd3';
import { DataPoint, ChartScales, IChartStrategy } from '../core/interfaces';

export class ConsumptionLineStrategy implements IChartStrategy {
  private lineGroup: any = null;
  private data: DataPoint[] = [];
  private barData: DataPoint[] = [];
  private aggregatedData: DataPoint[] = [];
  private color: string = '#2196F3';
  private strokeWidth: number = 3;

  constructor(color: string = '#2196F3', strokeWidth: number = 3) {
    this.color = color;
    this.strokeWidth = strokeWidth;
  }

  render(
    container: SVGGElement,
    data: DataPoint[],
    scales: ChartScales,
    barData?: DataPoint[]
  ): void {
    this.data = data;
    if (barData) {
      this.barData = barData;
      this.aggregateData();
    }

    const xScale = scales.x as any;
    const yScale = scales.y;

    const selection = d3.select(container);

    // Create line group
    this.lineGroup = selection.append('g').attr('class', 'consumption-line-group');

    // Create line generator using aggregated data
    const lineGenerator = d3
      .line<DataPoint>()
      .x((d, i) => {
        const barDatum = this.barData[i] as any;
        const category = barDatum.category as string;
        const xPos = xScale(category) as number;
        const bandwidth = xScale.bandwidth ? xScale.bandwidth() : 20;
        return xPos + bandwidth / 2;
      })
      .y((d) => yScale(d.value));

    // Draw line path
    this.lineGroup
      .append('path')
      .datum(this.aggregatedData)
      .attr('fill', 'none')
      .attr('stroke', this.color)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineGenerator);

    // Add circles for each data point (one per bar)
    this.lineGroup
      .selectAll('circle')
      .data(this.aggregatedData)
      .join('circle')
      .attr('cx', (d: any, i: any) => {
        const barDatum = this.barData[i] as any;
        const category = barDatum.category as string;
        const xPos = xScale(category) as number;
        const bandwidth = xScale.bandwidth ? xScale.bandwidth() : 20;
        return xPos + bandwidth / 2;
      })
      .attr('cy', (d: any) => yScale(d.value))
      .attr('r', 3)
      .attr('fill', this.color)
      .attr('opacity', 0.9);
  }

  update(data: DataPoint[], scales: ChartScales, barData?: DataPoint[]): void {
    this.data = data;
    if (barData) {
      this.barData = barData;
      this.aggregateData();
    }

    if (!this.lineGroup) return;

    const xScale = scales.x as any;
    const yScale = scales.y;

    const lineGenerator = d3
      .line<DataPoint>()
      .x((d, i) => {
        const barDatum = this.barData[i] as any;
        const category = barDatum.category as string;
        const xPos = xScale(category) as number;
        const bandwidth = xScale.bandwidth ? xScale.bandwidth() : 20;
        return xPos + bandwidth / 2;
      })
      .y((d) => yScale(d.value));

    // Update line with transition
    this.lineGroup
      .selectAll('path')
      .transition()
      .duration(750)
      .attr('d', lineGenerator as any);

    // Update circles
    this.lineGroup
      .selectAll('circle')
      .data(this.aggregatedData)
      .transition()
      .duration(750)
      .attr('cy', (d: any) => yScale(d.value));
  }

  private aggregateData(): void {
    // Aggregate consumption data to match bar data granularity
    // Calculate average consumption for each bar period
    this.aggregatedData = [];

    const pointsPerBar = Math.ceil(this.data.length / this.barData.length);

    for (let i = 0; i < this.barData.length; i++) {
      const startIdx = i * pointsPerBar;
      const endIdx = Math.min((i + 1) * pointsPerBar, this.data.length);
      const periodData = this.data.slice(startIdx, endIdx);

      if (periodData.length > 0) {
        const avgValue = periodData.reduce((sum, d) => sum + d.value, 0) / periodData.length;
        this.aggregatedData.push({
          id: `aggregated-${i}`,
          value: avgValue,
        });
      }
    }
  }

  destroy(): void {
    if (this.lineGroup) {
      this.lineGroup.remove();
      this.lineGroup = null;
    }
  }

  getElements(): SVGElement[] {
    return this.lineGroup ? [this.lineGroup.node()] : [];
  }

  setColor(color: string): void {
    this.color = color;
  }

  setStrokeWidth(width: number): void {
    this.strokeWidth = width;
  }

  setBarData(data: DataPoint[]): void {
    this.barData = data;
  }
}

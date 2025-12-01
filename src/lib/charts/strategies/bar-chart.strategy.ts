/**
 * Bar chart rendering strategy
 */

import * as d3 from 'd3';
import { DataPoint, ChartScales, IChartStrategy } from '../core/interfaces';

export class BarChartStrategy implements IChartStrategy {
  private bars: d3.Selection<SVGRectElement, DataPoint, SVGGElement, unknown> | null = null;
  private data: DataPoint[] = [];
  private color: string = '#1f77b4';

  constructor(color: string = '#1f77b4') {
    this.color = color;
  }

  render(
    container: SVGGElement,
    data: DataPoint[],
    scales: ChartScales
  ): void {
    this.data = data;

    const xScale = scales.x as d3.ScaleBand<string>;
    const yScale = scales.y;
    const bandWidth = xScale.bandwidth();

    const selection = d3.select(container);

    this.bars = selection
      .selectAll<SVGRectElement, DataPoint>('rect.bar')
      .data(data, (d) => (d.id ? d.id.toString() : Math.random().toString()))
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.category || '') || 0)
      .attr('y', (d) => yScale(d.value))
      .attr('width', bandWidth)
      .attr('height', (d) => scales.innerHeight - yScale(d.value))
      .attr('fill', this.color)
      .attr('opacity', 0.8)
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 1).attr('stroke', '#000').attr('stroke-width', 1);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.8).attr('stroke', 'none');
      });
  }

  update(data: DataPoint[], scales: ChartScales): void {
    this.data = data;

    const xScale = scales.x as d3.ScaleBand<string>;
    const yScale = scales.y;
    const bandWidth = xScale.bandwidth();

    if (this.bars) {
      this.bars
        .data(data, (d) => (d.id ? d.id.toString() : Math.random().toString()))
        .join('rect')
        .transition()
        .duration(750)
        .attr('x', (d) => xScale(d.category || '') || 0)
        .attr('y', (d) => yScale(d.value))
        .attr('width', bandWidth)
        .attr('height', (d) => scales.innerHeight - yScale(d.value));
    }
  }

  destroy(): void {
    if (this.bars) {
      this.bars.remove();
      this.bars = null;
    }
  }

  getElements(): SVGElement[] {
    return this.bars ? Array.from(this.bars.nodes()) : [];
  }
}

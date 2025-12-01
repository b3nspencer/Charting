/**
 * Line chart rendering strategy using D3 line generator
 */

import * as d3 from 'd3';
import { DataPoint, ChartScales, IChartStrategy } from '../core/interfaces';

export class LineChartStrategy implements IChartStrategy {
  private path: d3.Selection<SVGPathElement, DataPoint[], null, undefined> | null = null;
  private data: DataPoint[] = [];
  private color: string = 'steelblue';
  private strokeWidth: number = 2;

  constructor(color: string = 'steelblue', strokeWidth: number = 2) {
    this.color = color;
    this.strokeWidth = strokeWidth;
  }

  render(
    container: SVGGElement,
    data: DataPoint[],
    scales: ChartScales
  ): void {
    this.data = data;

    const xScale = scales.x as any;
    const yScale = scales.y;

    const lineGenerator = d3
      .line<DataPoint>()
      .x((d) => xScale(d.timestamp ? d.timestamp : 0) as number)
      .y((d) => yScale(d.value));

    const selection = d3.select(container);

    this.path = (selection
      .selectAll<SVGPathElement, DataPoint[]>('path.line-path')
      .data([data] as any))
      .join('path')
      .attr('class', 'line-path')
      .attr('fill', 'none')
      .attr('stroke', this.color)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineGenerator as any);
  }

  update(data: DataPoint[], scales: ChartScales): void {
    this.data = data;

    const xScale = scales.x as any;
    const yScale = scales.y;

    const lineGenerator = d3
      .line<DataPoint>()
      .x((d) => xScale(d.timestamp ? d.timestamp : 0) as number)
      .y((d) => yScale(d.value));

    if (this.path) {
      this.path
        .transition()
        .duration(750)
        .attr('d', lineGenerator as any);
    }
  }

  destroy(): void {
    if (this.path) {
      this.path.remove();
      this.path = null;
    }
  }

  getElements(): SVGElement[] {
    return this.path ? [this.path.node()!] : [];
  }
}

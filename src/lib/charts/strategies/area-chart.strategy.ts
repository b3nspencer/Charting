/**
 * Area chart rendering strategy using D3 area generator
 */

import * as d3 from 'd3';
import { DataPoint, ChartScales, IChartStrategy } from '../core/interfaces';

export class AreaChartStrategy implements IChartStrategy {
  private path: d3.Selection<SVGPathElement, DataPoint[], null, undefined> | null = null;
  private data: DataPoint[] = [];
  private color: string = 'steelblue';
  private opacity: number = 0.6;

  constructor(color: string = 'steelblue', opacity: number = 0.6) {
    this.color = color;
    this.opacity = opacity;
  }

  render(
    container: SVGGElement,
    data: DataPoint[],
    scales: ChartScales
  ): void {
    this.data = data;

    const xScale = scales.x as d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
    const yScale = scales.y;

    const areaGenerator = d3
      .area<DataPoint>()
      .x((d) => xScale(d.timestamp ? d.timestamp.getTime() : 0) as number)
      .y0(scales.innerHeight)
      .y1((d) => yScale(d.value));

    const selection = d3.select(container);

    this.path = selection
      .selectAll<SVGPathElement, DataPoint[]>('path.area-path')
      .data([data])
      .join('path')
      .attr('class', 'area-path')
      .attr('fill', this.color)
      .attr('fill-opacity', this.opacity)
      .attr('stroke', this.color)
      .attr('stroke-width', 2)
      .attr('d', areaGenerator);
  }

  update(data: DataPoint[], scales: ChartScales): void {
    this.data = data;

    const xScale = scales.x as d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
    const yScale = scales.y;

    const areaGenerator = d3
      .area<DataPoint>()
      .x((d) => xScale(d.timestamp ? d.timestamp.getTime() : 0) as number)
      .y0(scales.innerHeight)
      .y1((d) => yScale(d.value));

    if (this.path) {
      this.path
        .transition()
        .duration(750)
        .attr('d', areaGenerator);
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

/**
 * Scatter plot rendering strategy
 */

import * as d3 from 'd3';
import { DataPoint, ChartScales, IChartStrategy } from '../core/interfaces';

export class ScatterChartStrategy implements IChartStrategy {
  private circles: d3.Selection<SVGCircleElement, DataPoint, SVGGElement, unknown> | null = null;
  private data: DataPoint[] = [];
  private color: string = '#ff7f0e';
  private radius: number = 4;

  constructor(color: string = '#ff7f0e', radius: number = 4) {
    this.color = color;
    this.radius = radius;
  }

  private mouseoverHandler = () => {
    d3.select(event as any)
      .attr('r', this.radius + 2)
      .attr('opacity', 1);
  };

  private mouseoutHandler = () => {
    d3.select(event as any)
      .attr('r', this.radius)
      .attr('opacity', 0.7);
  };

  render(
    container: SVGGElement,
    data: DataPoint[],
    scales: ChartScales
  ): void {
    this.data = data;

    const xScale = scales.x as any;
    const yScale = scales.y;

    const selection = d3.select(container);

    this.circles = selection
      .selectAll<SVGCircleElement, DataPoint>('circle.dot')
      .data(data, (d: DataPoint) => (d.id ? d.id.toString() : Math.random().toString()))
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d: DataPoint) => {
        if (d.timestamp) {
          return xScale(d.timestamp) as number;
        } else if (d.category) {
          const bandScale = xScale as d3.ScaleBand<string>;
          return (bandScale(d.category) || 0) + bandScale.bandwidth() / 2;
        }
        return 0;
      })
      .attr('cy', (d: DataPoint) => yScale(d.value))
      .attr('r', this.radius)
      .attr('fill', this.color)
      .attr('opacity', 0.7)
      .on('mouseover', this.mouseoverHandler)
      .on('mouseout', this.mouseoutHandler);
  }

  update(data: DataPoint[], scales: ChartScales): void {
    this.data = data;

    const xScale = scales.x as any;
    const yScale = scales.y;

    if (this.circles) {
      this.circles
        .data(data, (d: DataPoint) => (d.id ? d.id.toString() : Math.random().toString()))
        .join('circle')
        .transition()
        .duration(750)
        .attr('cx', (d: DataPoint) => {
          if (d.timestamp) {
            return xScale(d.timestamp) as number;
          } else if (d.category) {
            const bandScale = xScale as d3.ScaleBand<string>;
            return (bandScale(d.category) || 0) + bandScale.bandwidth() / 2;
          }
          return 0;
        })
        .attr('cy', (d: DataPoint) => yScale(d.value));
    }
  }

  destroy(): void {
    if (this.circles) {
      this.circles.remove();
      this.circles = null;
    }
  }

  getElements(): SVGElement[] {
    return this.circles ? Array.from(this.circles.nodes()) : [];
  }
}

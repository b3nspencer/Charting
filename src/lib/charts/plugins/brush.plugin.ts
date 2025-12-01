/**
 * Brush plugin for region selection functionality
 */

import * as d3 from 'd3';
import { IChart, IChartPlugin } from '../core/interfaces';
import { DashboardStateService } from '../core/services';

export class BrushPlugin implements IChartPlugin {
  readonly id = 'brush';
  private brush: any | null = null;
  private dashboardState: DashboardStateService;

  constructor(dashboardState: DashboardStateService) {
    this.dashboardState = dashboardState;
  }

  afterInit?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (!svg) return;

    this.brush = d3
      .brush<SVGGElement>()
      .on('brush', (event) => this.handleBrush(event));

    const g = d3
      .select(svg)
      .append('g')
      .attr('class', 'brush')
      .call(this.brush);
  }

  private handleBrush(event: d3.D3BrushEvent<SVGGElement>): void {
    // Handle brush selection
    if (event.selection) {
      const [[x0, y0], [x1, y1]] = event.selection as [[number, number], [number, number]];
      console.log('Brush selection:', { x0, y0, x1, y1 });
    }
  }

  beforeDestroy?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (svg) {
      d3.select(svg).selectAll('.brush').remove();
      this.brush = null;
    }
  }
}

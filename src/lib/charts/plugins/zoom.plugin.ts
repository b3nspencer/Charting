/**
 * Zoom plugin for interactive zoom functionality
 */

import * as d3 from 'd3';
import { IChart, IChartPlugin, ZoomTransform } from '../core/interfaces';
import { DashboardStateService } from '../core/services';

export class ZoomPlugin implements IChartPlugin {
  readonly id = 'zoom';
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  private dashboardState: DashboardStateService;

  constructor(dashboardState: DashboardStateService) {
    this.dashboardState = dashboardState;
  }

  afterInit?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (!svg) return;

    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([
        [0, 0],
        [800, 400],
      ])
      .on('zoom', (event) => this.handleZoom(event));

    d3.select(svg).call(this.zoom);
  }

  private handleZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
    const transform = event.transform;
    this.dashboardState.updateZoomTransform(transform.x, transform.y, transform.k);
  }

  beforeDestroy?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (svg && this.zoom) {
      d3.select(svg).on('.zoom', null);
      this.zoom = null;
    }
  }
}

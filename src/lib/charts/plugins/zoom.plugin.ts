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
  private chartGroup: d3.Selection<SVGGElement, unknown, any, any> | null = null;
  private originalTransform: string = '';

  constructor(dashboardState: DashboardStateService) {
    this.dashboardState = dashboardState;
  }

  afterInit?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (!svg) return;

    // Get SVG dimensions
    const width = svg.getAttribute('viewBox')?.split(' ')[2] || '800';
    const height = svg.getAttribute('viewBox')?.split(' ')[3] || '400';
    const chartWidth = parseFloat(width);
    const chartHeight = parseFloat(height);

    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 8])
      .translateExtent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .on('zoom', (event) => this.handleZoom(event));

    const svgSelection = d3.select(svg);

    // Find the chart group - it's the first g element added (not the axis groups)
    const allGroups = svgSelection.selectAll('g');
    if (allGroups.size() > 0) {
      // The main chart group is typically the first one (before axis groups)
      const firstGroup = allGroups.nodes()[0] as SVGGElement;
      if (firstGroup) {
        this.chartGroup = d3.select(firstGroup) as any;
        // Store the original transform (includes margins)
        this.originalTransform = firstGroup.getAttribute('transform') || '';
      }
    }

    // Apply zoom to SVG
    svgSelection.call(this.zoom);
  }

  private handleZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
    const transform = event.transform;

    // Apply transform to chart group if available
    // Compose zoom transform with original margin transform
    if (this.chartGroup) {
      // Extract the original margin translation from transform string
      // Format: "translate(x,y)"
      const marginMatch = this.originalTransform.match(/translate\(([\d.]+),\s*([\d.]+)\)/);
      if (marginMatch) {
        const marginX = parseFloat(marginMatch[1]);
        const marginY = parseFloat(marginMatch[2]);
        // Apply margin translation, then zoom
        this.chartGroup.attr(
          'transform',
          `translate(${marginX},${marginY})${transform.toString()}`
        );
      } else {
        // Fallback if no margin transform found
        this.chartGroup.attr('transform', transform.toString());
      }
    }

    // Update dashboard state
    this.dashboardState.updateZoomTransform(transform.x, transform.y, transform.k);
  }

  beforeDestroy?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (svg && this.zoom) {
      d3.select(svg).on('.zoom', null);
      this.zoom = null;
    }
    this.chartGroup = null;
  }
}

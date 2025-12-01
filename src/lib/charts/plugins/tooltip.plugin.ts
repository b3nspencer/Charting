/**
 * Tooltip plugin for showing data on hover
 */

import * as d3 from 'd3';
import { IChart, IChartPlugin } from '../core/interfaces';

export class TooltipPlugin implements IChartPlugin {
  readonly id = 'tooltip';

  afterInit?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (!svg) return;

    // Add mousemove handler for tooltips
    d3.select(svg).on('mousemove', function () {
      const [x, y] = d3.pointer(event as MouseEvent, this);
      // Find nearest data point and show tooltip
      // Implementation would depend on specific chart rendering
    });
  }

  beforeDestroy?(chart: IChart): void {
    const svg = chart.getSvgElement();
    if (svg) {
      d3.select(svg).on('mousemove', null);
    }
  }
}

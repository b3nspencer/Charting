/**
 * Grid component for displaying grid lines
 */

import { Component, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import * as d3 from 'd3';

interface GridConfig {
  horizontalLines?: boolean;
  verticalLines?: boolean;
  tickCount?: number;
  color?: string;
  opacity?: number;
}

@Component({
  selector: 'app-grid',
  standalone: true,
  template: `<g #gridGroup class="grid"></g>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [NO_ERRORS_SCHEMA],
})
export class GridComponent implements AfterViewInit {
  @ViewChild('gridGroup') gridGroup!: ElementRef<SVGGElement>;
  @Input() config: GridConfig = {
    horizontalLines: true,
    verticalLines: false,
    tickCount: 5,
    color: '#e0e0e0',
    opacity: 0.3,
  };
  @Input() xScale!: d3.AxisScale<any>;
  @Input() yScale!: d3.ScaleLinear<number, number>;
  @Input() width = 400;
  @Input() height = 300;

  ngAfterViewInit(): void {
    this.drawGrid();
  }

  private drawGrid(): void {
    if (!this.gridGroup || !this.yScale || !this.xScale) return;

    const group = d3.select(this.gridGroup.nativeElement);
    const color = this.config.color || '#e0e0e0';
    const opacity = this.config.opacity || 0.3;

    // Draw horizontal grid lines
    if (this.config.horizontalLines) {
      const yTicks = this.yScale.ticks(this.config.tickCount || 5);
      group
        .selectAll('.horizontal-line')
        .data(yTicks)
        .join('line')
        .attr('class', 'horizontal-line')
        .attr('x1', 0)
        .attr('x2', this.width)
        .attr('y1', (d) => this.yScale(d))
        .attr('y2', (d) => this.yScale(d))
        .attr('stroke', color)
        .attr('stroke-opacity', opacity)
        .attr('stroke-dasharray', '4,4');
    }

    // Draw vertical grid lines
    if (this.config.verticalLines) {
      // For simplicity, only implemented for linear scales
      if ('ticks' in this.xScale) {
        const xTicks = (this.xScale as any).ticks(this.config.tickCount || 5);
        group
          .selectAll('.vertical-line')
          .data(xTicks)
          .join('line')
          .attr('class', 'vertical-line')
          .attr('x1', (d) => this.xScale(d) as number)
          .attr('x2', (d) => this.xScale(d) as number)
          .attr('y1', 0)
          .attr('y2', this.height)
          .attr('stroke', color)
          .attr('stroke-opacity', opacity)
          .attr('stroke-dasharray', '4,4');
      }
    }
  }
}

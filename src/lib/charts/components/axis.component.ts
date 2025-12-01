/**
 * Axis component for rendering D3 axes
 */

import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';
import { AxisConfig } from '../core/interfaces';

@Component({
  selector: 'app-axis',
  standalone: true,
  template: `<g #axisGroup class="axis"></g>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AxisComponent implements AfterViewInit, OnDestroy {
  @ViewChild('axisGroup') axisGroup!: ElementRef<SVGGElement>;
  @Input() config!: AxisConfig;

  private axis: d3.Axis<any> | null = null;

  ngAfterViewInit(): void {
    if (!this.config) return;

    const scale = this.config.scale;
    let axis: d3.Axis<any>;

    switch (this.config.orientation) {
      case 'top':
        axis = d3.axisTop(scale);
        break;
      case 'right':
        axis = d3.axisRight(scale);
        break;
      case 'bottom':
        axis = d3.axisBottom(scale);
        break;
      case 'left':
      default:
        axis = d3.axisLeft(scale);
    }

    if (this.config.ticks) {
      axis.ticks(this.config.ticks);
    }

    if (this.config.tickFormat) {
      axis.tickFormat(this.config.tickFormat);
    }

    this.axis = axis;
    d3.select(this.axisGroup.nativeElement).call(axis);

    if (this.config.label) {
      d3.select(this.axisGroup.nativeElement)
        .append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .text(this.config.label);
    }
  }

  ngOnDestroy(): void {
    if (this.axisGroup && this.axisGroup.nativeElement) {
      d3.select(this.axisGroup.nativeElement).selectAll('*').remove();
    }
  }
}

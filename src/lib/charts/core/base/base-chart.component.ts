/**
 * Abstract base component for all chart implementations
 * Provides signal-based state management and D3 rendering foundation
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import * as d3 from 'd3';
import { IChart, ChartConfig, ChartScales, DataPoint, Margin } from '../interfaces';

@Component({
  selector: 'app-base-chart',
  standalone: true,
  template: `<svg
    #chartSvg
    [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
    class="chart-svg"
  ></svg>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .chart-svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class BaseChartComponent
  implements AfterViewInit, OnDestroy, IChart
{
  @ViewChild('chartSvg') chartSvg!: ElementRef<SVGSVGElement>;

  // State signals
  readonly width = signal(800);
  readonly height = signal(400);
  readonly margin = signal<Margin>({
    top: 20,
    right: 30,
    bottom: 40,
    left: 50,
  });

  readonly chartData = signal<DataPoint[]>([]);
  readonly chartConfig = signal<ChartConfig>({
    type: 'line',
  });
  readonly selectedPoint = signal<DataPoint | null>(null);

  // Computed signals
  readonly innerWidth = computed(
    () => this.width() - this.margin().left - this.margin().right
  );
  readonly innerHeight = computed(
    () => this.height() - this.margin().top - this.margin().bottom
  );

  // Internal state
  readonly id = `chart-${Math.random().toString(36).substr(2, 9)}`;
  protected viewInitialized = false;
  protected chartGroup: d3.Selection<SVGGElement, unknown, any, any> | null =
    null;

  get config(): ChartConfig {
    return this.chartConfig();
  }

  get data(): DataPoint[] {
    return this.chartData();
  }

  constructor() {
    // Create effect to trigger rendering when dependencies change
    effect(() => {
      if (this.viewInitialized) {
        const data = this.chartData();
        const config = this.chartConfig();
        const innerWidth = this.innerWidth();
        const innerHeight = this.innerHeight();

        if (data.length > 0 && this.chartGroup) {
          this.updateChart();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.initializeChart();
  }

  ngOnDestroy(): void {
    this.viewInitialized = false;
    this.cleanupChart();
  }

  private initializeChart(): void {
    const svg = d3.select(this.chartSvg.nativeElement);

    // Create main group with margins
    this.chartGroup = svg
      .append('g')
      .attr('transform', `translate(${this.margin().left},${this.margin().top})`);

    this.createChart();
  }

  protected abstract createChart(): void;

  protected abstract updateChart(): void;

  /**
   * Get the computed scales for the chart
   */
  protected getScales(): ChartScales {
    const data = this.chartData();
    if (data.length === 0) {
      return {
        x: d3.scaleLinear().range([0, this.innerWidth()]),
        y: d3.scaleLinear().range([this.innerHeight(), 0]),
        innerWidth: this.innerWidth(),
        innerHeight: this.innerHeight(),
      };
    }

    // Determine scale types based on data
    const hasTimestamp = data.some((d) => d.timestamp);
    const hasCategory = data.some((d) => d.category);

    let xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> | d3.ScaleBand<string>;

    if (hasTimestamp) {
      const timestamps = data.map((d) => d.timestamp!);
      xScale = d3
        .scaleTime()
        .domain([Math.min(...(timestamps as any)), Math.max(...(timestamps as any))])
        .range([0, this.innerWidth()]);
    } else if (hasCategory) {
      const categories = data.map((d) => d.category!);
      xScale = d3
        .scaleBand()
        .domain(categories)
        .range([0, this.innerWidth()])
        .padding(0.1);
    } else {
      const indices = data.map((_, i) => i);
      xScale = d3
        .scaleLinear()
        .domain([0, data.length - 1])
        .range([0, this.innerWidth()]);
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([this.innerHeight(), 0]);

    return {
      x: xScale,
      y: yScale,
      innerWidth: this.innerWidth(),
      innerHeight: this.innerHeight(),
    };
  }

  /**
   * Initialize chart implementation
   */
  initialize(config: ChartConfig, data: DataPoint[]): void {
    this.chartConfig.set(config);
    this.chartData.set(data);
  }

  /**
   * Update chart data
   */
  updateData(data: DataPoint[]): void {
    this.chartData.set(data);
  }

  /**
   * Update chart configuration
   */
  updateConfig(config: Partial<ChartConfig>): void {
    this.chartConfig.update((current) => ({ ...current, ...config }));
  }

  /**
   * Render the chart
   */
  render(): void {
    if (this.viewInitialized) {
      this.updateChart();
    }
  }

  /**
   * Resize the chart
   */
  resize(width: number, height: number): void {
    this.width.set(width);
    this.height.set(height);
  }

  /**
   * Get the SVG element
   */
  getSvgElement(): SVGSVGElement | null {
    return this.chartSvg?.nativeElement || null;
  }

  /**
   * Destroy the chart
   */
  destroy(): void {
    this.cleanupChart();
  }

  /**
   * Cleanup method to remove D3 elements and listeners
   */
  protected cleanupChart(): void {
    if (this.chartGroup) {
      this.chartGroup.selectAll('*').remove();
      this.chartGroup = null;
    }
  }
}

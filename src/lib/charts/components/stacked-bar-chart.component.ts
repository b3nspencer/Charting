/**
 * Stacked bar chart component
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { BaseChartComponent } from '../core/base';
import { StackedBarChartStrategy } from '../strategies';
import { ChartConfig, DataPoint } from '../core/interfaces';

interface StackedDataPoint extends DataPoint {
  [key: string]: any;
}

@Component({
  selector: 'app-stacked-bar-chart',
  standalone: true,
  template: `<svg
    #chartSvg
    [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
    class="stacked-bar-chart-svg"
  ></svg>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .stacked-bar-chart-svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackedBarChartComponent extends BaseChartComponent {
  @Input() set inputData(value: DataPoint[]) {
    this.updateData(value);
  }

  @Input() set inputConfig(value: Partial<ChartConfig>) {
    this.updateConfig(value);
  }

  @Input() set stackKeys(keys: string[]) {
    if (this.strategy) {
      this.strategy.setKeys(keys);
    }
  }

  @Input() set stackColors(colors: string[]) {
    if (this.strategy) {
      this.strategy.setColors(colors);
    }
  }

  private strategy: StackedBarChartStrategy | null = null;

  protected createChart(): void {
    const config = this.chartConfig();
    const keys = (config as any).stackKeys || [];
    const colors = (config as any).stackColors || [];

    this.strategy = new StackedBarChartStrategy(keys, colors);

    const scales = this.getScales();
    if (this.chartGroup && this.chartData().length > 0) {
      this.strategy.render(this.chartGroup.node()!, this.chartData() as StackedDataPoint[], scales);
    }
  }

  protected updateChart(): void {
    if (!this.strategy || !this.chartGroup) return;

    const scales = this.getScales();
    this.strategy.update(this.chartData() as StackedDataPoint[], scales);
  }

  protected override cleanupChart(): void {
    if (this.strategy) {
      this.strategy.destroy();
      this.strategy = null;
    }
    super.cleanupChart();
  }
}

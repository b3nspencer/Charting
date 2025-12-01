/**
 * Bar chart component
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { BaseChartComponent } from '../core/base';
import { BarChartStrategy } from '../strategies';
import { ChartConfig, DataPoint } from '../core/interfaces';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `<svg
    #chartSvg
    [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
    class="bar-chart-svg"
  ></svg>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .bar-chart-svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent extends BaseChartComponent {
  @Input() set data(value: DataPoint[]) {
    this.chartData.set(value);
  }

  @Input() set config(value: Partial<ChartConfig>) {
    this.chartConfig.update((current) => ({ ...current, ...value }));
  }

  private strategy: BarChartStrategy | null = null;

  protected createChart(): void {
    const config = this.chartConfig();
    const color = (config as any).color || '#1f77b4';

    this.strategy = new BarChartStrategy(color);

    const scales = this.getScales();
    if (this.chartGroup && this.chartData().length > 0) {
      this.strategy.render(this.chartGroup.node()!, this.chartData(), scales);
    }
  }

  protected updateChart(): void {
    if (!this.strategy || !this.chartGroup) return;

    const scales = this.getScales();
    this.strategy.update(this.chartData(), scales);
  }

  protected cleanupChart(): void {
    if (this.strategy) {
      this.strategy.destroy();
      this.strategy = null;
    }
    super.cleanupChart();
  }
}

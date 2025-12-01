/**
 * Area chart component
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { BaseChartComponent } from '../core/base';
import { AreaChartStrategy } from '../strategies';
import { ChartConfig, DataPoint } from '../core/interfaces';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  template: `<svg
    #chartSvg
    [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
    class="area-chart-svg"
  ></svg>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .area-chart-svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaChartComponent extends BaseChartComponent {
  @Input() set data(value: DataPoint[]) {
    this.chartData.set(value);
  }

  @Input() set config(value: Partial<ChartConfig>) {
    this.chartConfig.update((current) => ({ ...current, ...value }));
  }

  private strategy: AreaChartStrategy | null = null;

  protected createChart(): void {
    const config = this.chartConfig();
    const color = (config as any).color || 'steelblue';
    const opacity = (config as any).opacity || 0.6;

    this.strategy = new AreaChartStrategy(color, opacity);

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

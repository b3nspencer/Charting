/**
 * Line chart component
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { BaseChartComponent } from '../core/base';
import { LineChartStrategy } from '../strategies';
import { ChartConfig, DataPoint } from '../core/interfaces';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `<svg
    #chartSvg
    [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
    class="line-chart-svg"
  ></svg>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .line-chart-svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent extends BaseChartComponent {
  @Input() set inputData(value: DataPoint[]) {
    this.updateData(value);
  }

  @Input() set inputConfig(value: Partial<ChartConfig>) {
    this.updateConfig(value);
  }

  private strategy: LineChartStrategy | null = null;

  protected createChart(): void {
    const config = this.chartConfig();
    const color = (config as any).color || 'steelblue';
    const strokeWidth = (config as any).strokeWidth || 2;

    this.strategy = new LineChartStrategy(color, strokeWidth);

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

  protected override cleanupChart(): void {
    if (this.strategy) {
      this.strategy.destroy();
      this.strategy = null;
    }
    super.cleanupChart();
  }
}

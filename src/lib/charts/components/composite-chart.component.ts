/**
 * Composite chart component that renders multiple strategies on the same chart
 * Allows overlaying different chart types (e.g., line on stacked bars)
 */

import { Component, Input, ChangeDetectionStrategy, signal, AfterViewInit } from '@angular/core';
import { BaseChartComponent } from '../core/base';
import { IChartStrategy } from '../core/interfaces';
import { ChartConfig, DataPoint } from '../core/interfaces';

@Component({
  selector: 'app-composite-chart',
  standalone: true,
  template: `<svg
    #chartSvg
    [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
    class="composite-chart-svg"
  ></svg>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .composite-chart-svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompositeChartComponent extends BaseChartComponent {
  @Input() set inputChartData(value: DataPoint[]) {
    this.updateData(value);
  }

  @Input() set inputChartConfig(value: Partial<ChartConfig>) {
    this.updateConfig(value);
  }

  @Input() set overlayData(value: DataPoint[]) {
    this.overlayDataSignal.set(value);
  }

  @Input() set strategies(value: IChartStrategy[]) {
    this.strategiesSignal.set(value);
  }

  @Input() set plugins(value: any[]) {
    if (value && value.length > 0 && this.viewInitialized) {
      this.registerPlugins(value);
    } else if (value && value.length > 0) {
      // Store for later registration if not yet initialized
      this.pendingPlugins = value;
    }
  }

  private strategiesSignal = signal<IChartStrategy[]>([]);
  private overlayDataSignal = signal<DataPoint[]>([]);
  private pendingPlugins: any[] = [];

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    // Register any pending plugins after view is initialized
    if (this.pendingPlugins.length > 0) {
      this.registerPlugins(this.pendingPlugins);
      this.pendingPlugins = [];
    }
  }

  protected createChart(): void {
    const strategies = this.strategiesSignal();
    const scales = this.getScales();
    const mainData = this.chartData();
    const overlayData = this.overlayDataSignal();

    if (this.chartGroup && mainData.length > 0 && strategies.length > 0) {
      // Render each strategy
      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        if (i === 0) {
          // First strategy gets main data
          (strategy as any).render(this.chartGroup.node()!, mainData, scales);
        } else {
          // Subsequent strategies get overlay data, with main data as reference
          if (overlayData.length > 0) {
            (strategy as any).render(this.chartGroup.node()!, overlayData, scales, mainData);
          }
        }
      }
    }
  }

  protected updateChart(): void {
    const strategies = this.strategiesSignal();
    if (!strategies.length || !this.chartGroup) return;

    const scales = this.getScales();
    const mainData = this.chartData();
    const overlayData = this.overlayDataSignal();

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      if (i === 0) {
        (strategy as any).update(mainData, scales);
      } else {
        if (overlayData.length > 0) {
          (strategy as any).update(overlayData, scales, mainData);
        }
      }
    }
  }

  protected override cleanupChart(): void {
    const strategies = this.strategiesSignal();
    for (const strategy of strategies) {
      strategy.destroy();
    }
    super.cleanupChart();
  }
}

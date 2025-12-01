/**
 * Chart container component wrapping a chart with supporting UI elements
 */

import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineChartComponent } from './line-chart.component';
import { BarChartComponent } from './bar-chart.component';
import { ScatterChartComponent } from './scatter-chart.component';
import { AreaChartComponent } from './area-chart.component';
import { LegendComponent } from './legend.component';
import { TooltipComponent } from './tooltip.component';
import { ChartConfig, DataPoint } from '../core/interfaces';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [
    CommonModule,
    LineChartComponent,
    BarChartComponent,
    ScatterChartComponent,
    AreaChartComponent,
    LegendComponent,
    TooltipComponent,
  ],
  template: `
    <div class="chart-container">
      <div class="chart-header" *ngIf="title">
        <h3>{{ title }}</h3>
      </div>

      <div class="chart-wrapper">
        <app-line-chart
          *ngIf="chartType() === 'line'"
          [data]="chartData()"
          [config]="chartConfig()"
        ></app-line-chart>

        <app-bar-chart
          *ngIf="chartType() === 'bar'"
          [data]="chartData()"
          [config]="chartConfig()"
        ></app-bar-chart>

        <app-scatter-chart
          *ngIf="chartType() === 'scatter'"
          [data]="chartData()"
          [config]="chartConfig()"
        ></app-scatter-chart>

        <app-area-chart
          *ngIf="chartType() === 'area'"
          [data]="chartData()"
          [config]="chartConfig()"
        ></app-area-chart>
      </div>

      <app-legend
        *ngIf="showLegend && chartConfig().series"
        [series]="chartConfig().series"
        (seriesToggled)="onSeriesToggled($event)"
      ></app-legend>

      <app-tooltip
        *ngIf="tooltipData() && showTooltip"
        [data]="tooltipData()"
        [x]="tooltipX()"
        [y]="tooltipY()"
      ></app-tooltip>
    </div>
  `,
  styles: [
    `
      .chart-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }

      .chart-header {
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;
      }

      .chart-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .chart-wrapper {
        flex: 1;
        overflow: auto;
        position: relative;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartContainerComponent {
  @Input() title?: string;
  @Input() chartType = signal<'line' | 'bar' | 'scatter' | 'area'>('line');
  @Input() chartData = signal<DataPoint[]>([]);
  @Input() chartConfig = signal<ChartConfig>({ type: 'line' });
  @Input() showLegend = true;
  @Input() showTooltip = true;

  readonly tooltipData = signal<DataPoint | null>(null);
  readonly tooltipX = signal(0);
  readonly tooltipY = signal(0);

  onSeriesToggled(seriesId: string): void {
    // Handle series visibility toggle
    console.log('Series toggled:', seriesId);
  }
}

/**
 * Full-page chart detail view component
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChartContainerComponent } from '../lib/charts';
import { ChartDetailService, ChartDetail } from './chart-detail.service';

@Component({
  selector: 'app-chart-detail',
  standalone: true,
  imports: [CommonModule, ChartContainerComponent],
  template: `
    <div class="chart-detail-container" *ngIf="chartDetail">
      <div class="chart-detail-header">
        <button class="back-button" (click)="goBack()">
          <span>← Back to Dashboard</span>
        </button>
        <h1>{{ chartDetail.title }}</h1>
        <div class="spacer"></div>
      </div>

      <div class="chart-detail-content">
        <app-chart-container
          [inputChartType]="chartDetail.type"
          [inputChartData]="chartDetail.data"
          [inputChartConfig]="chartDetail.config"
          [showLegend]="true"
          [showTooltip]="true"
        ></app-chart-container>
      </div>

      <div class="chart-detail-footer">
        <p>Data Points: {{ chartDetail.data.length }}</p>
        <p>Chart Type: {{ chartDetail.type }}</p>
      </div>
    </div>

    <div class="empty-state" *ngIf="!chartDetail">
      <p>No chart selected. <a (click)="goBack()">Go back to dashboard</a></p>
    </div>
  `,
  styles: [
    `
      .chart-detail-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        background: #f5f5f5;
      }

      .chart-detail-header {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .back-button {
        padding: 8px 16px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;
      }

      .back-button:hover {
        background: #1976D2;
      }

      .chart-detail-header h1 {
        margin: 0;
        font-size: 24px;
        color: #333;
        flex: 1;
      }

      .spacer {
        flex: 0;
      }

      .chart-detail-content {
        flex: 1;
        padding: 20px;
        overflow: auto;
        background: white;
        margin: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .chart-detail-footer {
        padding: 20px;
        background: white;
        border-top: 1px solid #e0e0e0;
        text-align: center;
      }

      .chart-detail-footer p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .chart-detail-footer p:first-child {
        margin-bottom: 10px;
      }

      .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #f5f5f5;
        font-size: 18px;
        color: #666;
      }

      .empty-state a {
        color: #2196F3;
        text-decoration: underline;
        cursor: pointer;
        margin-left: 5px;
      }

      .empty-state a:hover {
        color: #1976D2;
      }
    `,
  ],
})
export class ChartDetailComponent implements OnInit {
  chartDetail: ChartDetail | null = null;

  constructor(
    private chartDetailService: ChartDetailService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chartDetail = this.chartDetailService.getChartDetail();
    if (!this.chartDetail) {
      this.goBack();
    }
  }

  goBack(): void {
    this.chartDetailService.clearChartDetail();
    this.router.navigate(['/']);
  }
}

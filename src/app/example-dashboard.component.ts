/**
 * Example dashboard component showcasing multiple synchronized charts
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChartContainerComponent, DataPoint, DashboardStateService } from '../lib/charts';
import { ChartDetailService } from './chart-detail.service';

@Component({
  selector: 'app-example-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartContainerComponent,
  ],
  template: `
    <div class="dashboard">
      <h1>Enterprise Charting Dashboard</h1>

      <div class="dashboard-grid">
        <div class="chart-tile" (click)="openChartDetail('revenue', 'Revenue Over Time', revenueChartType(), revenueData(), revenueConfig())">
          <app-chart-container
            title="Revenue Over Time"
            [inputChartType]="revenueChartType()"
            [inputChartData]="revenueData()"
            [inputChartConfig]="revenueConfig()"
            [showLegend]="true"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('category', 'Sales by Category', categoryChartType(), categoryData(), categoryConfig())">
          <app-chart-container
            title="Sales by Category"
            [inputChartType]="categoryChartType()"
            [inputChartData]="categoryData()"
            [inputChartConfig]="categoryConfig()"
            [showLegend]="false"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('scatter', 'Customer Correlation', scatterChartType(), scatterData(), scatterConfig())">
          <app-chart-container
            title="Customer Correlation"
            [inputChartType]="scatterChartType()"
            [inputChartData]="scatterData()"
            [inputChartConfig]="scatterConfig()"
            [showLegend]="false"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('area', 'Growth Trend', areaChartType(), areaData(), areaConfig())">
          <app-chart-container
            title="Growth Trend"
            [inputChartType]="areaChartType()"
            [inputChartData]="areaData()"
            [inputChartConfig]="areaConfig()"
            [showLegend]="true"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('bar', 'Monthly Performance', barChartType(), barData(), barConfig())">
          <app-chart-container
            title="Monthly Performance"
            [inputChartType]="barChartType()"
            [inputChartData]="barData()"
            [inputChartConfig]="barConfig()"
            [showLegend]="false"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('distribution', 'Market Distribution', distributionChartType(), distributionData(), distributionConfig())">
          <app-chart-container
            title="Market Distribution"
            [inputChartType]="distributionChartType()"
            [inputChartData]="distributionData()"
            [inputChartConfig]="distributionConfig()"
            [showLegend]="false"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('product', 'Product Sales', productChartType(), productData(), productConfig())">
          <app-chart-container
            title="Product Sales"
            [inputChartType]="productChartType()"
            [inputChartData]="productData()"
            [inputChartConfig]="productConfig()"
            [showLegend]="true"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('quarterly', 'Quarterly Results', quarterlyChartType(), quarterlyData(), quarterlyConfig())">
          <app-chart-container
            title="Quarterly Results"
            [inputChartType]="quarterlyChartType()"
            [inputChartData]="quarterlyData()"
            [inputChartConfig]="quarterlyConfig()"
            [showLegend]="false"
            [showTooltip]="true"
          ></app-chart-container>
        </div>

        <div class="chart-tile" (click)="openChartDetail('stackedbar', 'Revenue by Region', stackedBarChartType(), stackedBarData(), stackedBarConfig())">
          <app-chart-container
            title="Revenue by Region"
            [inputChartType]="stackedBarChartType()"
            [inputChartData]="stackedBarData()"
            [inputChartConfig]="stackedBarConfig()"
            [showLegend]="true"
            [showTooltip]="true"
          ></app-chart-container>
        </div>
      </div>

      <div class="dashboard-footer">
        <p>Selected Point: {{ dashboardState.selectedDataPoint() ? dashboardState.selectedDataPoint()?.id : 'None' }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 20px;
        background: #f5f5f5;
        min-height: 100vh;
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }

      .chart-tile {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        height: 400px;
        overflow: hidden;
        cursor: pointer;
        transition: box-shadow 0.2s, transform 0.2s;
      }

      .chart-tile:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }

      .dashboard-footer {
        text-align: center;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .dashboard-footer p {
        margin: 0;
        color: #666;
      }
    `,
  ],
})
export class ExampleDashboardComponent implements OnInit {
  constructor(
    readonly dashboardState: DashboardStateService,
    private router: Router,
    private chartDetailService: ChartDetailService
  ) {}

  // Chart types
  revenueChartType = signal<'line'>('line');
  categoryChartType = signal<'bar'>('bar');
  scatterChartType = signal<'scatter'>('scatter');
  areaChartType = signal<'area'>('area');
  barChartType = signal<'bar'>('bar');
  distributionChartType = signal<'line'>('line');
  productChartType = signal<'bar'>('bar');
  quarterlyChartType = signal<'area'>('area');
  stackedBarChartType = signal<'stacked-bar'>('stacked-bar');

  // Data signals
  revenueData = signal<DataPoint[]>([]);
  categoryData = signal<DataPoint[]>([]);
  scatterData = signal<DataPoint[]>([]);
  areaData = signal<DataPoint[]>([]);
  barData = signal<DataPoint[]>([]);
  distributionData = signal<DataPoint[]>([]);
  productData = signal<DataPoint[]>([]);
  quarterlyData = signal<DataPoint[]>([]);
  stackedBarData = signal<DataPoint[]>([]);

  // Config signals
  revenueConfig = signal<any>({
    type: 'line',
    color: '#2196F3',
    strokeWidth: 2,
  });
  categoryConfig = signal<any>({
    type: 'bar',
    color: '#4CAF50',
  });
  scatterConfig = signal<any>({
    type: 'scatter',
    color: '#FF9800',
  });
  areaConfig = signal<any>({
    type: 'area',
    color: '#9C27B0',
    opacity: 0.6,
  });
  barConfig = signal<any>({
    type: 'bar',
    color: '#F44336',
  });
  distributionConfig = signal<any>({
    type: 'line',
    color: '#00BCD4',
  });
  productConfig = signal<any>({
    type: 'bar',
    color: '#3F51B5',
  });
  quarterlyConfig = signal<any>({
    type: 'area',
    color: '#8BC34A',
    opacity: 0.6,
  });
  stackedBarConfig = signal<any>({
    type: 'stacked-bar',
    stackKeys: ['North', 'South', 'East', 'West'],
    stackColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
  });

  ngOnInit(): void {
    this.generateSampleData();
  }

  private generateSampleData(): void {
    // Generate revenue data
    const revenueData = Array.from({ length: 30 }, (_, i) => ({
      id: `revenue-${i}`,
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      value: Math.random() * 10000 + 5000,
    }));
    this.revenueData.set(revenueData);

    // Generate category data
    const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys'];
    const categoryData = categories.map((cat, i) => ({
      id: `cat-${i}`,
      category: cat,
      value: Math.random() * 5000 + 1000,
    }));
    this.categoryData.set(categoryData);

    // Generate scatter data
    const scatterData = Array.from({ length: 50 }, (_, i) => ({
      id: `scatter-${i}`,
      value: Math.random() * 100,
    }));
    this.scatterData.set(scatterData);

    // Generate area data
    const areaData = Array.from({ length: 12 }, (_, i) => ({
      id: `area-${i}`,
      timestamp: new Date(2024, i, 1),
      value: Math.random() * 50 + 20,
    }));
    this.areaData.set(areaData);

    // Generate bar data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const barData = months.map((m, i) => ({
      id: `bar-${i}`,
      category: m,
      value: Math.random() * 8000 + 2000,
    }));
    this.barData.set(barData);

    // Generate distribution data
    const distributionData = Array.from({ length: 25 }, (_, i) => ({
      id: `dist-${i}`,
      timestamp: new Date(Date.now() - (25 - i) * 7 * 24 * 60 * 60 * 1000),
      value: Math.sin(i / 5) * 50 + 50,
    }));
    this.distributionData.set(distributionData);

    // Generate product data
    const products = ['Product A', 'Product B', 'Product C', 'Product D'];
    const productData = products.map((p, i) => ({
      id: `prod-${i}`,
      category: p,
      value: Math.random() * 3000 + 500,
    }));
    this.productData.set(productData);

    // Generate quarterly data
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterlyData = quarters.map((q, i) => ({
      id: `quarter-${i}`,
      timestamp: new Date(2024, i * 3, 1),
      value: Math.random() * 40 + 10,
    }));
    this.quarterlyData.set(quarterlyData);

    // Generate stacked bar data
    const stackedBarData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
      const north = Math.random() * 5000 + 2000;
      const south = Math.random() * 4000 + 1500;
      const east = Math.random() * 6000 + 2500;
      const west = Math.random() * 3500 + 1000;
      return {
        id: `stacked-${i}`,
        category: month,
        value: north + south + east + west,
        North: north,
        South: south,
        East: east,
        West: west,
      };
    });
    this.stackedBarData.set(stackedBarData as any);
  }

  openChartDetail(
    id: string,
    title: string,
    type: 'line' | 'bar' | 'scatter' | 'area' | 'stacked-bar',
    data: DataPoint[],
    config: any
  ): void {
    this.chartDetailService.setChartDetail({
      id,
      title,
      type,
      data,
      config,
    });
    this.router.navigate(['/chart', id]);
  }
}

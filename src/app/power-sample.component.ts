/**
 * Complex power consumption and generation sample
 * Shows forecast power consumption (line overlay) on power generation capacity by fuel type (stacked bars)
 * Half-hourly consumption data and monthly generation data spanning 2 years
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompositeChartComponent, DataPoint } from '../lib/charts';
import { StackedBarChartStrategy, ConsumptionLineStrategy } from '../lib/charts/strategies';
import { DashboardStateService } from '../lib/charts/core/services';
import { ZoomPlugin } from '../lib/charts/plugins/zoom.plugin';

@Component({
  selector: 'app-power-sample',
  standalone: true,
  imports: [CommonModule, CompositeChartComponent],
  template: `
    <div class="power-sample-container">
      <h1>Power Grid Analytics</h1>
      <p class="subtitle">Forecast Power Consumption Overlay on Generation Capacity by Fuel Type</p>

      <div class="power-chart-wrapper">
        <app-composite-chart
          [inputChartData]="generationData()"
          [inputChartConfig]="chartConfig()"
          [overlayData]="consumptionData()"
          [strategies]="strategies()"
          [plugins]="plugins()"
        ></app-composite-chart>
      </div>

      <div class="power-stats">
        <div class="stat-card">
          <h3>Total Consumption Data Points</h3>
          <p>{{ consumptionData().length }}</p>
        </div>
        <div class="stat-card">
          <h3>Generation Capacity Data Points</h3>
          <p>{{ generationData().length }}</p>
        </div>
        <div class="stat-card">
          <h3>Data Granularity</h3>
          <p>Consumption: Half-hourly (30 min) | Generation: Monthly</p>
        </div>
        <div class="stat-card">
          <h3>Time Span</h3>
          <p>24 months (2 years)</p>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item">
          <span class="legend-bar"></span>
          <span>Power Generation Capacity (stacked by fuel type)</span>
        </div>
        <div class="legend-item">
          <span class="legend-line"></span>
          <span>Forecast Power Consumption</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .power-sample-container {
        padding: 20px;
        background: #f8f9fa;
        min-height: 100vh;
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 10px;
        font-size: 28px;
      }

      .subtitle {
        text-align: center;
        color: #666;
        margin-bottom: 20px;
        font-size: 14px;
      }

      .power-chart-wrapper {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        height: 600px;
        overflow: hidden;
        margin-bottom: 30px;
        border-left: 4px solid #FF9800;
      }

      .power-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      .stat-card h3 {
        margin: 0 0 10px 0;
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        font-weight: 500;
      }

      .stat-card p {
        margin: 0;
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .legend {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 40px;
        flex-wrap: wrap;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: #333;
      }

      .legend-bar {
        width: 20px;
        height: 15px;
        background: linear-gradient(
          to right,
          #FFD700 0%,
          #363636 16.66%,
          #FF6B6B 33.33%,
          #4ECDC4 50%,
          #FFD93D 66.66%,
          #45B7D1 100%
        );
      }

      .legend-line {
        width: 20px;
        height: 3px;
        background: #2196F3;
      }
    `,
  ],
})
export class PowerSampleComponent implements OnInit {
  private dashboardState = inject(DashboardStateService);

  // Data signals
  consumptionData = signal<DataPoint[]>([]);
  generationData = signal<DataPoint[]>([]);
  strategies = signal<any[]>([]);
  plugins = signal<any[]>([]);

  // Config signal
  chartConfig = signal<any>({
    type: 'composite',
    stackKeys: ['Nuclear', 'Coal', 'Natural Gas', 'Wind', 'Solar', 'Hydro'],
    stackColors: ['#FFD700', '#363636', '#FF6B6B', '#4ECDC4', '#FFD93D', '#45B7D1'],
  });

  ngOnInit(): void {
    this.generatePowerData();
    this.initializeStrategies();
    this.initializePlugins();
  }

  private generatePowerData(): void {
    // Generate consumption data - half-hourly for 2 years (17520 data points)
    const consumptionData = this.generateConsumptionTimeSeries();
    this.consumptionData.set(consumptionData);

    // Generate generation data - aggregated by month (24 data points for 2 years)
    const generationData = this.generateGenerationData();
    this.generationData.set(generationData);
  }

  private initializeStrategies(): void {
    // Create stacked bar strategy for generation capacity
    const stackedBarStrategy = new StackedBarChartStrategy(
      this.chartConfig().stackKeys,
      this.chartConfig().stackColors
    );

    // Create consumption line strategy for overlay
    const consumptionLineStrategy = new ConsumptionLineStrategy('#2196F3', 3);

    // Set strategies array
    this.strategies.set([stackedBarStrategy, consumptionLineStrategy]);
  }

  private initializePlugins(): void {
    // Create zoom plugin for interactive zoom/pan functionality
    const zoomPlugin = new ZoomPlugin(this.dashboardState);

    // Set plugins array
    this.plugins.set([zoomPlugin]);
  }

  private generateConsumptionTimeSeries(): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 2, now.getMonth(), 1);
    const currentDate = new Date(startDate);

    let index = 0;
    // Generate half-hourly data for 2 years (17520 points)
    while (currentDate <= now && index < 17520) {
      const dayOfYear = Math.floor(
        (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000
      );
      const hour = currentDate.getHours();
      const minute = currentDate.getMinutes();

      // Realistic power consumption pattern:
      // - Seasonal variation (higher in winter, lower in summer)
      // - Daily pattern (peak during daytime, low at night)
      // - Base load + variable load
      const seasonalFactor = Math.cos((dayOfYear / 365.25) * Math.PI * 2) * 0.3 + 1;
      const dailyFactor = Math.sin(((hour + minute / 60) / 24) * Math.PI * 2) * 0.4 + 1;
      const baseLoad = 6000; // MW
      const noise = (Math.random() - 0.5) * 500;

      const consumption = baseLoad * seasonalFactor * dailyFactor + noise;

      data.push({
        id: `consumption-${index}`,
        timestamp: new Date(currentDate),
        value: Math.max(3000, consumption), // Minimum 3000 MW
      });

      // Increment by 30 minutes
      currentDate.setMinutes(currentDate.getMinutes() + 30);
      index++;
    }

    return data;
  }

  private generateGenerationData(): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 2, now.getMonth(), 1);

    // Generate monthly data for 2 years (24 months)
    for (let monthOffset = 0; monthOffset < 24; monthOffset++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 15);
      const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      // Realistic power generation mix with seasonal variation
      const seasonFactor = Math.cos((monthOffset / 12) * Math.PI * 2);

      // Base capacities (MW)
      const nuclear = 2000; // Constant nuclear capacity
      const coal = 1500 + seasonFactor * 200; // Coal varies slightly
      const naturalGas = 1200 + seasonFactor * 300; // Natural gas increases in peak seasons
      const wind = 800 + Math.random() * 400; // Wind is variable
      const solar = 600 + Math.cos((monthOffset / 12) * Math.PI * 2) * 300; // Solar varies by season
      const hydro = 1000 + seasonFactor * 200; // Hydro varies seasonally

      data.push({
        id: `generation-${monthOffset}`,
        category: monthName,
        value: nuclear + coal + naturalGas + wind + solar + hydro,
        Nuclear: nuclear,
        Coal: coal,
        'Natural Gas': naturalGas,
        Wind: wind,
        Solar: solar,
        Hydro: hydro,
      });
    }

    return data;
  }
}

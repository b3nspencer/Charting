# Enterprise D3 Charting Framework for Angular 20

A comprehensive, extensible D3 charting framework built for Angular 20 with TypeScript, featuring reactive state management using Angular Signals, strategy pattern for chart flexibility, and a plugin system for extensibility.

## 🎯 Features

### Core Architecture
- **Angular 20 Standalone Components** - Tree-shakable, self-contained chart components
- **Angular Signals** - Reactive state management without NgRx complexity
- **Strategy Pattern** - Swappable chart rendering implementations
- **Plugin System** - Lifecycle hooks for extensible features
- **OnPush Change Detection** - Optimized for performance with 8+ simultaneous charts

### Chart Types
- **Line Chart** - Time-series and continuous data visualization
- **Bar Chart** - Categorical data comparison
- **Scatter Plot** - Correlation analysis and data distribution
- **Area Chart** - Cumulative data trends
- **Composite Chart** - Multiple chart types on single canvas

### Features
- Zoom and pan interactions with synchronized state
- Brush selection for region-based filtering
- Customizable tooltips and legends
- Multi-axis support for dual-metric visualization
- Responsive grid lines
- LTTB downsampling for 10,000+ data point rendering
- Canvas rendering for high-performance large datasets
- Real-time streaming data support
- Light/Dark/High-Contrast themes

## 📦 Project Structure

```
src/lib/charts/
├── core/
│   ├── interfaces/          # Type definitions and contracts
│   │   ├── types.ts
│   │   ├── chart.interface.ts
│   │   ├── strategy.interface.ts
│   │   ├── plugin.interface.ts
│   │   └── index.ts
│   ├── base/                # Base classes
│   │   ├── base-chart.component.ts
│   │   └── index.ts
│   ├── services/            # Core services
│   │   ├── chart-strategy-factory.service.ts
│   │   ├── plugin-registry.service.ts
│   │   ├── dashboard-state.service.ts
│   │   ├── chart-serialization.service.ts
│   │   └── index.ts
│   └── utils/               # Utility functions
│       ├── scale-factory.ts
│       ├── downsampling.ts
│       ├── color-utils.ts
│       ├── axis-utils.ts
│       └── index.ts
├── strategies/              # Chart rendering strategies
│   ├── line-chart.strategy.ts
│   ├── bar-chart.strategy.ts
│   ├── scatter-chart.strategy.ts
│   ├── area-chart.strategy.ts
│   ├── composite-chart.strategy.ts
│   └── index.ts
├── components/              # UI Components
│   ├── line-chart.component.ts
│   ├── bar-chart.component.ts
│   ├── scatter-chart.component.ts
│   ├── area-chart.component.ts
│   ├── axis.component.ts
│   ├── legend.component.ts
│   ├── tooltip.component.ts
│   ├── grid.component.ts
│   ├── chart-container.component.ts
│   └── index.ts
├── plugins/                 # Plugin implementations
│   ├── zoom.plugin.ts
│   ├── brush.plugin.ts
│   ├── tooltip.plugin.ts
│   └── index.ts
├── builders/                # Builder pattern services
│   ├── chart-builder.service.ts
│   └── index.ts
├── templates/               # Predefined chart templates
│   ├── templates.ts
│   └── index.ts
├── themes/                  # Theme system
│   ├── theme.ts
│   ├── theme.service.ts
│   └── index.ts
├── services/                # Additional services
│   ├── streaming-data.service.ts
│   ├── canvas-renderer.service.ts
│   └── index.ts
├── directives/              # Custom directives
│   ├── resizable.directive.ts
│   └── index.ts
└── index.ts                 # Public API
```

## 🚀 Getting Started

### Installation

```bash
npm install d3 @angular/cdk --save
```

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { LineChartComponent, DataPoint } from '@lib/charts';

@Component({
  selector: 'app-simple-chart',
  standalone: true,
  imports: [LineChartComponent],
  template: `
    <app-line-chart
      [data]="chartData"
      [config]="chartConfig"
    ></app-line-chart>
  `,
})
export class SimpleChartComponent {
  chartData: DataPoint[] = [
    { id: '1', timestamp: new Date('2024-01-01'), value: 100 },
    { id: '2', timestamp: new Date('2024-01-02'), value: 120 },
    { id: '3', timestamp: new Date('2024-01-03'), value: 110 },
  ];

  chartConfig = {
    type: 'line' as const,
    color: '#2196F3',
  };
}
```

### Using the Builder Pattern

```typescript
import { ChartBuilderService } from '@lib/charts';

const config = ChartBuilderService.start()
  .type('line')
  .dimensions(800, 400)
  .data(myData)
  .addYAxis({ id: 'revenue', position: 'left', label: 'Revenue' })
  .addSeries({
    type: 'line',
    dataKey: 'value',
    color: '#2196F3',
  })
  .enableZoom()
  .enableTooltip()
  .enableLegend()
  .build();
```

### Using Templates

```typescript
import { getTemplate } from '@lib/charts';

const salesTemplate = getTemplate('sales-overview');
// salesTemplate provides a pre-configured chart layout
```

### Synchronized Charts with Dashboard State

```typescript
import { DashboardStateService } from '@lib/charts';

export class DashboardComponent implements OnInit {
  constructor(private dashboardState: DashboardStateService) {}

  ngOnInit() {
    // Listen to shared state
    effect(() => {
      const selectedPoint = this.dashboardState.selectedDataPoint();
      console.log('Selected:', selectedPoint);
    });

    // Update shared state
    this.dashboardState.updateTimeRange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );
  }
}
```

## 📊 Data Format

All charts work with the `DataPoint` interface:

```typescript
interface DataPoint {
  id: string | number;           // Unique identifier
  timestamp?: Date;               // For time-series charts
  category?: string;              // For categorical charts
  value: number;                  // Primary data value
  [key: string]: any;            // Additional properties
}
```

## 🎨 Theming

```typescript
import { ThemeService, getTheme } from '@lib/charts';

constructor(private themeService: ThemeService) {}

switchToTheme(themeId: string) {
  // Available: 'light', 'dark', 'high-contrast'
  this.themeService.setTheme(themeId);
}
```

### Creating Custom Themes

```typescript
import { registerTheme } from '@lib/charts';

registerTheme({
  id: 'custom',
  name: 'Custom Theme',
  colors: {
    primary: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    background: '#FFFFFF',
    text: '#333333',
    border: '#E0E0E0',
    gridLines: '#F0F0F0',
  },
  fonts: {
    family: 'Inter, sans-serif',
    size: 12,
    weight: 400,
  },
});
```

## 🔌 Plugin System

### Using Built-in Plugins

```typescript
import { ZoomPlugin, BrushPlugin } from '@lib/charts';
import { PluginRegistry, DashboardStateService } from '@lib/charts';

constructor(
  private pluginRegistry: PluginRegistry,
  private dashboardState: DashboardStateService
) {
  this.pluginRegistry.register(new ZoomPlugin(dashboardState));
  this.pluginRegistry.register(new BrushPlugin(dashboardState));
}
```

### Creating Custom Plugins

```typescript
import { IChartPlugin, IChart } from '@lib/charts';

export class CustomPlugin implements IChartPlugin {
  readonly id = 'custom-plugin';

  beforeInit(chart: IChart): void {
    console.log('Initializing chart:', chart.id);
  }

  afterRender(chart: IChart): void {
    console.log('Chart rendered');
  }

  beforeDestroy(chart: IChart): void {
    console.log('Destroying chart');
  }
}
```

## 📈 High-Performance Data Rendering

### Downsampling Large Datasets

```typescript
import { lttbDownsample } from '@lib/charts';

// Reduce 10,000 points to 500 while preserving visual shape
const displayData = lttbDownsample(rawData, 500);
```

### Canvas Rendering for 10k+ Points

```typescript
import { CanvasRendererService } from '@lib/charts';

constructor(private canvasRenderer: CanvasRendererService) {}

renderLargeDataset(canvas: HTMLCanvasElement, data: DataPoint[]) {
  this.canvasRenderer.renderLineChart(canvas, data, scales);
}
```

## 🔄 Real-Time Data Streaming

```typescript
import { StreamingDataService } from '@lib/charts';

constructor(private streamingData: StreamingDataService) {}

addDataPoint(point: DataPoint) {
  this.streamingData.addDataPoint(point);
}

simulateStream() {
  this.streamingData.startSimulation(
    interval(1000) // Add new point every second
  );
}
```

## ✅ Testing

The framework includes comprehensive test suites:

```bash
npm run test
```

Test files include:
- Unit tests for utilities (downsampling, color operations)
- Service tests (serialization, plugin registry, builder)
- Integration tests for components

## 🛠 Utilities

### Color Utilities

```typescript
import {
  hexToRgb,
  rgbToHex,
  lightenColor,
  darkenColor,
  getContrastingTextColor,
} from '@lib/charts';

const lighter = lightenColor('#FF0000', 20);
const contrast = getContrastingTextColor('#FF0000');
```

### Axis Utilities

```typescript
import {
  formatNumber,
  formatCurrency,
  formatDate,
  createAxisFormatter,
} from '@lib/charts';

const formatter = createAxisFormatter('currency');
console.log(formatter(1000)); // "$1,000"
```

### Scale Factory

```typescript
import { createTimeScale, createLinearYScale } from '@lib/charts';

const xScale = createTimeScale(data, { width: 800, height: 400, margin });
const yScale = createLinearYScale(data, config, [0, 1000]);
```

## 📝 Configuration

### Chart Configuration

```typescript
interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'area' | 'composite';
  width?: number;              // Default: 800
  height?: number;             // Default: 400
  margin?: Margin;             // Custom margins
  data?: DataPoint[];          // Initial data
  yAxes?: YAxisConfig[];       // Multiple Y axes
  series?: SeriesConfig[];     // Data series
  features?: {
    zoom?: boolean;
    tooltip?: boolean;
    legend?: boolean;
    brush?: boolean;
  };
}
```

## 🚀 Performance

- **Initial Render**: < 100ms (target)
- **Interaction Response**: < 16ms @ 60fps (target)
- **Simultaneous Charts**: Supports 8+ charts
- **Data Points**: 10,000+ with canvas rendering
- **OnPush Change Detection**: Minimal change detection cycles

## 🔗 Integration Examples

### With HTTP Data

```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) {}

loadData() {
  this.http.get<DataPoint[]>('/api/data').subscribe((data) => {
    this.chartData.set(data);
  });
}
```

### With WebSocket Streaming

```typescript
import { webSocket } from 'rxjs/webSocket';

constructor(private streamingData: StreamingDataService) {}

connectWebSocket() {
  webSocket<DataPoint>('wss://api.example.com/stream').subscribe((point) => {
    this.streamingData.addDataPoint(point);
  });
}
```

## 📚 API Reference

### Core Components

- `BaseChartComponent` - Abstract base for all charts
- `LineChartComponent` - Line chart implementation
- `BarChartComponent` - Bar chart implementation
- `ScatterChartComponent` - Scatter plot implementation
- `AreaChartComponent` - Area chart implementation
- `ChartContainerComponent` - Wrapper with legend and tooltips

### Services

- `ChartStrategyFactory` - Create chart strategies
- `PluginRegistry` - Manage chart plugins
- `DashboardStateService` - Shared state for multiple charts
- `ChartSerializationService` - Save/load configurations
- `ThemeService` - Manage chart themes
- `StreamingDataService` - Handle real-time data
- `CanvasRendererService` - High-performance canvas rendering

### Builders

- `ChartBuilderService` - Fluent configuration builder

## 🐛 Troubleshooting

### Charts not rendering
- Ensure D3 is installed: `npm install d3`
- Check that data format matches `DataPoint` interface
- Verify SVG element is properly sized

### Performance issues with large datasets
- Use `lttbDownsample` to reduce point count
- Switch to `CanvasRendererService` for 10k+ points
- Enable zoom to focus on specific regions

### Plugin not working
- Register plugin before chart initialization
- Verify plugin implements `IChartPlugin` interface
- Check plugin lifecycle hooks are properly defined

## 📄 License

MIT

## 🙏 Contributing

Contributions are welcome! Please follow Angular style guide and include tests.

---

**Built with Angular 20 and D3.js**

For more information and examples, see the `ExampleDashboardComponent`.

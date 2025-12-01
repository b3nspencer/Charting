# Enterprise D3 charting framework architecture for Angular 20

Building an enterprise-grade, extensible D3 charting framework in Angular 20 requires a layered architecture combining **Angular Signals for reactive state management**, **Strategy and Factory patterns for chart type extensibility**, **Canvas rendering for 10k+ data point performance**, and **computed signals driving D3 updates through effects**. The recommended approach separates concerns into a core rendering layer, a plugin system for features like zoom and tooltips, and a configuration management layer with REST API serialization. This architecture can support both dynamic user-configured dashboards and reusable template-based charts while maintaining 60fps performance across 8+ simultaneous visualizations.

The foundational principle is a **hybrid declarative/programmatic approach**: use Angular's template syntax for simple SVG elements and component composition, while using D3 programmatically only for complex behaviors like axes, zoom, and brush interactions. This leverages Angular's efficient change detection while utilizing D3's specialized primitives where they excel.

## Angular 20 standalone components form the structural foundation

Angular 20's standalone components provide the ideal architecture for a modular charting library. Each chart type becomes a self-contained, tree-shakable unit with explicit dependencies declared via the `imports` array. The base chart component establishes shared patterns that all chart types inherit:

```typescript
@Component({
  selector: 'app-base-chart',
  standalone: true,
  template: `<svg #chartSvg [attr.viewBox]="'0 0 ' + width() + ' ' + height()"></svg>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class BaseChartComponent implements AfterViewInit, OnDestroy {
  protected ngZone = inject(NgZone);
  @ViewChild('chartSvg') chartSvg!: ElementRef<SVGSVGElement>;
  
  width = signal(800);
  height = signal(400);
  margin = signal({ top: 20, right: 30, bottom: 40, left: 50 });
  
  innerWidth = computed(() => this.width() - this.margin().left - this.margin().right);
  innerHeight = computed(() => this.height() - this.margin().top - this.margin().bottom);
  
  protected abstract createChart(): void;
  protected abstract updateChart(): void;
}
```

**OnPush change detection** is mandatory for performance with 8+ charts visible simultaneously. Combined with signals, this ensures Angular only checks components when their input signals actually change. The `ViewChild` pattern with typed `ElementRef<SVGSVGElement>` provides the bridge between Angular's component model and D3's DOM manipulation.

Component initialization follows a strict lifecycle pattern: use `ngAfterViewInit` for D3 DOM operations since `ViewChild` references aren't available until then. Data updates arrive through signals or `ngOnChanges`, but actual chart rendering must be guarded with a `viewInitialized` flag to prevent race conditions when data arrives before the view is ready.

## Zone.js management prevents change detection thrashing

D3's event handlers—particularly high-frequency events like `mousemove`, `zoom`, and `brush`—trigger Angular's change detection on every event. With **8+ charts handling zoom/pan interactions simultaneously, this creates catastrophic performance degradation**. The solution is running D3 behaviors outside Angular's zone:

```typescript
private initializeZoom(): void {
  this.ngZone.runOutsideAngular(() => {
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => this.onZoom(event));
    
    d3.select(this.chartSvg.nativeElement).call(zoom);
  });
}

private onZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
  // Re-enter zone only when UI state needs updating
  this.ngZone.run(() => {
    this.zoomTransform.set(event.transform);
  });
}
```

All `requestAnimationFrame` loops, `setInterval` timers, resize observers, and D3 event listeners should be initialized with `runOutsideAngular`. Only re-enter the Angular zone when actual UI updates are needed, such as updating a signal that drives template binding or triggering navigation.

Memory cleanup in `ngOnDestroy` is critical for preventing leaks. D3 event listeners must be explicitly removed by setting them to `null`, and all observers must be disconnected. The cleanup checklist includes interrupting any active D3 transitions with `.interrupt()`, canceling animation frame IDs, clearing intervals, and nullifying element references.

## Signals and effects create the reactive rendering pipeline

Angular Signals provide the reactive foundation without NgRx complexity. The pattern uses **writable signals for mutable state**, **computed signals for derived values like scales**, and **effects for D3 side effects**:

```typescript
// State layer
chartData = signal<DataPoint[]>([]);
chartConfig = signal<ChartConfig>(defaultConfig);
selectedPoint = signal<DataPoint | null>(null);

// Computed scales automatically recalculate when data changes
xScale = computed(() => 
  d3.scaleTime()
    .domain(d3.extent(this.chartData(), d => d.timestamp) as [Date, Date])
    .range([0, this.innerWidth()])
);

yScale = computed(() => 
  d3.scaleLinear()
    .domain([0, d3.max(this.chartData(), d => d.value) ?? 0])
    .range([this.innerHeight(), 0])
);

// Effect triggers D3 rendering when scales change
constructor() {
  effect((onCleanup) => {
    const xScale = this.xScale();
    const yScale = this.yScale();
    const data = this.chartData();
    
    if (this.chartGroup) {
      this.renderDataPoints(data, xScale, yScale);
    }
    
    onCleanup(() => this.cancelPendingTransitions());
  });
}
```

Computed signals are **lazily evaluated and memoized**, making them ideal for expensive scale calculations. They only recalculate when their dependencies change, and multiple reads within a single change detection cycle share the cached result. Critical rule: computed signals must be pure functions with no side effects—never modify DOM or make async calls within them.

Effects are specifically designed for synchronizing with external libraries like D3. The `onCleanup` callback handles transition interruption and listener removal before the next effect execution. Avoid setting signals within effects to prevent infinite loops; instead, use computed signals for any derived state.

## Canvas rendering handles 10,000+ data points efficiently

For **10,000+ data points per chart**, SVG becomes unviable due to DOM node overhead. The performance characteristics are clear: **SVG handles ~1,000-3,000 elements**, **Canvas handles ~10,000 elements at 60fps**, and **WebGL scales to 100,000+ elements**. The recommended approach uses a hybrid strategy—Canvas for data-dense rendering with SVG overlays for interactive elements:

```typescript
private renderWithCanvas(data: DataPoint[]): void {
  const ctx = this.canvas.nativeElement.getContext('2d')!;
  ctx.clearRect(0, 0, this.width(), this.height());
  
  // Batch all points in single path for maximum performance
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = this.xScale()(d.timestamp);
    const y = this.yScale()(d.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}
```

**LTTB (Largest-Triangle-Three-Buckets) downsampling** is the recommended algorithm for time-series data. It reduces 130,000 points to 750 while preserving visual shape and critical features like peaks and valleys. The algorithm works by dividing data into buckets and selecting the point from each bucket that forms the largest triangle with adjacent bucket representatives.

```typescript
// Apply LTTB before rendering
readonly displayData = computed(() => {
  const raw = this.chartData();
  const targetPoints = Math.min(raw.length, 2000); // Max rendered points
  return lttbDownsample(raw, targetPoints);
});
```

Level-of-detail rendering adjusts detail based on zoom level—show aggregated data when zoomed out, full detail when zoomed in. Combine this with viewport culling to skip rendering points outside the visible area. For zoom and pan interactions, use `requestAnimationFrame` throttling to batch multiple event handlers into single render passes.

## Strategy and Factory patterns enable chart type extensibility

The **Strategy Pattern** is ideal for interchangeable chart type implementations. Each chart type (line, bar, scatter, area) implements a common interface, allowing the framework to switch rendering strategies at runtime:

```typescript
interface IChartStrategy {
  render(container: SVGGElement, data: DataPoint[], scales: ChartScales): void;
  update(data: DataPoint[], scales: ChartScales): void;
  destroy(): void;
}

class LineChartStrategy implements IChartStrategy {
  private path: d3.Selection<SVGPathElement, DataPoint[], null, undefined>;
  
  render(container: SVGGElement, data: DataPoint[], scales: ChartScales): void {
    const lineGenerator = d3.line<DataPoint>()
      .x(d => scales.x(d.timestamp))
      .y(d => scales.y(d.value));
    
    this.path = d3.select(container)
      .append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue');
  }
}

class BarChartStrategy implements IChartStrategy {
  render(container: SVGGElement, data: DataPoint[], scales: ChartScales): void {
    d3.select(container)
      .selectAll('rect')
      .data(data, d => d.id)
      .join('rect')
      .attr('x', d => scales.x(d.category))
      .attr('y', d => scales.y(d.value))
      .attr('height', d => scales.innerHeight - scales.y(d.value))
      .attr('width', scales.x.bandwidth());
  }
}
```

The **Factory Pattern** handles chart instance creation with proper dependency injection. The factory registry allows new chart types to be registered dynamically, supporting the plugin architecture:

```typescript
@Injectable({ providedIn: 'root' })
export class ChartStrategyFactory {
  private strategies = new Map<ChartType, () => IChartStrategy>();
  
  registerStrategy(type: ChartType, factory: () => IChartStrategy): void {
    this.strategies.set(type, factory);
  }
  
  create(type: ChartType): IChartStrategy {
    const factory = this.strategies.get(type);
    if (!factory) throw new Error(`Unknown chart type: ${type}`);
    return factory();
  }
}
```

The **Composite Pattern** enables multiple chart types on the same canvas. A `CompositeChart` maintains a collection of layers (bar layer, line layer, scatter layer) that share scales and render in sequence. This directly addresses the requirement for mixing chart types on a single visualization.

## Builder pattern handles complex chart configurations

Chart configuration with multiple optional features benefits from the **Builder Pattern** with a fluent interface:

```typescript
interface ChartBuilder {
  setDimensions(width: number, height: number): ChartBuilder;
  setData(data: DataPoint[]): ChartBuilder;
  addYAxis(config: YAxisConfig): ChartBuilder;
  addSeries(series: SeriesConfig): ChartBuilder;
  enableZoom(config?: ZoomConfig): ChartBuilder;
  enableTooltip(config?: TooltipConfig): ChartBuilder;
  build(): IChart;
}

// Usage
const chart = chartBuilder
  .setDimensions(800, 400)
  .setData(salesData)
  .addYAxis({ id: 'revenue', position: 'left', domain: [0, 1000000] })
  .addYAxis({ id: 'units', position: 'right', domain: [0, 50000] })
  .addSeries({ type: 'bar', yAxisId: 'revenue', dataKey: 'revenue' })
  .addSeries({ type: 'line', yAxisId: 'units', dataKey: 'unitsSold' })
  .enableZoom({ xAxis: true, yAxis: false })
  .enableTooltip({ multiSeries: true })
  .build();
```

Configuration serialization for REST API persistence requires careful versioning for forward compatibility. Store a version field with every serialized configuration, and implement migration functions that upgrade older formats:

```typescript
@Injectable({ providedIn: 'root' })
export class ChartSerializationService {
  private readonly VERSION = '1.0.0';
  
  serialize(config: ChartConfig): string {
    return JSON.stringify({
      version: this.VERSION,
      type: config.type,
      dimensions: { width: config.width, height: config.height },
      series: config.series,
      axes: config.axes,
      features: config.features
    });
  }
  
  deserialize(json: string): ChartConfig {
    const parsed = JSON.parse(json);
    if (this.needsMigration(parsed.version)) {
      return this.migrate(parsed);
    }
    return this.buildConfig(parsed);
  }
}
```

## Plugin architecture with lifecycle hooks adds extensibility

Following Chart.js's proven model, the plugin system uses **lifecycle hooks** that fire at specific points in the chart lifecycle:

```typescript
interface IChartPlugin {
  id: string;
  beforeInit?(chart: IChart): void;
  afterInit?(chart: IChart): void;
  beforeUpdate?(chart: IChart): boolean | void;
  afterUpdate?(chart: IChart): void;
  beforeRender?(chart: IChart): boolean | void;
  afterRender?(chart: IChart): void;
  beforeDestroy?(chart: IChart): void;
}

@Injectable({ providedIn: 'root' })
export class PluginRegistry {
  private plugins = new Map<string, IChartPlugin>();
  
  register(plugin: IChartPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }
  
  notify(hook: keyof IChartPlugin, chart: IChart): boolean {
    for (const plugin of this.plugins.values()) {
      const method = plugin[hook] as Function;
      if (typeof method === 'function') {
        if (method.call(plugin, chart) === false) return false;
      }
    }
    return true;
  }
}
```

The **Decorator Pattern** adds features like zoom, pan, and tooltips to base charts without inheritance explosion:

```typescript
class ZoomableChart extends ChartDecorator {
  render(): void {
    super.render();
    this.addZoomBehavior();
  }
  
  private addZoomBehavior(): void {
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => this.handleZoom(event));
    d3.select(this.getContainer()).call(zoom);
  }
}

// Chain decorators for feature composition
const chart = new WithLegend(
  new WithTooltip(
    new ZoomableChart(
      new BaseChart(config, data)
    )
  )
);
```

## Streaming data integrates through RxJS-Signal bridging

Real-time data updates require bridging RxJS streams with Angular Signals using `@angular/core/rxjs-interop`. WebSocket data flows through RxJS operators for buffering and backpressure handling before converting to signals:

```typescript
@Injectable({ providedIn: 'root' })
export class StreamingDataService {
  private socket$ = webSocket<DataPoint>('wss://api.example.com/stream');
  
  // Buffer high-frequency updates before converting to signal
  readonly data = toSignal(
    this.socket$.pipe(
      bufferTime(100, null, 50), // Max 50 items or 100ms
      filter(batch => batch.length > 0),
      scan((acc, batch) => [...acc.slice(-9950), ...batch], [] as DataPoint[])
    ),
    { initialValue: [] }
  );
}
```

For dashboard synchronization across 8+ charts, a **shared signal store** maintains global state like time range selection, highlighted data points, and zoom transforms:

```typescript
@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly sharedTimeRange = signal<TimeRange>({
    start: Date.now() - 3600000,
    end: Date.now()
  });
  readonly selectedDataPoint = signal<DataPoint | null>(null);
  readonly zoomTransform = signal<d3.ZoomTransform>(d3.zoomIdentity);
}
```

Individual chart components consume and produce to these shared signals, enabling cross-chart interactions like synchronized zoom, linked brushing, and hover highlighting across all visible charts.

## Multiple y-axes require separate scales with coordinated positioning

Supporting multiple y-axes involves creating separate scales for each axis and positioning them on opposite sides of the chart:

```typescript
readonly yScales = computed(() => {
  const config = this.chartConfig();
  const scales: Record<string, d3.ScaleLinear<number, number>> = {};
  
  config.yAxes.forEach(axis => {
    scales[axis.id] = d3.scaleLinear()
      .domain(axis.domain)
      .range([this.innerHeight(), 0]);
  });
  
  return scales;
});

private renderAxes(): void {
  const yAxes = this.chartConfig().yAxes;
  
  yAxes.filter(a => a.position === 'left').forEach((axis, i) => {
    d3.select(this.yAxisGroups[axis.id])
      .attr('transform', `translate(${-i * 60}, 0)`)
      .call(d3.axisLeft(this.yScales()[axis.id]));
  });
  
  yAxes.filter(a => a.position === 'right').forEach((axis, i) => {
    d3.select(this.yAxisGroups[axis.id])
      .attr('transform', `translate(${this.innerWidth() + i * 60}, 0)`)
      .call(d3.axisRight(this.yScales()[axis.id]));
  });
}
```

Each data series specifies which y-axis it binds to via a `yAxisId` property. The rendering strategy uses the appropriate scale based on this binding, allowing different series to use different vertical scales while sharing the x-axis.

## Zoom and pan implementation uses d3-zoom with axis rescaling

The zoom behavior requires careful handling of x-only, y-only, and 2D zoom scenarios. For x-axis-only zoom (common in time-series dashboards), use `rescaleX` to transform the scale domain:

```typescript
private initializeZoom(): void {
  this.ngZone.runOutsideAngular(() => {
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 100])
      .translateExtent([[0, 0], [this.width(), this.height()]])
      .on('zoom', (event) => this.handleZoom(event));
    
    d3.select(this.chartSvg.nativeElement).call(zoom);
  });
}

private handleZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
  const newXScale = event.transform.rescaleX(this.originalXScale);
  
  // Update axis
  d3.select(this.xAxisGroup.nativeElement)
    .call(d3.axisBottom(newXScale));
  
  // Update data elements with new scale
  this.updateDataPositions(newXScale, this.yScale());
  
  // Emit to shared state for dashboard sync
  this.ngZone.run(() => {
    this.dashboardState.zoomTransform.set(event.transform);
  });
}
```

Brush selection for region zoom uses d3-brush combined with zoom transform updates. The Focus+Context pattern shows an overview chart below the main chart, with brushing on the overview controlling the main chart's visible range.

## Testing strategies span unit tests through visual regression

Testing a D3+Angular charting framework requires multiple layers. **Unit tests** verify scale calculations, data transformations, and configuration serialization without rendering. **Integration tests** use Angular's `TestBed` with a mock container to verify D3 rendering output:

```typescript
describe('LineChartComponent', () => {
  let component: LineChartComponent;
  let fixture: ComponentFixture<LineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineChartComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;
  });

  it('should render correct number of data points', () => {
    const testData = [{ id: '1', timestamp: new Date(), value: 100 }];
    component.data.set(testData);
    fixture.detectChanges();
    
    const circles = fixture.nativeElement.querySelectorAll('circle');
    expect(circles.length).toBe(1);
  });
});
```

**Visual regression testing** with tools like Percy or Chromatic captures screenshots of rendered charts and compares them against baselines. This catches rendering regressions that unit tests miss. **Performance testing** uses Chrome DevTools Performance API to measure render times and ensure they stay within the target budget of 100ms initial render and 16ms for interactions.

## Recommended project structure separates concerns cleanly

```
src/lib/charts/
├── core/
│   ├── interfaces/
│   │   ├── chart.interface.ts
│   │   ├── strategy.interface.ts
│   │   └── plugin.interface.ts
│   ├── base/
│   │   ├── base-chart.component.ts
│   │   └── base-series.ts
│   ├── services/
│   │   ├── chart-factory.service.ts
│   │   ├── plugin-registry.service.ts
│   │   ├── serialization.service.ts
│   │   └── dashboard-state.service.ts
│   └── utils/
│       ├── scale-factory.ts
│       ├── downsampling.ts
│       └── color-utils.ts
├── strategies/
│   ├── line-chart.strategy.ts
│   ├── bar-chart.strategy.ts
│   ├── scatter-chart.strategy.ts
│   └── area-chart.strategy.ts
├── components/
│   ├── chart-container/
│   ├── axis/
│   ├── legend/
│   ├── tooltip/
│   └── grid/
├── plugins/
│   ├── zoom.plugin.ts
│   ├── brush.plugin.ts
│   ├── annotation.plugin.ts
│   └── export.plugin.ts
├── directives/
│   ├── resizable.directive.ts
│   └── crosshair.directive.ts
└── themes/
    ├── default.theme.ts
    └── dark.theme.ts
```

## Dynamic and template modes share core infrastructure

The two usage modes—dynamic user configuration and reusable templates—share the same underlying components and differ only in how configuration is provided. **Dynamic mode** uses the builder pattern to construct configurations from UI selections, serializes them to the REST API, and deserializes them on load. **Template mode** defines preset configurations as TypeScript constants that accept data series as inputs:

```typescript
// Template definition
export const SalesOverviewTemplate: ChartTemplate = {
  id: 'sales-overview',
  name: 'Sales Overview',
  config: {
    type: 'composite',
    yAxes: [
      { id: 'revenue', position: 'left', format: '$,.0f' },
      { id: 'units', position: 'right', format: ',.0f' }
    ],
    series: [
      { type: 'bar', yAxisId: 'revenue', dataKey: 'revenue', color: '#4CAF50' },
      { type: 'line', yAxisId: 'units', dataKey: 'units', color: '#2196F3' }
    ],
    features: { zoom: true, tooltip: true, legend: true }
  }
};

// Template usage
<app-chart [template]="salesOverviewTemplate" [data]="salesData"></app-chart>
```

This architecture provides a solid foundation for several years of development, with clear extension points for new chart types, features, and integrations. The combination of Angular's component model, Signals' reactive primitives, and D3's visualization capabilities creates a maintainable, performant charting framework suitable for enterprise dashboard applications.
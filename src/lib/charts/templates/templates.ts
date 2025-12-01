/**
 * Predefined chart templates for common use cases
 */

import { ChartConfig } from '../core/interfaces';

export interface ChartTemplate {
  id: string;
  name: string;
  description?: string;
  config: ChartConfig;
}

/**
 * Sales overview template with dual axes
 */
export const SalesOverviewTemplate: ChartTemplate = {
  id: 'sales-overview',
  name: 'Sales Overview',
  description: 'Display revenue and units sold with dual y-axes',
  config: {
    type: 'composite',
    width: 800,
    height: 400,
    yAxes: [
      { id: 'revenue', position: 'left', label: 'Revenue', format: '$,.0f' },
      { id: 'units', position: 'right', label: 'Units Sold', format: ',.0f' },
    ],
    series: [
      {
        id: 'revenue-series',
        type: 'bar',
        dataKey: 'revenue',
        yAxisId: 'revenue',
        color: '#4CAF50',
        label: 'Revenue',
      },
      {
        id: 'units-series',
        type: 'line',
        dataKey: 'units',
        yAxisId: 'units',
        color: '#2196F3',
        label: 'Units',
        strokeWidth: 2,
      },
    ],
    features: { zoom: true, tooltip: true, legend: true },
  },
};

/**
 * Time series template for single metric tracking
 */
export const TimeSeriesTemplate: ChartTemplate = {
  id: 'time-series',
  name: 'Time Series',
  description: 'Track a single metric over time with area fill',
  config: {
    type: 'area',
    width: 800,
    height: 400,
    series: [
      {
        type: 'area',
        dataKey: 'value',
        color: '#3F51B5',
        opacity: 0.6,
      },
    ],
    features: { zoom: true, tooltip: true, legend: false },
  },
};

/**
 * Category comparison template
 */
export const CategoryComparisonTemplate: ChartTemplate = {
  id: 'category-comparison',
  name: 'Category Comparison',
  description: 'Compare values across categories with bar chart',
  config: {
    type: 'bar',
    width: 800,
    height: 400,
    series: [
      {
        type: 'bar',
        dataKey: 'value',
        color: '#FF9800',
      },
    ],
    features: { tooltip: true, legend: false },
  },
};

/**
 * Scatter plot template for correlation analysis
 */
export const ScatterPlotTemplate: ChartTemplate = {
  id: 'scatter-plot',
  name: 'Scatter Plot',
  description: 'Analyze correlation between two variables',
  config: {
    type: 'scatter',
    width: 800,
    height: 400,
    series: [
      {
        type: 'scatter',
        dataKey: 'value',
        color: '#E91E63',
      },
    ],
    features: { tooltip: true, legend: false },
  },
};

/**
 * Template registry
 */
export const TemplateRegistry = new Map<string, ChartTemplate>([
  [SalesOverviewTemplate.id, SalesOverviewTemplate],
  [TimeSeriesTemplate.id, TimeSeriesTemplate],
  [CategoryComparisonTemplate.id, CategoryComparisonTemplate],
  [ScatterPlotTemplate.id, ScatterPlotTemplate],
]);

/**
 * Get a template by ID
 */
export function getTemplate(id: string): ChartTemplate | undefined {
  return TemplateRegistry.get(id);
}

/**
 * Get all available templates
 */
export function getAllTemplates(): ChartTemplate[] {
  return Array.from(TemplateRegistry.values());
}

/**
 * Register a custom template
 */
export function registerTemplate(template: ChartTemplate): void {
  TemplateRegistry.set(template.id, template);
}

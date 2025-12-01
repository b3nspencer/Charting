/**
 * Core data types for the charting framework
 */

export interface DataPoint {
  id: string | number;
  timestamp?: Date;
  category?: string;
  value: number;
  [key: string]: any;
}

export type ChartType =
  | 'line'
  | 'bar'
  | 'scatter'
  | 'area'
  | 'composite';

export interface TimeRange {
  start: Date | number;
  end: Date | number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartScales {
  x: d3.ScaleLinear<number, number> | d3.ScaleBand<string> | d3.ScaleTime<number, number>;
  y: d3.ScaleLinear<number, number>;
  innerWidth: number;
  innerHeight: number;
}

export interface YAxisConfig {
  id: string;
  position: 'left' | 'right';
  label?: string;
  domain?: [number, number];
  format?: string;
}

export interface SeriesConfig {
  id?: string;
  type: 'line' | 'bar' | 'scatter' | 'area';
  dataKey: string;
  yAxisId?: string;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  label?: string;
}

export interface ChartConfig {
  type: ChartType;
  width?: number;
  height?: number;
  margin?: Partial<Margin>;
  data?: DataPoint[];
  yAxes?: YAxisConfig[];
  series?: SeriesConfig[];
  features?: {
    zoom?: boolean;
    tooltip?: boolean;
    legend?: boolean;
    brush?: boolean;
  };
  [key: string]: any;
}

export interface ZoomTransform {
  x: number;
  y: number;
  k: number;
}

export type FormatterFn = (value: number | Date) => string;

export interface AxisConfig {
  scale: d3.AxisScale<any>;
  orientation: 'top' | 'right' | 'bottom' | 'left';
  ticks?: number;
  tickFormat?: FormatterFn;
  label?: string;
}

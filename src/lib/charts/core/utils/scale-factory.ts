/**
 * Factory functions for creating D3 scales
 */

import * as d3 from 'd3';
import { DataPoint, Margin } from '../interfaces';

export interface ScaleConfig {
  width: number;
  height: number;
  margin: Margin;
}

/**
 * Create a time-based X scale
 */
export function createTimeScale(
  data: DataPoint[],
  config: ScaleConfig
): d3.ScaleTime<number, number> {
  const innerWidth = config.width - config.margin.left - config.margin.right;
  const timestamps = data
    .map((d) => d.timestamp)
    .filter((t): t is Date => t !== undefined);

  if (timestamps.length === 0) {
    return d3
      .scaleTime()
      .domain([new Date(), new Date()])
      .range([0, innerWidth]);
  }

  const extent = d3.extent(timestamps) as [Date, Date];
  return d3.scaleTime().domain(extent).range([0, innerWidth]);
}

/**
 * Create a categorical X scale
 */
export function createBandScale(
  data: DataPoint[],
  config: ScaleConfig
): d3.ScaleBand<string> {
  const innerWidth = config.width - config.margin.left - config.margin.right;
  const categories = data
    .map((d) => d.category)
    .filter((c): c is string => c !== undefined);

  return d3
    .scaleBand()
    .domain(categories)
    .range([0, innerWidth])
    .padding(0.1);
}

/**
 * Create a linear X scale
 */
export function createLinearXScale(
  data: DataPoint[],
  config: ScaleConfig
): d3.ScaleLinear<number, number> {
  const innerWidth = config.width - config.margin.left - config.margin.right;
  return d3.scaleLinear().domain([0, data.length - 1]).range([0, innerWidth]);
}

/**
 * Create a linear Y scale
 */
export function createLinearYScale(
  data: DataPoint[],
  config: ScaleConfig,
  domain?: [number, number]
): d3.ScaleLinear<number, number> {
  const innerHeight = config.height - config.margin.top - config.margin.bottom;

  let yDomain: [number, number];
  if (domain) {
    yDomain = domain;
  } else {
    const maxValue = d3.max(data, (d) => d.value) || 0;
    yDomain = [0, maxValue];
  }

  return d3
    .scaleLinear()
    .domain(yDomain)
    .range([innerHeight, 0]);
}

/**
 * Create a logarithmic Y scale
 */
export function createLogScale(
  data: DataPoint[],
  config: ScaleConfig
): d3.ScaleLogarithmic<number, number> {
  const innerHeight = config.height - config.margin.top - config.margin.bottom;
  const maxValue = d3.max(data, (d) => d.value) || 1;

  return d3
    .scaleLog()
    .domain([1, maxValue])
    .range([innerHeight, 0]);
}

/**
 * Create a color scale
 */
export function createColorScale(
  domain?: string[]
): d3.ScaleOrdinal<string, string> {
  return d3
    .scaleOrdinal<string, string>()
    .domain(domain || [])
    .range(d3.schemeCategory10);
}

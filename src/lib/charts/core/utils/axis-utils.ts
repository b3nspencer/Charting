/**
 * Axis utility functions for label formatting and positioning
 */

import * as d3 from 'd3';

/**
 * Format a number with commas for thousands separators
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

/**
 * Format a date value
 */
export function formatDate(date: Date, format: string = 'short'): string {
  const options: Intl.DateTimeFormatOptions = {};

  if (format === 'short') {
    options.month = '2-digit';
    options.day = '2-digit';
    options.year = '2-digit';
  } else if (format === 'long') {
    options.weekday = 'long';
    options.year = 'numeric';
    options.month = 'long';
    options.day = 'numeric';
  } else if (format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }

  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a time value (duration in milliseconds)
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return hours + 'h ' + (minutes % 60) + 'm';
  } else if (minutes > 0) {
    return minutes + 'm ' + (seconds % 60) + 's';
  } else {
    return seconds + 's';
  }
}

/**
 * Create a format function for D3 axes
 */
export function createAxisFormatter(
  type: 'number' | 'currency' | 'percentage' | 'date' | 'time'
): (value: any) => string {
  switch (type) {
    case 'number':
      return (value) => formatNumber(value);
    case 'currency':
      return (value) => formatCurrency(value);
    case 'percentage':
      return (value) => formatPercentage(value);
    case 'date':
      return (value) => formatDate(value, 'short');
    case 'time':
      return (value) => formatDate(value, 'time');
    default:
      return (value) => String(value);
  }
}

/**
 * Calculate optimal number of ticks for an axis
 */
export function getOptimalTickCount(range: number, pixelWidth: number): number {
  const tickWidth = 50; // Approximate pixels per tick
  return Math.max(2, Math.floor(pixelWidth / tickWidth));
}

/**
 * Create a time-based tick formatter
 */
export function createTimeFormatter(scale: d3.ScaleTime<number, number>): (value: Date) => string {
  const domain = scale.domain();
  const range = domain[1].getTime() - domain[0].getTime();

  if (range < 60000) {
    // Less than 1 minute - show seconds
    return (date) => formatDate(date, 'time');
  } else if (range < 3600000) {
    // Less than 1 hour - show time with minutes
    return (date) =>
      date.getHours().toString().padStart(2, '0') +
      ':' +
      date.getMinutes().toString().padStart(2, '0');
  } else if (range < 86400000) {
    // Less than 1 day - show time with hours
    return (date) =>
      date.getHours().toString().padStart(2, '0') + ':00';
  } else if (range < 2592000000) {
    // Less than 30 days - show date
    return (date) => formatDate(date, 'short');
  } else {
    // More than 30 days - show month/year
    return (date) => date.getMonth() + 1 + '/' + date.getFullYear();
  }
}

/**
 * Rotate axis labels
 */
export function rotateAxisLabels(
  selection: d3.Selection<any, any, any, any>,
  angle: number,
  anchorX: 'start' | 'middle' | 'end' = 'end'
): void {
  selection
    .selectAll('text')
    .attr('transform', `rotate(${angle})`)
    .style('text-anchor', anchorX);
}

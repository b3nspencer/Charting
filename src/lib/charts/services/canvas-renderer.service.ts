/**
 * Canvas rendering service for high-performance chart rendering
 */

import { Injectable } from '@angular/core';
import { DataPoint, ChartScales, Margin } from '../core/interfaces';
import { lttbDownsample } from '../core/utils';

@Injectable({ providedIn: 'root' })
export class CanvasRendererService {
  /**
   * Render line chart on canvas
   */
  renderLineChart(
    canvas: HTMLCanvasElement,
    data: DataPoint[],
    scales: ChartScales,
    color: string = '#1f77b4',
    lineWidth: number = 2
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Downsample data if needed
    const displayData = data.length > 2000 ? lttbDownsample(data, 2000) : data;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    displayData.forEach((d, i) => {
      const x = scales.x(d.timestamp ? d.timestamp.getTime() : 0) as number;
      const y = scales.y(d.value);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  /**
   * Render scatter plot on canvas
   */
  renderScatterPlot(
    canvas: HTMLCanvasElement,
    data: DataPoint[],
    scales: ChartScales,
    color: string = '#ff7f0e',
    radius: number = 3
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Downsample data if needed
    const displayData = data.length > 5000 ? lttbDownsample(data, 5000) : data;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw points
    ctx.fillStyle = color;

    displayData.forEach((d) => {
      const x = scales.x(d.timestamp ? d.timestamp.getTime() : 0) as number;
      const y = scales.y(d.value);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  /**
   * Render area chart on canvas
   */
  renderAreaChart(
    canvas: HTMLCanvasElement,
    data: DataPoint[],
    scales: ChartScales,
    color: string = 'steelblue',
    opacity: number = 0.6
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Downsample data if needed
    const displayData = data.length > 2000 ? lttbDownsample(data, 2000) : data;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set color and opacity
    const rgbColor = this.hexToRgb(color);
    ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${opacity})`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Draw area
    ctx.beginPath();
    displayData.forEach((d, i) => {
      const x = scales.x(d.timestamp ? d.timestamp.getTime() : 0) as number;
      const y = scales.y(d.value);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close the path
    if (displayData.length > 0) {
      const lastX = scales.x(
        displayData[displayData.length - 1].timestamp
          ? displayData[displayData.length - 1].timestamp!.getTime()
          : 0
      ) as number;
      ctx.lineTo(lastX, scales.innerHeight);
      ctx.lineTo(scales.x(displayData[0].timestamp ? displayData[0].timestamp.getTime() : 0) as number, scales.innerHeight);
      ctx.closePath();
    }

    ctx.fill();
    ctx.stroke();
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 31, g: 119, b: 180 };
  }
}

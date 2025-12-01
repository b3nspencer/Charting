/**
 * Shared dashboard state service for cross-chart interactions
 */

import { Injectable, signal } from '@angular/core';
import { DataPoint, TimeRange, ZoomTransform } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  /**
   * Shared time range selection across all charts
   */
  readonly sharedTimeRange = signal<TimeRange>({
    start: Date.now() - 3600000,
    end: Date.now(),
  });

  /**
   * Currently selected data point across all charts
   */
  readonly selectedDataPoint = signal<DataPoint | null>(null);

  /**
   * Shared zoom transform for synchronized zooming
   */
  readonly zoomTransform = signal<ZoomTransform>({
    x: 0,
    y: 0,
    k: 1,
  });

  /**
   * Highlighted data points across charts
   */
  readonly highlightedPoints = signal<(string | number)[]>([]);

  /**
   * Update time range
   */
  updateTimeRange(start: Date | number, end: Date | number): void {
    this.sharedTimeRange.set({ start, end });
  }

  /**
   * Update selected data point
   */
  updateSelectedPoint(point: DataPoint | null): void {
    this.selectedDataPoint.set(point);
  }

  /**
   * Update zoom transform
   */
  updateZoomTransform(x: number, y: number, k: number): void {
    this.zoomTransform.set({ x, y, k });
  }

  /**
   * Set highlighted points
   */
  setHighlightedPoints(pointIds: (string | number)[]): void {
    this.highlightedPoints.set(pointIds);
  }

  /**
   * Clear all shared state
   */
  reset(): void {
    this.sharedTimeRange.set({
      start: Date.now() - 3600000,
      end: Date.now(),
    });
    this.selectedDataPoint.set(null);
    this.zoomTransform.set({ x: 0, y: 0, k: 1 });
    this.highlightedPoints.set([]);
  }
}

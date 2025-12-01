/**
 * Streaming data service for WebSocket and real-time data handling
 */

import { Injectable, signal } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { scan, bufferTime, filter } from 'rxjs/operators';
import { DataPoint } from '../core/interfaces';

@Injectable({ providedIn: 'root' })
export class StreamingDataService {
  private dataStream$ = new Subject<DataPoint>();
  readonly data = signal<DataPoint[]>([]);

  constructor() {
    this.initializeStreamHandling();
  }

  private initializeStreamHandling(): void {
    this.dataStream$
      .pipe(
        bufferTime(100, null, 50), // Buffer updates for 100ms or max 50 items
        filter((batch) => batch.length > 0),
        scan((acc: DataPoint[], batch: DataPoint[]) => {
          // Keep only last 10000 points for performance
          const combined = [...acc, ...batch];
          return combined.slice(-10000);
        }, [])
      )
      .subscribe((data) => {
        this.data.set(data);
      });
  }

  /**
   * Add a data point to the stream
   */
  addDataPoint(point: DataPoint): void {
    this.dataStream$.next(point);
  }

  /**
   * Add multiple data points
   */
  addDataPoints(points: DataPoint[]): void {
    points.forEach((point) => this.dataStream$.next(point));
  }

  /**
   * Simulate streaming data
   */
  startSimulation(interval$: Observable<number>): void {
    interval$.subscribe((value) => {
      const point: DataPoint = {
        id: `sim-${Date.now()}`,
        timestamp: new Date(),
        value: Math.random() * 100,
      };
      this.addDataPoint(point);
    });
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.set([]);
  }

  /**
   * Get current data
   */
  getData(): DataPoint[] {
    return this.data();
  }
}

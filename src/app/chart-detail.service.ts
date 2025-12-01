/**
 * Service for sharing chart details between dashboard and detail view
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataPoint } from '../lib/charts';

export interface ChartDetail {
  id: string;
  title: string;
  data: DataPoint[];
  config: any;
  type: 'line' | 'bar' | 'scatter' | 'area' | 'stacked-bar';
}

@Injectable({ providedIn: 'root' })
export class ChartDetailService {
  private chartDetailSubject = new BehaviorSubject<ChartDetail | null>(null);
  public chartDetail$: Observable<ChartDetail | null> = this.chartDetailSubject.asObservable();

  setChartDetail(detail: ChartDetail): void {
    this.chartDetailSubject.next(detail);
  }

  getChartDetail(): ChartDetail | null {
    return this.chartDetailSubject.value;
  }

  clearChartDetail(): void {
    this.chartDetailSubject.next(null);
  }
}

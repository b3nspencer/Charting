/**
 * Legend component for displaying series information
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeriesConfig } from '../core/interfaces';

@Component({
  selector: 'app-legend',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legend">
      <div *ngFor="let series of series" class="legend-item" [class.hidden]="hiddenSeries.has(series.id || series.dataKey)">
        <div
          class="legend-color"
          [style.backgroundColor]="series.color || '#000'"
          (click)="toggleSeries(series.id || series.dataKey)"
        ></div>
        <span class="legend-label">{{ series.label || series.dataKey }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        padding: 10px;
        font-size: 12px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        opacity: 1;
        transition: opacity 0.2s;
      }

      .legend-item:hover {
        opacity: 0.7;
      }

      .legend-item.hidden {
        opacity: 0.5;
        text-decoration: line-through;
      }

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 2px;
        border: 1px solid #ccc;
      }

      .legend-label {
        user-select: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegendComponent {
  @Input() series: SeriesConfig[] = [];
  @Output() seriesToggled = new EventEmitter<string>();

  hiddenSeries = new Set<string>();

  toggleSeries(id: string): void {
    if (this.hiddenSeries.has(id)) {
      this.hiddenSeries.delete(id);
    } else {
      this.hiddenSeries.add(id);
    }
    this.seriesToggled.emit(id);
  }
}

/**
 * Tooltip component for displaying data point information
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataPoint } from '../core/interfaces';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="data" class="tooltip" [style.left]="x + 'px'" [style.top]="y + 'px'">
      <div *ngIf="data.id" class="tooltip-row">
        <span class="tooltip-label">ID:</span>
        <span class="tooltip-value">{{ data.id }}</span>
      </div>
      <div *ngIf="data.category" class="tooltip-row">
        <span class="tooltip-label">Category:</span>
        <span class="tooltip-value">{{ data.category }}</span>
      </div>
      <div *ngIf="data.timestamp" class="tooltip-row">
        <span class="tooltip-label">Time:</span>
        <span class="tooltip-value">{{ data.timestamp | date: 'short' }}</span>
      </div>
      <div class="tooltip-row tooltip-value-row">
        <span class="tooltip-label">Value:</span>
        <span class="tooltip-value">{{ data.value | number: '1.2-2' }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .tooltip-row {
        display: flex;
        gap: 8px;
      }

      .tooltip-label {
        font-weight: bold;
        opacity: 0.7;
      }

      .tooltip-value {
        white-space: nowrap;
      }

      .tooltip-value-row {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 4px;
        margin-top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input() data: DataPoint | null = null;
  @Input() x = 0;
  @Input() y = 0;
}

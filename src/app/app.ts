import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleDashboardComponent } from './example-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ExampleDashboardComponent],
  template: `<app-example-dashboard></app-example-dashboard>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class App {}

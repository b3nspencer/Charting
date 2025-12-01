import { Routes } from '@angular/router';
import { ExampleDashboardComponent } from './example-dashboard.component';
import { ChartDetailComponent } from './chart-detail.component';
import { PowerSampleComponent } from './power-sample.component';

export const routes: Routes = [
  { path: '', component: ExampleDashboardComponent },
  { path: 'chart/:id', component: ChartDetailComponent },
  { path: 'complex', component: PowerSampleComponent },
  { path: '**', redirectTo: '' },
];

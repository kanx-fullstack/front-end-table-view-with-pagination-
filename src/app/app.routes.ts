import { Routes } from '@angular/router';
import { DataviewComponent } from './components/dataview/dataview.component';

export const routes: Routes = [
    { path: '',
    redirectTo: 'table',
    pathMatch: 'full' },
    { path: 'table', component: DataviewComponent }
];

import { Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./modules/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'medicos',
        loadComponent: () =>
          import('./modules/medicos/medicos.component').then(
            (m) => m.MedicosComponent
          ),
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./modules/pacientes/pacientes.component').then(
            (m) => m.PacientesComponent
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./modules/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent
          ),
      },
      {
        path: 'ajustes',
        loadComponent: () =>
          import('./modules/ajustes/ajustes.component').then(
            (m) => m.AjustesComponent
          ),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

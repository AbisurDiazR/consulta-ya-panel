import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of, from } from 'rxjs';
import { take, switchMap, map, catchError } from 'rxjs/operators';

/**
 * loginGuard
 * Guard inverso: redirige al dashboard si el usuario ya está autenticado y es admin.
 * Permite acceso a /login solo si el usuario NO está autenticado o NO está en la colección "admins".
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    switchMap((user) => {
      // Si no hay usuario autenticado, permitir acceso a login
      if (!user) {
        console.log('[loginGuard] Usuario no autenticado, permitiendo acceso a login');
        return of(true);
      }
      
      console.log(`[loginGuard] Usuario autenticado: ${user.email}, verificando si está en colección "admins"...`);

      // Si hay usuario, verificar si está en la colección "admins"
      // IMPORTANTE: Solo validamos la existencia en admins, no el campo role
      return from(authService.isAdmin(user)).pipe(
        map((isAdmin) => {
          if (isAdmin) {
            // Usuario está en admins, redirigir al dashboard
            console.log(`[loginGuard] ✅ Usuario ${user.email} SÍ se encuentra en la colección "admins"`);
            console.log(`[loginGuard] Redirigiendo a dashboard...`);
            router.navigate(['/dashboard']);
            return false;
          } else {
            // Usuario no está en admins, permitir acceso a login
            console.log(`[loginGuard] ❌ Usuario ${user.email} NO se encuentra en la colección "admins"`);
            console.log(`[loginGuard] Permitiendo acceso a página de login`);
            return true;
          }
        }),
        catchError((error) => {
          console.error(`[loginGuard] ❌ Error verificando si usuario ${user.email} está en admins:`, error);
          console.log(`[loginGuard] Permitiendo acceso a login debido al error`);
          // En caso de error, permitir acceso a login
          return of(true);
        })
      );
    })
  );
};

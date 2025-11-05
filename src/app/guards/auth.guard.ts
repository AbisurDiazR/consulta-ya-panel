import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { from, map, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser$.pipe(
    switchMap(user => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }
      // Verificar si el usuario está en la colección 'admins'
      return from(auth.isAdmin(user)).pipe(
        map(isAdmin => {
          if (!isAdmin) {
            router.navigate(['/login']);
            return false;
          }
          return true;
        })
      );
    })
  );
};

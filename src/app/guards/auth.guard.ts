import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { of, from } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';

/**
 * authGuard(allowedRoles?)
 * - allowedRoles vacío -> verifica que exista documento en /admins (cualquier rol)
 * - allowedRoles con elementos -> además valida que role ∈ allowedRoles
 */
export const authGuard = (allowedRoles: string[] = []): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const roleService = inject(RoleService);
    const router = inject(Router);

    return auth.currentUser$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          router.navigate(['/login']);
          return of(false);
        }

        // leemos el valor actual del rol cacheado (puede ser undefined/null/string)
        return auth.currentRole$.pipe(
          take(1),
          switchMap((cachedRole) => {
            // Si cachedRole === undefined => aún no cargado => consultamos Firestore
            if (cachedRole === undefined) {
              return from(roleService.getUserRole(user)).pipe(
                map((role) => {
                  // actualizamos cache (no bloqueante; auth.refreshRole puede llamarse si lo deseas)
                  // Nota: no forzamos refreshRole() aquí para no disparar otra consulta
                  if (!role) {
                    router.navigate(['/login']);
                    return false;
                  }
                  if (!allowedRoles.length) return true;
                  if (allowedRoles.includes(role)) return true;
                  router.navigate(['/unauthorized']);
                  return false;
                })
              );
            }

            // Si cachedRole es null => no es admin
            if (cachedRole === null) {
              router.navigate(['/login']);
              return of(false);
            }

            // cachedRole es string (rol cargado)
            if (!allowedRoles.length) return of(true);
            if (allowedRoles.includes(cachedRole)) return of(true);
            router.navigate(['/unauthorized']);
            return of(false);
          })
        );
      })
    );
  };
};

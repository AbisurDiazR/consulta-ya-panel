import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { of, from } from 'rxjs';
import { take, switchMap, map, catchError } from 'rxjs/operators';

/**
 * authGuard(allowedRoles?)
 * Valida que el usuario:
 * 1. Esté autenticado
 * 2. Exista en la colección "admins" de Firestore
 * 3. Si allowedRoles está definido, valida que el rol del usuario esté incluido
 * 
 * - allowedRoles vacío -> solo verifica existencia en /admins (cualquier rol)
 * - allowedRoles con elementos -> además valida que role ∈ allowedRoles
 */
export const authGuard = (allowedRoles: string[] = []): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const roleService = inject(RoleService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      switchMap((user) => {
        // Paso 1: Verificar que el usuario esté autenticado
        if (!user) {
          console.log('[authGuard] ❌ Usuario no autenticado, redirigiendo a login');
          router.navigate(['/login']);
          return of(false);
        }
        
        console.log(`[authGuard] Usuario autenticado: ${user.email}, verificando acceso a colección "admins"...`);

        // Paso 2: Verificar existencia en la colección "admins" de Firestore
        // IMPORTANTE: Solo validamos la existencia en admins, el campo role es opcional
        return from(authService.isAdmin(user)).pipe(
          switchMap((isAdmin) => {
            // Si el usuario NO está en la colección "admins", denegar acceso
            if (!isAdmin) {
              console.warn(`[authGuard] ❌ Usuario ${user.email} NO se encuentra en la colección "admins"`);
              router.navigate(['/login']);
              return of(false);
            }

            // Usuario SÍ está en la colección "admins"
            console.log(`[authGuard] ✅ Usuario ${user.email} SÍ se encuentra en la colección "admins"`);
            
            // Si no se especifican roles permitidos, cualquier admin puede acceder
            if (allowedRoles.length === 0) {
              console.log(`[authGuard] Acceso permitido: cualquier admin puede acceder (no se requiere rol específico)`);
              return of(true);
            }

            // Si se especifican roles permitidos, verificar el rol del usuario
            return authService.currentRole$.pipe(
              take(1),
              switchMap((cachedRole) => {
                // Si el rol no está cacheado, obtenerlo de Firestore
                if (cachedRole === undefined) {
                  return from(roleService.getUserRole(user)).pipe(
                    map((role) => {
                      // Si el usuario no tiene rol asignado, denegar acceso cuando se requieren roles específicos
                      if (role === null) {
                        console.warn(`[authGuard] ⚠️ Usuario está en "admins" pero no tiene rol asignado. Roles requeridos: [${allowedRoles.join(', ')}]`);
                        router.navigate(['/unauthorized']);
                        return false;
                      }
                      
                      // Verificar si el rol está en los permitidos
                      if (allowedRoles.includes(role)) {
                        console.log(`[authGuard] Acceso permitido: rol "${role}" está en los roles permitidos: [${allowedRoles.join(', ')}]`);
                        return true;
                      }
                      
                      // Rol no permitido
                      console.warn(`[authGuard] ⚠️ Usuario es admin pero su rol "${role}" no está en los roles permitidos: [${allowedRoles.join(', ')}]`);
                      router.navigate(['/unauthorized']);
                      return false;
                    }),
                    catchError((error) => {
                      console.error(`[authGuard] ❌ Error obteniendo rol para usuario ${user.email}:`, error);
                      router.navigate(['/unauthorized']);
                      return of(false);
                    })
                  );
                }

                // Si cachedRole es null y se requieren roles específicos, denegar acceso
                if (cachedRole === null) {
                  console.warn(`[authGuard] ⚠️ Usuario está en "admins" pero no tiene rol asignado (desde cache). Roles requeridos: [${allowedRoles.join(', ')}]`);
                  router.navigate(['/unauthorized']);
                  return of(false);
                }

                // Verificar si el rol cacheado está en los permitidos
                if (allowedRoles.includes(cachedRole)) {
                  console.log(`[authGuard] Acceso permitido: rol "${cachedRole}" está en los roles permitidos: [${allowedRoles.join(', ')}]`);
                  return of(true);
                }
                
                // Rol no permitido
                console.warn(`[authGuard] ⚠️ Usuario es admin pero su rol "${cachedRole}" no está en los roles permitidos: [${allowedRoles.join(', ')}]`);
                router.navigate(['/unauthorized']);
                return of(false);
              })
            );
          }),
          catchError((error) => {
            console.error('[authGuard] ❌ Error en guard de autenticación:', error);
            router.navigate(['/login']);
            return of(false);
          })
        );
      })
    );
  };
};

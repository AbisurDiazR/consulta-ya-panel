import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';

// Firebase SDK (puro)
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../app.config'; // AJUSTA RUTA según tu proyecto
import { doc, getDoc } from 'firebase/firestore';

// Importa RoleService para obtener role (si ya lo tienes)
// Si no lo tienes, puedes eliminar el import y usar getDoc directo en isAdmin/getRole
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Estado del usuario autenticado (igual que antes)
  private user$ = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.user$.asObservable();

  /**
   * Estado del rol:
   *  - undefined => aún no se intentó cargar el rol (no cargado)
   *  - null => consultado y NO existe doc en /admins (no admin)
   *  - string => rol cargado (ej. 'admin', 'superadmin')
   */
  private role$ = new BehaviorSubject<string | null | undefined>(undefined);
  readonly currentRole$ = this.role$.asObservable();

  constructor(private roleService: RoleService) {
    // Escuchar cambios de estado de autenticación
    onAuthStateChanged(auth, async (user) => {
      this.user$.next(user);

      if (!user) {
        // limpiar cache si cierra sesión
        this.role$.next(undefined);
        return;
      }

      // al iniciar sesión intentamos cargar rol (no bloqueante para UI)
      // Nota: El rol puede ser null incluso si el usuario está en admins (si no tiene campo role)
      try {
        const isAdmin = await this.isAdmin(user);
        if (isAdmin) {
          // Solo intentar obtener el rol si el usuario está en admins
          const r = await this.roleService.getUserRole(user);
          // r puede ser null si no tiene campo role, eso es válido
          this.role$.next(r ?? null);
        } else {
          // Usuario no está en admins
          this.role$.next(null);
        }
      } catch (err) {
        console.error('Error cargando role en onAuthStateChanged:', err);
        this.role$.next(null);
      }
    });
  }

  // Retornamos un Observable a partir del Promise de signInWithEmailAndPassword
  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(auth, email, password));
  }

  logout() {
    // limpiamos cache local al cerrar sesión
    this.role$.next(undefined);
    this.user$.next(null);
    return from(signOut(auth));
  }

  /**
   * Comprueba si el usuario existe en la colección "admins" de Firestore
   * Retorna true solo si existe un documento en admins/{uid}
   */
  async isAdmin(user: User | null): Promise<boolean> {
    if (!user) {
      return false;
    }
    
    try {
      const ref = doc(db, 'admins', user.uid);
      const snapshot = await getDoc(ref);
      return snapshot.exists();
    } catch (err) {
      console.error('Error verificando existencia en colección "admins":', err);
      return false;
    }
  }

  /**
   * Fuerza recarga del rol desde Firestore y actualiza cache.
   * Devuelve el rol (string) o null si no existe.
   */
  async refreshRole(): Promise<string | null> {
    const user = this.user$.value;
    if (!user) {
      this.role$.next(undefined);
      return null;
    }
    try {
      const role = await this.roleService.getUserRole(user);
      this.role$.next(role ?? null);
      return role ?? null;
    } catch (err) {
      console.error('refreshRole error:', err);
      this.role$.next(null);
      return null;
    }
  }
}

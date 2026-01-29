import { Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../app.config'; // Ajusta la ruta según donde exportaste `db`

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor() {}

  /**
   * Obtiene el rol del usuario desde Firestore (colección "admins")
   * IMPORTANTE: Este método solo obtiene el rol, NO valida la existencia en admins.
   * Para validar existencia, usar AuthService.isAdmin()
   * 
   * Retorna:
   * - string: el rol del usuario si tiene rol asignado
   * - null: si el usuario no tiene rol asignado o no existe en la colección "admins"
   */
  async getUserRole(user: User): Promise<string | null> {
    if (!user) {
      console.log('[RoleService] getUserRole: Usuario no proporcionado');
      return null;
    }
    
    try {
      // Consultar la colección "admins" con el UID del usuario
      const ref = doc(db, 'admins', user.uid);
      const snap = await getDoc(ref);
      
      // Si no existe el documento, retornar null
      if (!snap.exists()) {
        return null;
      }

      // Obtener el campo "role" del documento
      const data = snap.data();
      const role = data?.['role'];
      
      // Retornar el rol si existe y es string, de lo contrario null
      // Nota: El documento puede existir sin tener campo "role", eso es válido
      return role && typeof role === 'string' ? role : null;
    } catch (err) {
      console.error(`[RoleService] ❌ Error obteniendo rol desde Firestore para usuario ${user.uid}:`, err);
      return null;
    }
  }

  /**
   * Crea un nuevo documento de admin en Firestore
   */
  async createAdminUser(uid: string, email: string, role: string, createdBy: string) {
    try {
      const ref = doc(db, 'admins', uid);
      await setDoc(ref, {
        email,
        role,
        createdBy,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Usuario admin ${email} creado con rol "${role}"`);
    } catch (err) {
      console.error('Error creando usuario admin:', err);
      throw err;
    }
  }
}

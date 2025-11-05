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
   */
  async getUserRole(user: User): Promise<string | null> {
    if (!user) return null;
    try {
      const ref = doc(db, 'admins', user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;

      const data = snap.data() as any;
      return data.role || null;
    } catch (err) {
      console.error('Error obteniendo rol:', err);
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

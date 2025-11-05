// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';

// Firebase SDK (puro)
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Ajusta la ruta al archivo donde exportaste `auth` y `db`
// ejemplo: export const auth = getAuth(app); export const db = getFirestore(app);
import { auth, db } from '../app.config'; // <-- AJUSTA ESTA RUTA

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user$ = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.user$.asObservable();

  constructor() {
    // Escuchar cambios de estado de autenticación
    onAuthStateChanged(auth, (user) => {
      this.user$.next(user);
    });
  }

  // Retornamos un Observable a partir del Promise de signInWithEmailAndPassword
  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(auth, email, password));
  }

  logout() {
    return from(signOut(auth));
  }

  // Verifica si existe un documento en /admins con id = user.uid
  async isAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    try {
      const ref = doc(db, 'admins', user.uid);
      const snapshot = await getDoc(ref);
      return snapshot.exists();
    } catch (err) {
      console.error('Error verificando admin:', err);
      return false;
    }
  }
}

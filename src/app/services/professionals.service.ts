import { Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../app.config';

export interface Professional {
  id: string;
  uid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  createdAt?: any;
  updatedAt?: any;
  location?: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionalsService {

  constructor() {}

  /**
   * Obtiene todos los profesionales de la colección "professionals"
   */
  async getAllProfessionals(): Promise<Professional[]> {
    try {
      const professionalsRef = collection(db, 'professionals');
      const q = query(professionalsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const professionals: Professional[] = [];
      querySnapshot.forEach((docSnap) => {
        professionals.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Professional);
      });

      console.log(`[ProfessionalsService] ✅ Obtenidos ${professionals.length} profesionales`);
      return professionals;
    } catch (error) {
      console.error('[ProfessionalsService] ❌ Error obteniendo profesionales:', error);
      throw error;
    }
  }

  /**
   * Obtiene un profesional por su ID
   */
  async getProfessionalById(id: string): Promise<Professional | null> {
    try {
      const professionalRef = doc(db, 'professionals', id);
      const professionalSnap = await getDoc(professionalRef);

      if (!professionalSnap.exists()) {
        console.log(`[ProfessionalsService] ❌ Profesional con ID ${id} no encontrado`);
        return null;
      }

      const professional: Professional = {
        id: professionalSnap.id,
        ...professionalSnap.data()
      } as Professional;

      console.log(`[ProfessionalsService] ✅ Profesional obtenido: ${id}`);
      return professional;
    } catch (error) {
      console.error(`[ProfessionalsService] ❌ Error obteniendo profesional ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activa o desactiva un profesional (cambia status entre 'approved' y 'rejected')
   */
  async toggleProfessionalStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      const professionalRef = doc(db, 'professionals', id);
      await updateDoc(professionalRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      console.log(`[ProfessionalsService] ✅ Profesional ${id} estado actualizado a: ${status}`);
    } catch (error) {
      console.error(`[ProfessionalsService] ❌ Error actualizando estado del profesional ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activa un profesional (status 'approved')
   */
  async activateProfessional(id: string): Promise<void> {
    return this.toggleProfessionalStatus(id, 'approved');
  }

  /**
   * Desactiva un profesional (status 'rejected')
   */
  async deactivateProfessional(id: string): Promise<void> {
    return this.toggleProfessionalStatus(id, 'rejected');
  }

  /**
   * Crea un nuevo profesional en la colección "professionals"
   */
  async createProfessional(data: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'> & { uid?: string }): Promise<string> {
    try {
      const professionalsRef = collection(db, 'professionals');
      const docRef = await addDoc(professionalsRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      });
      console.log(`[ProfessionalsService] ✅ Profesional creado con ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('[ProfessionalsService] ❌ Error creando profesional:', error);
      throw error;
    }
  }

  /**
   * Registra profesionales de ejemplo en la colección "professionals"
   */
  async seedExampleProfessionals(): Promise<number> {
    const examples: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        firstName: 'María',
        lastName: 'García López',
        email: 'maria.garcia@ejemplo.com',
        phone: '5551234567',
        specialty: 'Medicina General',
        licenseNumber: 'MG-001234',
        status: 'pending'
      },
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez Sánchez',
        email: 'carlos.rodriguez@ejemplo.com',
        phone: '5552345678',
        specialty: 'Cardiología',
        licenseNumber: 'CAR-005678',
        status: 'approved'
      },
      {
        firstName: 'Ana',
        lastName: 'Martínez Fernández',
        email: 'ana.martinez@ejemplo.com',
        phone: '5553456789',
        specialty: 'Pediatría',
        licenseNumber: 'PED-009012',
        status: 'pending'
      },
      {
        firstName: 'Luis',
        lastName: 'Hernández Torres',
        email: 'luis.hernandez@ejemplo.com',
        phone: '5554567890',
        specialty: 'Dermatología',
        licenseNumber: 'DER-012345',
        status: 'rejected'
      },
      {
        firstName: 'Laura',
        lastName: 'Pérez Ruiz',
        email: 'laura.perez@ejemplo.com',
        phone: '5555678901',
        specialty: 'Psicología',
        licenseNumber: 'PSI-015678',
        status: 'approved'
      }
    ];

    let created = 0;
    for (const item of examples) {
      try {
        await this.createProfessional(item);
        created++;
      } catch (err) {
        console.warn('[ProfessionalsService] No se pudo crear un profesional de ejemplo:', err);
      }
    }
    return created;
  }

  /**
   * Actualiza los datos de un profesional
   */
  async updateProfessional(id: string, data: Partial<Professional>): Promise<void> {
    try {
      const professionalRef = doc(db, 'professionals', id);
      await updateDoc(professionalRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });

      console.log(`[ProfessionalsService] ✅ Profesional ${id} actualizado`);
    } catch (error) {
      console.error(`[ProfessionalsService] ❌ Error actualizando profesional ${id}:`, error);
      throw error;
    }
  }
}

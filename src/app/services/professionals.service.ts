import { Injectable } from '@angular/core';
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';
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
  status?: 'pending' | 'approved' | 'rejected' | string; // Estado del profesional
  createdAt?: any;
  updatedAt?: any;
  location?: any; // Se añadirá en el futuro desde otro frontend
  [key: string]: any; // Para campos adicionales que puedan existir
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionalsService {

  constructor() { }

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
   * Activa o desactiva un profesional
   * Cambia el status entre 'active' e 'inactive'
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
   * Activa un profesional (cambia status a 'active')
   */
  async activateProfessional(id: string): Promise<void> {
    return this.toggleProfessionalStatus(id, 'approved');
  }

  /**
   * Desactiva un profesional (cambia status a 'inactive')
   */
  async deactivateProfessional(id: string): Promise<void> {
    return this.toggleProfessionalStatus(id, 'rejected');
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

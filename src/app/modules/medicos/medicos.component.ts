import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalsService, Professional } from '../../services/professionals.service';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.css'
})
export class MedicosComponent implements OnInit {
  professionals: Professional[] = [];
  loading = false;
  error: string | null = null;
  selectedProfessional: Professional | null = null;
  showProfileModal = false;

  constructor(private professionalsService: ProfessionalsService) {}

  ngOnInit(): void {
    this.loadProfessionals();
  }

  async loadProfessionals(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.professionals = await this.professionalsService.getAllProfessionals();
    } catch (error) {
      console.error('Error cargando profesionales:', error);
      this.error = 'Error al cargar la lista de profesionales. Intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  async viewProfile(professional: Professional): Promise<void> {
    try {
      // Cargar datos completos del profesional
      const fullProfessional = await this.professionalsService.getProfessionalById(professional.id);
      if (fullProfessional) {
        this.selectedProfessional = fullProfessional;
        this.showProfileModal = true;
      }
    } catch (error) {
      console.error('Error cargando perfil del profesional:', error);
      this.error = 'Error al cargar el perfil del profesional.';
    }
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedProfessional = null;
  }

  async toggleStatus(professional: Professional, event: Event): Promise<void> {
    event.stopPropagation(); // Evitar que se abra el modal
    
    const currentStatus = professional.status || 'pending';
    // Si está activo, desactivar; si está inactivo o pendiente, activar
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    const previousStatus = currentStatus;

    // Actualizar estado optimista
    professional.status = newStatus;

    try {
      await this.professionalsService.toggleProfessionalStatus(professional.id, newStatus as 'approved' | 'rejected');
      console.log(`✅ Profesional ${professional.id} estado actualizado a: ${newStatus}`);
      
      // Si el profesional está abierto en el modal, actualizar también ahí
      if (this.selectedProfessional?.id === professional.id) {
        this.selectedProfessional.status = newStatus;
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      // Revertir cambio optimista
      professional.status = previousStatus;
      this.error = 'Error al actualizar el estado del profesional. Intenta nuevamente.';
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-secondary';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'approved':
        return 'Activo';
      case 'rejected':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status || 'Sin estado';
    }
  }

  getFullName(professional: Professional): string {
    const firstName = professional.firstName || '';
    const lastName = professional.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Sin nombre';
  }

  isActive(professional: Professional): boolean {
    return professional.status === 'approved';
  }
}

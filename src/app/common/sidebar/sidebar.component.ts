import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() open = true;
  @Output() closeRequest = new EventEmitter<void>();

  // controlar submenú
  usersOpen = false;

  toggleUsers() {
    this.usersOpen = !this.usersOpen;
  }

  // cerrar en mobile
  requestClose() {
    if (window.innerWidth < 992) {
      this.closeRequest.emit();
    }
  }
}

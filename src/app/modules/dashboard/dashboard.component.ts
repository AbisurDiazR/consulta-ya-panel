import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { SidebarComponent } from '../../common/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}

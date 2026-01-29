// src/app/pages/login/login.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of, firstValueFrom, from } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loading = false;
  error: string | null = null;
  form!: any;
  authService = inject(AuthService);
  roleService = inject(RoleService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  ngOnInit(): void {
    // El loginGuard se encarga de redirigir si ya hay sesión activa
    // Aquí solo inicializamos el componente
  }
  
  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    
    const { email, password } = this.form.value;
    
    this.authService.login(email, password).pipe(
      switchMap((userCredential) => {
        // Después del login exitoso, verificar que el usuario esté en la colección "admins"
        const user = userCredential.user;
        console.log(`[LoginComponent] Usuario autenticado: ${user.email} (UID: ${user.uid})`);
        console.log(`[LoginComponent] Verificando si usuario está en colección "admins"...`);
        
        // Verificar solo la existencia en la colección "admins" (no se requiere campo role)
        return from(this.authService.isAdmin(user));
      }),
      catchError((error) => {
        console.error('[LoginComponent] Error en login:', error);
        this.loading = false;
        
        // Manejar diferentes tipos de errores
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          this.error = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.code === 'auth/invalid-email') {
          this.error = 'El formato del email no es válido.';
        } else if (error.code === 'auth/too-many-requests') {
          this.error = 'Demasiados intentos fallidos. Intenta más tarde.';
        } else {
          this.error = 'Error al iniciar sesión. Intenta nuevamente.';
        }
        
        return of(false);
      })
    ).subscribe(async (isAdmin) => {
      this.loading = false;
      
      // Si el usuario NO está en la colección "admins", denegar acceso
      if (!isAdmin) {
        console.warn(`[LoginComponent] ❌ Usuario NO está en la colección "admins"`);
        this.error = 'No tienes permisos para acceder a este panel. Contacta al administrador.';
        // Cerrar sesión automáticamente
        try {
          await firstValueFrom(this.authService.logout());
        } catch (err) {
          console.error('[LoginComponent] Error al cerrar sesión:', err);
        }
        return;
      }
      
      // Usuario autenticado y existe en la colección "admins", redirigir al dashboard
      // Nota: No se requiere campo "role" para permitir el acceso
      console.log(`[LoginComponent] ✅ Usuario SÍ está en la colección "admins"`);
      console.log(`[LoginComponent] ✅ Login exitoso, redirigiendo a dashboard...`);
      this.router.navigate(['/dashboard']);
    });
  }
}

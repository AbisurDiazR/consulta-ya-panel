// src/app/pages/login/login.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  @Output() loginAttempt = new EventEmitter<{
    email: string;
    password: string;
  }>();
  loading = false;
  error!: any;

  form!: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
  }

  ngOnInit(): void {}

  // getters for template
  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }

  /**
   * onSubmit:
   * - Emite loginAttempt para que puedas conectar tu servicio más tarde.
   * - Mientras tanto, usa simulateLogin() para maqueta local (puedes eliminarla).
   *
   * Cuando tengas tu AuthService, reemplaza la llamada a simulateLogin por:
   *   await this.authService.login(email, password);
   *   const isAdmin = await this.authService.isAdmin(user);
   *   if (!isAdmin) { await this.authService.logout(); show error... }
   */
  async onSubmit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.email.value;
    const password = this.password.value;

    // Emitimos por si quieres manejar login desde un componente padre
    this.loginAttempt.emit({ email, password });

    // Simulación de autenticación (temporal)
    this.loading = true;
    try {
      const result = await this.simulateLogin(email, password);
      if (!result.success) {
        this.error = result.message;
        return;
      }
      // Si se autenticó correctamente, navega al dashboard (puedes cambiar)
      await this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = 'Error de conexión. Intenta de nuevo.';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  /** Método simulado: reemplázalo con la llamada real a AuthService */
  private simulateLogin(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo: solo permite el superadmin demo
        if (
          email === 'abisurdiazramirez@gmail.com' &&
          password === 'demo1234'
        ) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            message: 'Credenciales inválidas (modo demo).',
          });
        }
      }, 900);
    });
  }

  /** Pequeña ayuda para demo o pruebas */
  onDemo() {
    this.form.setValue({
      email: 'abisurdiazramirez@gmail.com',
      password: 'demo1234',
      remember: true,
    });
  }
}

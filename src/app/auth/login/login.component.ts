// src/app/pages/login/login.component.ts
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loading = false;
  error!: any;
  form!: any;
  authService = inject(AuthService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  ngOnInit(): void {}
  
  async onSubmit() {
    const {email, password} = this.form.value;
    this.authService.login(email, password).subscribe((res) => {
      console.log('Login successful:', res);
    });
  }
}

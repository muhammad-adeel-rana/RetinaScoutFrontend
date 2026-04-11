import { Component } from '@angular/core';
import { LoginForm } from '../../components/login-form/login-form';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  template: `
    <div class="auth-layout">
      <div class="auth-form-side">
        <app-login-form></app-login-form>
      </div>
      <div class="auth-image-side">
        <div class="auth-img-ph"></div>
      </div>
    </div>
  `,
  styleUrl: './login-page.scss',
})
export class LoginPage {}

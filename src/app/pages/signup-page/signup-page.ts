import { Component } from '@angular/core';
import { SignupForm } from '../../components/signup-form/signup-form';

@Component({
  selector: 'app-signup-page',
  imports: [SignupForm],
  template: `
    <div class="auth-layout">
      <div class="auth-form-side">
        <app-signup-form></app-signup-form>
      </div>
      <div class="auth-image-side">
        <div class="auth-img-ph"></div>
      </div>
    </div>
  `,
  styleUrl: './signup-page.scss',
})
export class SignupPage {}

import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  imports: [RouterLink, FormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  showPassword = signal(false);
  keepSignedIn = false;
  passwordError = false;

  form = { email: '', password: '' };

  constructor(private router: Router) {}

  togglePassword() { this.showPassword.update(v => !v); }

  onSubmit() {
    // Simulate ophthalmologist login — route to dashboard
    this.router.navigate(['/dashboard']);
  }
}

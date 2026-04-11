import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-form',
  imports: [RouterLink, FormsModule],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  showPassword = signal(false);
  rememberMe = false;

  form = {
    designation: '',
    hospitalName: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
  };

  constructor(private router: Router) {}

  togglePassword() { this.showPassword.update(v => !v); }

  onSubmit() {
    if (this.form.designation === 'ophthalmologist') {
      this.router.navigate(['/dashboard']);
    }
  }
}

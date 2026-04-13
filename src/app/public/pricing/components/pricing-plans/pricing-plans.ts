import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-pricing-plans',
  imports: [],
  templateUrl: './pricing-plans.html',
  styleUrl: './pricing-plans.scss',
})
export class PricingPlans {
  billingCycle = signal<'monthly' | 'annual'>('monthly');

  setBilling(cycle: 'monthly' | 'annual') {
    this.billingCycle.set(cycle);
  }
}

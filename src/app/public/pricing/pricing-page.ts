
import { Component } from '@angular/core';
import { PricingPlans } from './components/pricing-plans/pricing-plans';
import { PricingFaq } from './components/pricing-faq/pricing-faq';

@Component({
  selector: 'app-pricing-page',
  imports: [PricingPlans, PricingFaq],
  template: `
    <app-pricing-plans></app-pricing-plans>
    <app-pricing-faq></app-pricing-faq>
  `,
})
export class PricingPage {}

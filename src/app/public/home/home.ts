import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { BookingBar } from './components/booking-bar/booking-bar';
import { Features } from './components/features/features';
import { About } from './components/about/about';
import { Workflow } from './components/workflow/workflow';
import { Testimonials } from './components/testimonials/testimonials';
import { Faq } from './components/faq/faq';
import { ContactBanner } from './components/contact-banner/contact-banner';

@Component({
  selector: 'app-home',
  imports: [Hero, BookingBar, Features, About, Workflow, Testimonials, Faq, ContactBanner],
  template: `
    <main>
      <app-hero></app-hero>
      <app-booking-bar></app-booking-bar>
      <app-features></app-features>
      <app-about></app-about>
      <app-workflow></app-workflow>
      <app-testimonials></app-testimonials>
      <app-faq></app-faq>
      <app-contact-banner></app-contact-banner>
    </main>
  `,
})
export class Home {}

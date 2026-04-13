import { Component } from '@angular/core';
import { AboutHero } from './components/about-hero/about-hero';
import { AboutWhyChoose } from './components/about-why-choose/about-why-choose';
import { AboutHowItWorks } from './components/about-how-it-works/about-how-it-works';
import { AboutSplitCta } from './components/about-split-cta/about-split-cta';
import { AboutWorkWithUs } from './components/about-work-with-us/about-work-with-us';
import { AboutContact } from './components/about-contact/about-contact';

@Component({
  selector: 'app-about-page',
  imports: [
    AboutHero,
    AboutWhyChoose,
    AboutHowItWorks,
    AboutSplitCta,
    AboutWorkWithUs,
    AboutContact,
  ],
  templateUrl: './about-page.html',
})
export class AboutPage {}

import { Hero } from '../components/sections/Hero';
import { WhyRelyOnUs } from '../components/sections/WhyRelyOnUs';
import { Services } from '../components/sections/Services';
import { Stats } from '../components/sections/Stats';
import { Testimonials } from '../components/sections/Testimonials';
import { Contact } from '../components/sections/Contact';

export function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <WhyRelyOnUs />
      <Services />
      <Testimonials />
      <Contact />
    </main>
  );
}

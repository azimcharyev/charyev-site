import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Cases } from './components/Cases';
import { CaseDetail } from './components/CaseDetail';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useReveal } from './hooks/useReveal';

export default function App() {
  if (window.location.pathname.endsWith('/case.html')) return <CaseDetail />;
  if (window.location.pathname.endsWith('/privacy.html')) return <PrivacyPolicy />;

  return <Home />;
}

function Home() {
  /* useSmoothScroll работает только в горизонтальной ориентации. На мобильных
     оставляем обычный нативный скролл без автоматической доводки секций. */
  useSmoothScroll();
  useReveal();

  return (
    <main className="page">
      <Hero />
      <Services />
      <Cases />
      <Footer />
    </main>
  );
}

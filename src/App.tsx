import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Cases } from './components/Cases';
import { CaseDetail } from './components/CaseDetail';
import { Footer } from './components/Footer';
import { useBlockSnap } from './hooks/useBlockSnap';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useReveal } from './hooks/useReveal';

export default function App() {
  if (window.location.pathname.endsWith('/case.html')) return <CaseDetail />;

  return <Home />;
}

function Home() {
  /* useSmoothScroll — десктоп: Lenis и выравнивание секций.
     useBlockSnap — портрет: доводка до ближайшего блока, включая каждую
     карточку кейса. Друг друга не задевают, каждый сам проверяет ориентацию. */
  useSmoothScroll();
  useBlockSnap();
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

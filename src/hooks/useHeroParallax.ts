import { useEffect, type RefObject } from 'react';

const POINTER_EASING = 0.075;
const SCROLL_EASING = 0.11;
/** Доля ухода Hero, к которой фоновое свечение должно погаснуть полностью. */
const GLOW_END = 0.8;

export function useHeroParallax(heroRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const precisePointer = window.matchMedia('(pointer: fine)').matches;
    if (reducedMotion) return;

    const cards = [...hero.querySelectorAll<HTMLElement>('.hero__media-card')];
    if (!cards.length) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScroll = 0;
    let currentScroll = 0;
    let frame = 0;
    let isActive = true;

    /* Высота Hero меняется только при ресайзе, а чтение offsetHeight внутри
       render() заставляло браузер пересчитывать вёрстку каждый кадр — прямо
       посреди анимации. Держим её в переменной и обновляем по событию. */
    let layoutScale = hero.offsetHeight / 968;

    const render = () => {
      currentX += (targetX - currentX) * POINTER_EASING;
      currentY += (targetY - currentY) * POINTER_EASING;
      currentScroll += (targetScroll - currentScroll) * SCROLL_EASING;

      /* Тем же прогрессом гасится фоновое свечение — см. .hero::before/::after.
         Пишем его сюда, а не отдельным слушателем, чтобы свет уходил кадр в
         кадр с карточками, а не своим темпом.

         Линейное затухание выглядело обрывом: свет заметно тускнел уже от
         первого движения колеса. Здесь smoothstep — держится, пока Hero в
         кадре, потом растворяется без ступеньки. GLOW_END < 1, чтобы к концу
         секции свет успел сойти на нет, а не гас в последний момент. */
      const t = Math.min(1, currentScroll / GLOW_END);
      hero.style.setProperty('--hero-glow', (1 - t * t * (3 - 2 * t)).toFixed(4));

      cards.forEach((card) => {
        const depth = Number(card.dataset.pointerDepth) || 30;
        const scrollDepth = Number(card.dataset.scrollDepth) || -700;
        card.style.setProperty('--parallax-x', `${currentX * depth * layoutScale}px`);
        card.style.setProperty('--parallax-y', `${currentY * depth * 0.8 * layoutScale}px`);
        card.style.setProperty('--parallax-scroll-y', `${currentScroll * scrollDepth * layoutScale}px`);
      });

      if (
        Math.abs(targetX - currentX) > 0.002
        || Math.abs(targetY - currentY) > 0.002
        || Math.abs(targetScroll - currentScroll) > 0.0005
      ) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const requestRender = () => {
      if (isActive && !frame) frame = requestAnimationFrame(render);
    };

    const updateScrollTarget = () => {
      if (!isActive) return;
      const bounds = hero.getBoundingClientRect();
      targetScroll = Math.max(0, Math.min(1, -bounds.top / bounds.height));
      requestRender();
    };

    const updateLayoutScale = () => {
      layoutScale = hero.offsetHeight / 968;
      updateScrollTarget();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isActive) return;
      targetX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      targetY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      requestRender();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      requestRender();
    };

    if (precisePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('blur', onPointerLeave);
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
    }
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', updateLayoutScale);

    /* После ухода Hero с экрана движения указателя раньше продолжали писать
       transform во все 14 карточек. Заодно постоянный will-change удерживал
       для них отдельные GPU-слои до самого футера. Останавливаем расчёты и
       освобождаем слои, пока секция не вернётся к экрану. */
    const activityObserver = new IntersectionObserver(
      ([entry]) => {
        isActive = entry.isIntersecting;
        cards.forEach((card) => {
          if (isActive) card.style.willChange = 'transform';
          else card.style.removeProperty('will-change');
        });

        if (isActive) {
          updateScrollTarget();
        } else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: '120px 0px', threshold: 0 },
    );
    cards.forEach((card) => { card.style.willChange = 'transform'; });
    activityObserver.observe(hero);
    updateScrollTarget();

    return () => {
      activityObserver.disconnect();
      if (precisePointer) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('blur', onPointerLeave);
        document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      }
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', updateLayoutScale);
      if (frame) cancelAnimationFrame(frame);
      hero.style.removeProperty('--hero-glow');
      cards.forEach((card) => {
        card.style.removeProperty('--parallax-x');
        card.style.removeProperty('--parallax-y');
        card.style.removeProperty('--parallax-scroll-y');
        card.style.removeProperty('will-change');
      });
    };
  }, [heroRef]);
}

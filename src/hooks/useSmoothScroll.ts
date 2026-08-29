import { useEffect } from 'react';
import Lenis from 'lenis';

/* Две с лишним секунды инерции воспринимались как задержка ввода. Оставляем
   мягкость, но возвращаем колесу и трекпаду быстрый отклик. */
const DURATION = 1.15;
const MAX_TILT = 14;
const ALIGN_DELAY = 360;
const ALIGN_DURATION = .8;
const ALIGN_EPSILON = 1;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export function useSmoothScroll() {
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('.page > section, .page > footer')];
    if (sections.length < 2 || window.matchMedia('(orientation: portrait)').matches) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionTargets = sections.map((section) =>
      section.querySelector<HTMLElement>('.hero__content, .services__shell'),
    );

    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      duration: reducedMotion ? 0 : DURATION,
      easing: easeOutCubic,
      autoRaf: true,
    });

    let hashFrame = 0;
    let initialFrame = 0;
    let alignTimer = 0;
    let activeSectionIndex = -1;
    const renderedTilts: Array<number | null> = sections.map(() => null);
    const sectionNames = sections.map(
      (section, index) => section.id || section.classList.item(0) || `section-${index + 1}`,
    );

    const getSectionDestination = (section: HTMLElement) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = window.scrollY + rect.top + rect.height / 2;
      return Math.max(0, Math.min(lenis.limit, sectionCenter - window.innerHeight / 2));
    };

    const getNearestSectionIndex = (scrollPosition: number, rects?: DOMRect[]) => {
      const viewportCenter = scrollPosition + window.innerHeight / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const rect = rects?.[index] ?? section.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;
        if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
          nearestIndex = index;
          nearestDistance = -1;
          return;
        }
        if (nearestDistance === -1) return;

        const sectionCenter = sectionTop + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    };

    const updateActiveSection = (rects: DOMRect[]) => {
      const nearestIndex = getNearestSectionIndex(window.scrollY, rects);
      if (nearestIndex === activeSectionIndex) return;

      activeSectionIndex = nearestIndex;
      sections.forEach((section, index) => {
        section.toggleAttribute('data-active', index === nearestIndex);
      });
      document.documentElement.dataset.activeSection = sectionNames[nearestIndex];
    };

    const alignNearestSection = () => {
      alignTimer = 0;
      const nearestIndex = getNearestSectionIndex(lenis.targetScroll);
      if (sections[nearestIndex].hasAttribute('data-free-scroll')) return;
      const destination = getSectionDestination(sections[nearestIndex]);

      if (Math.abs(destination - lenis.targetScroll) <= ALIGN_EPSILON) return;

      lenis.scrollTo(destination, {
        duration: reducedMotion ? 0 : ALIGN_DURATION,
        easing: easeInOutSine,
        immediate: reducedMotion,
        force: true,
      });
    };

    const scheduleAlignment = () => {
      window.clearTimeout(alignTimer);
      alignTimer = window.setTimeout(alignNearestSection, ALIGN_DELAY);
    };

    const unsubscribeVirtualScroll = lenis.on('virtual-scroll', ({ deltaX, deltaY, event }) => {
      if (event.ctrlKey || Math.abs(deltaY) <= Math.abs(deltaX)) return;
      scheduleAlignment();
    });

    const clearTargetMotion = (target: HTMLElement | null, index: number) => {
      if (!target || renderedTilts[index] === null) return;
      target.style.removeProperty('transform');
      target.style.removeProperty('transform-origin');
      target.style.removeProperty('will-change');
      renderedTilts[index] = null;
    };

    const setTargetMotion = (target: HTMLElement | null, tilt: number, index: number) => {
      if (!target) return;
      const renderedTilt = renderedTilts[index];
      if (renderedTilt !== null && Math.abs(renderedTilt - tilt) < 0.004) return;

      target.style.transformOrigin = 'center center';
      target.style.willChange = 'transform';
      target.style.transform = `perspective(900px) translate3d(0, ${tilt * 1.15}px, 0) rotateX(${tilt}deg)`;
      renderedTilts[index] = tilt;
    };

    const updateSectionMotion = (rects: DOMRect[]) => {
      if (reducedMotion) {
        motionTargets.forEach(clearTargetMotion);
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      sections.forEach((_, index) => {
        const rect = rects[index];
        const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;
        const target = motionTargets[index] ?? null;

        if (Math.abs(distance) > 1.2) {
          clearTargetMotion(target, index);
          return;
        }

        const sectionPhase = Math.max(-1, Math.min(1, distance));
        const tilt = MAX_TILT * sectionPhase;

        if (index === 0 && window.scrollY < 0.5 && Math.abs(tilt) < 0.025) {
          clearTargetMotion(target, index);
          return;
        }

        setTargetMotion(target, tilt, index);
      });
    };

    /* Lenis сам вызывает этот обработчик только при реальном изменении
       прокрутки. Раньше отдельный бесконечный rAF дважды измерял все секции
       даже в полном покое, а после записи transform второй набор чтений ещё
       и принудительно пересчитывал layout. Теперь геометрию читаем один раз
       за фактический кадр скролла и передаём один снимок обеим функциям. */
    const updateScrollState = () => {
      const rects = sections.map((section) => section.getBoundingClientRect());
      updateSectionMotion(rects);
      updateActiveSection(rects);
    };

    const unsubscribeScroll = lenis.on('scroll', updateScrollState);
    const onResize = () => updateScrollState();
    window.addEventListener('resize', onResize);

    const hashTarget = sections.find((section) => `#${section.id}` === window.location.hash);
    if (hashTarget) {
      hashFrame = requestAnimationFrame(() => {
        lenis.scrollTo(hashTarget, { immediate: true, force: true });
      });
    }

    initialFrame = requestAnimationFrame(updateScrollState);

    return () => {
      unsubscribeVirtualScroll();
      unsubscribeScroll();
      window.removeEventListener('resize', onResize);
      window.clearTimeout(alignTimer);
      cancelAnimationFrame(hashFrame);
      cancelAnimationFrame(initialFrame);
      motionTargets.forEach(clearTargetMotion);
      sections.forEach((section) => section.removeAttribute('data-active'));
      delete document.documentElement.dataset.activeSection;
      lenis.destroy();
    };
  }, []);
}

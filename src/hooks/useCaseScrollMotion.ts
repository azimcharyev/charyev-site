import { useEffect, useState } from 'react';
import Lenis from 'lenis';

const DURATION = 2.25;
const MAX_TILT = 14;
const MOTION_DAMPING = 8;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Ориентация по подписке, а не разовой проверкой: иначе после поворота
    телефона состояние осталось бы от предыдущей раскладки. */
function usePortrait() {
  const [portrait, setPortrait] = useState(() => window.matchMedia('(orientation: portrait)').matches);

  useEffect(() => {
    const query = window.matchMedia('(orientation: portrait)');
    const sync = () => setPortrait(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return portrait;
}

export function useCaseScrollMotion() {
  const portrait = usePortrait();

  useEffect(() => {
    /* На мобильном страница кейса — обычный столбец кадров: ни наклонов, ни
       липкого сайдбара макет не предполагает. А Lenis здесь означал бы
       покадровый цикл на телефоне — ровно та цена, от которой мы уходили в
       остальных блоках ради плавности. */
    if (portrait) return;

    const cards = [...document.querySelectorAll<HTMLElement>('.case-page__media-row')];
    const casePage = document.querySelector<HTMLElement>('.case-page');
    const sidebar = document.querySelector<HTMLElement>('.case-page__sidebar');
    if (!cards.length || !casePage || !sidebar) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      duration: reducedMotion ? 0 : DURATION,
      easing: easeOutCubic,
    });

    let animationFrame = 0;
    let lastFrameTime = 0;
    let stickyTop = 0;
    let pagePaddingBottom = 0;
    let settleDistance = 0;
    const currentTilts = cards.map(() => 0);
    const renderedTilts: Array<number | null> = cards.map(() => null);

    const refreshEndGeometry = () => {
      const pageStyles = window.getComputedStyle(casePage);
      const sidebarStyles = window.getComputedStyle(sidebar);
      stickyTop = Number.parseFloat(sidebarStyles.top) || 0;
      pagePaddingBottom = Number.parseFloat(pageStyles.paddingBottom) || 0;
      settleDistance = Math.max(80, window.innerHeight * 0.16);
    };

    const clearCardMotion = (card: HTMLElement, index: number) => {
      if (renderedTilts[index] === null) return;
      card.style.removeProperty('transform');
      card.style.removeProperty('transform-origin');
      card.style.removeProperty('will-change');
      renderedTilts[index] = null;
    };

    const setCardMotion = (card: HTMLElement, tilt: number, index: number) => {
      const renderedTilt = renderedTilts[index];
      if (renderedTilt !== null && Math.abs(renderedTilt - tilt) < 0.004) return;

      card.style.transformOrigin = 'center center';
      card.style.willChange = 'transform';
      card.style.transform = `perspective(900px) translate3d(0, ${tilt * 1.15}px, 0) rotateX(${tilt}deg)`;
      renderedTilts[index] = tilt;
    };

    const updateCards = (frameEasing: number) => {
      const viewportCenter = window.innerHeight / 2;
      const pageRect = casePage.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      const remainingStickyDistance = pageRect.bottom - pagePaddingBottom - stickyTop - sidebarRect.height;
      const reachedStickyEnd = remainingStickyDistance <= 0;
      const endMotionScale = Math.max(0, Math.min(1, remainingStickyDistance / settleDistance));

      cards.forEach((card, index) => {
        if (reducedMotion) {
          clearCardMotion(card, index);
          return;
        }

        if (reachedStickyEnd) {
          currentTilts[index] = 0;
          clearCardMotion(card, index);
          return;
        }

        const rect = card.getBoundingClientRect();
        const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;

        if (Math.abs(distance) > 1.35) {
          currentTilts[index] = Math.sign(distance) * MAX_TILT;
          clearCardMotion(card, index);
          return;
        }

        const targetTilt = MAX_TILT * Math.max(-1, Math.min(1, distance)) * endMotionScale;
        currentTilts[index] += (targetTilt - currentTilts[index]) * frameEasing;

        if (Math.abs(targetTilt - currentTilts[index]) < 0.004) {
          currentTilts[index] = targetTilt;
        }

        setCardMotion(card, currentTilts[index], index);
      });
    };

    const runFrame = (time: number) => {
      lenis.raf(time);
      const deltaSeconds = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 1 / 60;
      lastFrameTime = time;
      const frameEasing = 1 - Math.exp(-MOTION_DAMPING * deltaSeconds);
      updateCards(frameEasing);
      animationFrame = requestAnimationFrame(runFrame);
    };

    refreshEndGeometry();
    window.addEventListener('resize', refreshEndGeometry);
    animationFrame = requestAnimationFrame(runFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', refreshEndGeometry);
      cards.forEach(clearCardMotion);
      lenis.destroy();
    };
  }, [portrait]);
}

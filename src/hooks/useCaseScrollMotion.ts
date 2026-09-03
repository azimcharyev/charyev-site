import { useEffect, useState } from 'react';

const MAX_TILT = 14;

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
    if (!portrait) return;

    const nav = document.querySelector<HTMLElement>('.case-page__nav');
    const footer = document.querySelector<HTMLElement>('.case-site > .footer');
    if (!nav || !footer) return;

    let animationFrame = 0;
    let renderedOpacity = -1;
    let renderedScale = -1;
    let controlsHidden = false;

    const updateNavExit = () => {
      animationFrame = 0;
      const navHeight = nav.getBoundingClientRect().height;
      const footerTop = footer.getBoundingClientRect().top;
      /* Анимация начинается ровно при появлении верхней кромки футера и
         проходит за расстояние примерно в полторы высоты острова. */
      const exitDistance = Math.max(navHeight * 1.5, window.innerHeight * 0.14);
      const progress = Math.max(0, Math.min(1, (window.innerHeight - footerTop) / exitDistance));
      const easedProgress = progress * progress * (3 - 2 * progress);
      const opacity = 1 - easedProgress;
      const scale = 1 - easedProgress * 0.32;

      if (Math.abs(renderedOpacity - opacity) > 0.002) {
        nav.style.setProperty('--case-nav-exit-opacity', opacity.toFixed(4));
        renderedOpacity = opacity;
      }
      if (Math.abs(renderedScale - scale) > 0.002) {
        nav.style.setProperty('--case-nav-exit-scale', scale.toFixed(4));
        renderedScale = scale;
      }

      const shouldHideControls = progress >= 0.98;
      if (controlsHidden !== shouldHideControls) {
        nav.toggleAttribute('inert', shouldHideControls);
        controlsHidden = shouldHideControls;
      }
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateNavExit);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      nav.style.removeProperty('--case-nav-exit-opacity');
      nav.style.removeProperty('--case-nav-exit-scale');
      nav.removeAttribute('inert');
    };
  }, [portrait]);

  useEffect(() => {
    /* На мобильном страница кейса — обычный столбец кадров: ни наклонов, ни
       липкого сайдбара макет не предполагает. */
    if (portrait) return;

    const cards = [...document.querySelectorAll<HTMLElement>('.case-page__media-row')];
    const casePage = document.querySelector<HTMLElement>('.case-page');
    const sidebar = document.querySelector<HTMLElement>('.case-page__sidebar');
    if (!cards.length || !casePage || !sidebar) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame = 0;
    let stickyTop = 0;
    let pagePaddingBottom = 0;
    let settleDistance = 0;
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

    const updateCards = () => {
      animationFrame = 0;
      const viewportCenter = window.innerHeight / 2;
      const pageRect = casePage.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      /* Всю геометрию читаем до первой записи transform. Раньше чтение и
         запись чередовались по карточкам, вынуждая браузер пересчитывать
         layout несколько раз внутри одного кадра. */
      const cardRects = cards.map((card) => card.getBoundingClientRect());
      const remainingStickyDistance = pageRect.bottom - pagePaddingBottom - stickyTop - sidebarRect.height;
      const reachedStickyEnd = remainingStickyDistance <= 0;
      const endMotionScale = Math.max(0, Math.min(1, remainingStickyDistance / settleDistance));

      cards.forEach((card, index) => {
        if (reducedMotion) {
          clearCardMotion(card, index);
          return;
        }

        if (reachedStickyEnd) {
          clearCardMotion(card, index);
          return;
        }

        const rect = cardRects[index];
        const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;

        if (Math.abs(distance) > 1.35) {
          clearCardMotion(card, index);
          return;
        }

        const tilt = MAX_TILT * Math.max(-1, Math.min(1, distance)) * endMotionScale;
        setCardMotion(card, tilt, index);
      });
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateCards);
    };

    const onResize = () => {
      refreshEndGeometry();
      scheduleUpdate();
    };

    refreshEndGeometry();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', onResize);
    scheduleUpdate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', onResize);
      cards.forEach(clearCardMotion);
    };
  }, [portrait]);
}

import { useEffect } from 'react';

const MAX_TILT = 8;
const DAMPING = 7;
const SETTLE_DELAY = 160;

/**
 * Лёгкий наклон плиток кейсов по мере ухода из центра экрана. Только на
 * десктопе: в портрете он давал ровно то, что раздражало — карточка кренилась
 * на прокрутке и отыгрывала обратно на остановке. Там вместо него доводка до
 * ближайшего блока, см. useBlockSnap.
 */
export function useGalleryMotion(refreshKey: string) {
  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let teardown: (() => void) | null = null;

    const start = () => {
      const cards = [...document.querySelectorAll<HTMLElement>('.case-tile')];
      if (!cards.length) return null;

      let frame = 0;
      let lastTime = 0;
      let lastScrollTime = 0;
      let willChangeSet = false;
      const tilts = cards.map(() => 0);
      /* Последнее записанное значение. Наклон затухает по экспоненте и в конце
         меняется на тысячные доли градуса — без этой проверки в стиль каждый
         кадр уезжала новая строка, и браузер заново собирал слой ради сдвига,
         которого не видно. */
      const written = cards.map(() => Number.NaN);

      const render = (time: number) => {
        const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60;
        lastTime = time;
        const easing = 1 - Math.exp(-DAMPING * delta);
        const viewportCenter = window.innerHeight / 2;
        const viewportHeight = window.innerHeight;

        /* Сначала читаем геометрию всех карточек, только потом пишем стили.
           Вперемешку браузер вынужден сбрасывать стили перед каждым следующим
           getBoundingClientRect — по одному принудительному пересчёту на
           карточку за кадр. */
        const distances = cards.map((card) => {
          const bounds = card.getBoundingClientRect();
          return (bounds.top + bounds.height / 2 - viewportCenter) / viewportHeight;
        });

        if (!willChangeSet) {
          willChangeSet = true;
          cards.forEach((card) => { card.style.willChange = 'rotate'; });
        }

        let largestDifference = 0;
        cards.forEach((card, index) => {
          const target = MAX_TILT * Math.max(-1, Math.min(1, distances[index]));
          largestDifference = Math.max(largestDifference, Math.abs(target - tilts[index]));
          tilts[index] += (target - tilts[index]) * easing;

          /* Сотых долей градуса хватает: при высоте плитки 716 единиц 0,01°
             — это меньше десятой доли пикселя по краю. */
          const tilt = Math.round(tilts[index] * 100) / 100;
          if (tilt === written[index]) return;
          written[index] = tilt;
          card.style.rotate = `x ${tilt}deg`;
          card.style.translate = `0 ${(tilt * .7).toFixed(2)}px`;
        });

        if (largestDifference > .01 || time - lastScrollTime < SETTLE_DELAY) {
          frame = requestAnimationFrame(render);
        } else {
          frame = 0;
          /* will-change снимаем по простою: иначе он держит по слою
             композитора на каждую плитку всё время. */
          willChangeSet = false;
          cards.forEach((card) => card.style.removeProperty('will-change'));
        }
      };

      const requestRender = () => {
        lastScrollTime = performance.now();
        if (!frame) frame = requestAnimationFrame(render);
      };

      window.addEventListener('scroll', requestRender, { passive: true });
      requestRender();

      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', requestRender);
        cards.forEach((card) => {
          card.style.removeProperty('rotate');
          card.style.removeProperty('translate');
          card.style.removeProperty('will-change');
        });
      };
    };

    /* Ориентацию проверяем не один раз при монтировании, а по подписке: иначе
       после поворота телефона наклон либо пропадал до перезагрузки, либо
       оставался включённым там, где не нужен. */
    const sync = () => {
      teardown?.();
      teardown = null;
      if (portrait.matches || reducedMotion.matches) return;
      teardown = start();
    };

    sync();
    portrait.addEventListener('change', sync);

    return () => {
      portrait.removeEventListener('change', sync);
      teardown?.();
    };
  }, [refreshKey]);
}

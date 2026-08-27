import { useEffect } from 'react';

const MAX_TILT = 8;
const DAMPING = 7;
const SETTLE_DELAY = 160;

/* Наклон обновляем тридцать раз в секунду, а не шестьдесят.
   Каждая запись поворота заставляет заново растеризовать плитку: она лежит в
   трёхмерном контексте (perspective у .cases__grid), проекция на каждый кадр
   другая, и переиспользовать готовый слой нельзя. Плиток шесть, а во вкладке
   «Фото» — двенадцать, и вместе они занимают около 70% экрана. Вдвое реже
   писать — вдвое меньше этой работы. Само движение медленное и мелкое,
   разницы между 30 и 60 кадрами на нём не видно. */
const FRAME_INTERVAL = 1000 / 30;

/* Насколько заранее будить наклон. Запас нужен, чтобы к моменту появления
   секции плитки уже стояли под верным углом. */
const NEAR_VIEWPORT = '25%';

/**
 * Лёгкий наклон плиток кейсов по мере ухода из центра экрана. Только на
 * десктопе: в портрете он давал ровно то, что раздражало — карточка кренилась
 * на прокрутке и отыгрывала обратно на остановке. Там вместо него доводка до
 * ближайшего блока, см. useBlockSnap.
 *
 * Работает только пока секция кейсов рядом с экраном. Раньше цикл читал
 * геометрию всех плиток на каждое событие прокрутки по всей странице — и в
 * Hero, и в тарифах. Это не только лишняя работа: чтение геометрии потомка
 * заставляет браузер раскрыть секцию, отложенную через content-visibility.
 * Замер показывал, что на самом верху страницы плитка уже сообщает высоту
 * 606 px, то есть вся экономия от content-visibility пропадала.
 */
export function useGalleryMotion(refreshKey: string) {
  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let teardown: (() => void) | null = null;

    const start = () => {
      const section = document.querySelector<HTMLElement>('.cases');
      const cards = [...document.querySelectorAll<HTMLElement>('.case-tile')];
      if (!section || !cards.length) return null;

      let frame = 0;
      let lastTime = 0;
      let lastRender = 0;
      let lastScrollTime = 0;
      let willChangeSet = false;
      let listening = false;
      /* Первый кадр после появления секции ставит углы сразу, без затухания:
         иначе плитки въезжали бы в экран ровными и доворачивались на глазах. */
      let snapToTarget = true;
      const tilts = cards.map(() => 0);
      /* Последнее записанное значение. Наклон затухает по экспоненте и в конце
         меняется на тысячные доли градуса — без этой проверки в стиль каждый
         кадр уезжала новая строка, и браузер заново собирал слой ради сдвига,
         которого не видно. */
      const written = cards.map(() => Number.NaN);

      const dropWillChange = () => {
        if (!willChangeSet) return;
        willChangeSet = false;
        cards.forEach((card) => card.style.removeProperty('will-change'));
      };

      const render = (time: number) => {
        /* Пропускаем лишние кадры до того, как что-либо прочитаем или
           запишем: пропущенный кадр не должен стоить вообще ничего. */
        if (time - lastRender < FRAME_INTERVAL - 1) {
          frame = requestAnimationFrame(render);
          return;
        }

        const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60;
        lastTime = time;
        lastRender = time;
        const easing = snapToTarget ? 1 : 1 - Math.exp(-DAMPING * delta);
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

        snapToTarget = false;

        if (largestDifference > .01 || time - lastScrollTime < SETTLE_DELAY) {
          frame = requestAnimationFrame(render);
        } else {
          frame = 0;
          /* will-change снимаем по простою: иначе он держит по слою
             композитора на каждую плитку всё время. */
          dropWillChange();
        }
      };

      const requestRender = () => {
        if (!listening) return;
        lastScrollTime = performance.now();
        if (!frame) frame = requestAnimationFrame(render);
      };

      const enter = () => {
        if (listening) return;
        listening = true;
        snapToTarget = true;
        lastTime = 0;
        lastRender = 0;
        window.addEventListener('scroll', requestRender, { passive: true });
        requestRender();
      };

      const leave = () => {
        if (!listening) return;
        listening = false;
        window.removeEventListener('scroll', requestRender);
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        dropWillChange();
        /* Углы оставляем как есть: они уже записаны, ничего не читают и не
           анимируются. При возвращении первый же кадр поставит верные. */
      };

      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) enter(); else leave(); },
        { rootMargin: `${NEAR_VIEWPORT} 0px ${NEAR_VIEWPORT} 0px`, threshold: 0 },
      );
      observer.observe(section);

      return () => {
        observer.disconnect();
        leave();
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

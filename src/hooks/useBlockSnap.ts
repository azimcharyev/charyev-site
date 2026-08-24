import { useEffect } from 'react';

/** Тишина после последнего события прокрутки, которую считаем остановкой. */
const SETTLE_DELAY = 160;
/** Длительность доводки. Совпадает с выравниванием секций на десктопе. */
const DURATION = 1150;
/** Ближе этого считаем, что уже выровнено, и не дёргаем страницу. */
const ALIGN_EPSILON = 6;
/**
 * Насколько блок-победитель должен занимать экран, чтобы доводка включилась.
 * Ниже порога отпускаем — иначе у самого верха и низа страницы, где доехать
 * до цели мешает край документа, доводка дёргала бы впустую.
 */
const MIN_VIEWPORT_SHARE = 0.3;
/**
 * Второй порог — для блоков ниже трети экрана. Горизонтальные плитки в
 * категории «Видео» всего 194 px при экране 812: под общий порог они не
 * проходили никогда, и доводка на этой вкладке не включалась вовсе. Такой блок
 * считается наведённым, когда видно больше половины его самого.
 */
const MIN_SELF_SHARE = 0.6;

/** Та же кривая, что у выравнивания секций в useSmoothScroll. */
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Доводит страницу до ближайшего блока — того, что занимает больше места на
 * экране. Работает в портрете и на всём подряд: Hero, услуги, каждая карточка
 * кейса по отдельности, футер.
 *
 * Зачем отдельный хук: на десктопе тем же занимается useSmoothScroll, но он
 * целиком выключен в портрете — там нет ни Lenis, ни выравнивания секций.
 *
 * Анимация своя, а не `behavior: 'smooth'`: у родной прокрутки своя
 * длительность, которую нельзя настроить, и она заметно резче. Покадровый цикл
 * здесь живёт только во время самой доводки, поэтому телефону он не стоит
 * ничего в покое — в отличие от полноценного перехвата прокрутки.
 */
export function useBlockSnap() {
  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let settleTimer = 0;
    let frame = 0;
    /** Идёт наша собственная прокрутка — на неё реагировать не надо. */
    let aligning = false;

    const stop = () => {
      aligning = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    /**
     * Разводит соседей выделенной карточки в стороны, чтобы она читалась
     * отдельно. Только для ленты кейсов — на других блоках сбрасываем.
     *
     * Направление ставим переменной, величину задаёт CSS: тут -1, 0 или 1,
     * а на сколько именно — в responsive.css рядом с остальной геометрией.
     */
    const setSpread = (winner: HTMLElement | null) => {
      const tiles = [...document.querySelectorAll<HTMLElement>('.case-tile')];
      const focused = winner && winner.classList.contains('case-tile')
        ? tiles.indexOf(winner)
        : -1;

      tiles.forEach((tile, index) => {
        if (focused < 0) tile.style.removeProperty('--spread-dir');
        else tile.style.setProperty('--spread-dir', String(Math.sign(index - focused)));
      });
    };

    /**
     * Цели доводки. Секция, внутри которой есть карточки кейсов, представлена
     * не собой, а ими: иначе лента из шести плиток считалась бы одним блоком и
     * доводка перепрыгивала бы её целиком.
     */
    const collectTargets = () => {
      const blocks = [...document.querySelectorAll<HTMLElement>('.page > section, .page > footer')];
      return blocks
        .flatMap((block) => {
          const tiles = [...block.querySelectorAll<HTMLElement>('.case-tile')];
          return tiles.length ? tiles : [block];
        })
        .filter((element) => element.getBoundingClientRect().height > 0);
    };

    const animateTo = (to: number, winner: HTMLElement) => {
      const from = window.scrollY;
      const distance = to - from;
      if (!distance) return;

      if (reducedMotion.matches) {
        window.scrollTo(0, to);
        setSpread(winner);
        return;
      }

      const started = performance.now();
      aligning = true;

      const step = (now: number) => {
        if (!aligning) return;
        const progress = Math.min(1, (now - started) / DURATION);
        window.scrollTo(0, from + distance * easeInOutSine(progress));

        if (progress < 1) {
          frame = requestAnimationFrame(step);
        } else {
          stop();
          /* Разводим соседей только когда доехали. Если доводку оборвали —
             stop() уже вызван из onUserInput, и сюда мы не попадём. */
          setSpread(winner);
        }
      };

      frame = requestAnimationFrame(step);
    };

    const align = () => {
      settleTimer = 0;
      if (!portrait.matches || aligning) return;

      const targets = collectTargets();
      if (!targets.length) return;

      const viewportHeight = window.innerHeight;
      const viewportCentre = viewportHeight / 2;
      let winner: HTMLElement | null = null;
      let winnerVisible = 0;
      let winnerDistance = Number.POSITIVE_INFINITY;

      /* Побеждает блок с наибольшей видимой высотой. На середине пути между
         двумя соседями перевес у того, что успел зайти дальше, — туда и
         доводим.

         При равной видимости решает близость к центру экрана. Без этого
         короткие блоки ломали правило: горизонтальных плиток в экран влезает
         сразу четыре, видимая высота у всех одинаковая, и «самая видимая»
         выбиралась по порядку в списке — доводка уводила к случайной. */
      targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        const visible = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        if (visible <= 0) return;

        const distance = Math.abs(rect.top + rect.height / 2 - viewportCentre);
        const clearlyBigger = visible > winnerVisible + 1;
        const sameSizeButCloser = Math.abs(visible - winnerVisible) <= 1 && distance < winnerDistance;

        if (clearlyBigger || sameSizeButCloser) {
          winnerVisible = visible;
          winnerDistance = distance;
          winner = target;
        }
      });

      if (!winner) return;

      const rect = (winner as HTMLElement).getBoundingClientRect();
      /* Для высоких блоков решает доля экрана, для низких — доля самого блока:
         иначе короткие плитки не дотягивают до общего порога никогда. */
      const threshold = Math.min(
        viewportHeight * MIN_VIEWPORT_SHARE,
        rect.height * MIN_SELF_SHARE,
      );
      if (winnerVisible < threshold) return;

      /* Уже стоим где надо — доводить нечего, но выделить карточку стоит:
         так бывает, когда прокрутку отпустили ровно на ней. */
      /* Блок выше экрана ведём верхним краем, остальные центрируем. */
      const destination = rect.height >= viewportHeight
        ? window.scrollY + rect.top
        : window.scrollY + rect.top - (viewportHeight - rect.height) / 2;
      const limit = document.documentElement.scrollHeight - viewportHeight;
      const target = Math.max(0, Math.min(limit, destination));

      if (Math.abs(target - window.scrollY) <= ALIGN_EPSILON) {
        setSpread(winner);
        return;
      }

      animateTo(target, winner);
    };

    const onScroll = () => {
      if (aligning) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(align, SETTLE_DELAY);
    };

    /* Любое действие пользователя обрывает доводку: иначе палец боролся бы со
       страницей, пока она едет. Заодно карточки сходятся обратно — листать
       нужно по обычной ленте, а не по раздвинутой.

       Сводим именно по действию пользователя, а не по событию прокрутки:
       собственный tween сам их порождает, и на его хвосте выделение слетало бы
       сразу же после того, как встало. */
    const onUserInput = () => {
      setSpread(null);
      if (!aligning) return;
      stop();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onUserInput, { passive: true });
    window.addEventListener('wheel', onUserInput, { passive: true });
    window.addEventListener('keydown', onUserInput);
    portrait.addEventListener('change', onScroll);

    return () => {
      window.clearTimeout(settleTimer);
      stop();
      setSpread(null);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onUserInput);
      window.removeEventListener('wheel', onUserInput);
      window.removeEventListener('keydown', onUserInput);
      portrait.removeEventListener('change', onScroll);
    };
    /* Цели собираются заново на каждой доводке, поэтому смена фильтра кейсов
       или числа плиток хук не перезапускает. */
  }, []);
}

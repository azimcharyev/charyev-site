/**
 * Общий признак «страницу сейчас прокручивают».
 *
 * Нужен видео в плитках кейсов. Плитка во время прокрутки наклоняется —
 * .cases__grid задаёт perspective, и rotateX по ней настоящий трёхмерный.
 * Видео под таким преобразованием нельзя отдать быстрым путём композитора:
 * каждый кадр текстуру приходится заново растеризовать с перспективой. Плитка
 * крупная (405x716 единиц макета), таких на экране три — и это единственное
 * место на сайте, где прокрутка проваливалась до 300 мс на кадр. Замер: без
 * шести видео в кейсах провалов нет вовсе, без четырнадцати видео в Hero они
 * остаются.
 *
 * Пока идёт прокрутка, ролики ставим на паузу: застывший кадр композитор
 * закэширует и будет только двигать. Движения в них при быстром пролистывании
 * всё равно не разобрать. Останавливается прокрутка — воспроизведение
 * возвращается само.
 *
 * Один слушатель на всё приложение, а не по одному на видео: слушателей
 * прокрутки и так хватает.
 */

const listeners = new Set<() => void>();
const SETTLE_DELAY = 180;

let scrolling = false;
let settleTimer = 0;
let attached = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function onScroll() {
  if (!scrolling) {
    scrolling = true;
    notify();
  }

  clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    scrolling = false;
    notify();
  }, SETTLE_DELAY);
}

export function isScrolling() {
  return scrolling;
}

export function subscribeScrollActivity(listener: () => void) {
  if (!attached) {
    attached = true;
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Вешает на <html> класс is-scrolling, пока страницу прокручивают.
 *
 * Нужен кольцу «Наведи и посмотри» на плитках кейсов: у него бесконечная
 * анимация вращения, и живёт оно внутри плитки, которую в этот же момент
 * наклоняют в перспективе (.cases__grid задаёт perspective, поворот там
 * настоящий трёхмерный). Слой плитки из-за этого не успокаивается ни на кадр,
 * и всё её содержимое приходится растеризовать заново — а плитка крупная,
 * 405x716 единиц макета, и таких на экране три.
 *
 * Замеры на 1512x860, сумма кадров дольше 32 мс за прокрутку всей страницы:
 * с крутящимся кольцом 325 мс и худший кадр 167 мс, с остановленным — 67 мс
 * и 67 мс. Поэтому на время прокрутки кольцо замирает: вращения надписи при
 * быстром пролистывании всё равно не разобрать.
 *
 * Класс на <html>, а не подписка: останавливать чисто оформительскую анимацию
 * проще из CSS, без участия React.
 */

const SETTLE_DELAY = 180;

let scrolling = false;
let settleTimer = 0;

function onScroll() {
  if (!scrolling) {
    scrolling = true;
    document.documentElement.classList.add('is-scrolling');
  }

  clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    scrolling = false;
    document.documentElement.classList.remove('is-scrolling');
  }, SETTLE_DELAY);
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', onScroll, { passive: true });
}

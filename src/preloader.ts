/**
 * Прелоадер (Figma, node 367:536).
 *
 * Разметка лежит прямо в index.html и case.html, а не рисуется React: она
 * должна быть на экране с первого кадра, до того как выполнится этот модуль.
 * Стили приезжают ссылкой в <head>, то есть тоже к первому кадру — поэтому
 * инлайнить сюда ничего не нужно.
 *
 * Проценты идут по настоящим вехам загрузки, а не по таймеру: выдуманный
 * отсчёт на быстром соединении врал бы в одну сторону, на медленном — в
 * другую. Между вехами число доводится плавно, чтобы не прыгало через
 * десятки.
 *
 * Свечение растёт вместе с процентами и к сотне становится ровно таким, как в
 * Hero (та же --glow-image, та же формула прозрачности). Под прелоадером к
 * этому моменту уже отрисован Hero со своим свечением, поэтому гашение поля
 * не даёт скачка — исчезают только цифры и темнота.
 */

/** Доля, до которой доводит каждая веха. */
const STAGES = { script: 40, fonts: 65, load: 100 };
/** Насколько быстро показанное число догоняет цель, доля разницы за кадр. */
const CATCH_UP = 0.08;
/** Сколько подержать сотню, чтобы она успела прочитаться. */
const HOLD_AT_FULL = 260;
const FADE_OUT = 700;

export function startPreloader() {
  const root = document.querySelector<HTMLElement>('.preloader');
  if (!root) return;

  const value = root.querySelector<HTMLElement>('.preloader__value');

  let target = STAGES.script;
  let shown = 0;
  let frame = 0;
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    if (frame) cancelAnimationFrame(frame);
    root.classList.add('is-done');
    /* Убираем из дерева, а не оставляем прозрачным: слой во весь экран
       фиксированный, и композитор считал бы его на каждой прокрутке. */
    window.setTimeout(() => root.remove(), FADE_OUT);
  };

  /* Если пользователь просил меньше движения — показываем сразу готовое
     состояние и уходим без отсчёта. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (value) value.textContent = '100%';
    root.style.setProperty('--progress', '1');
    finish();
    return;
  }

  const render = () => {
    shown += (target - shown) * CATCH_UP;
    /* Пока не дошли до цели вплотную, показываем округление вниз: иначе на
       подходе к вехе счётчик показал бы её раньше, чем она случилась. */
    const percent = target - shown < 0.5 ? target : Math.floor(shown);

    if (value) value.textContent = `${percent}%`;
    root.style.setProperty('--progress', (percent / 100).toFixed(3));

    if (percent >= 100) {
      frame = 0;
      window.setTimeout(finish, HOLD_AT_FULL);
      return;
    }

    frame = requestAnimationFrame(render);
  };

  const advance = (to: number) => {
    if (to > target) target = to;
    if (!frame && !done) frame = requestAnimationFrame(render);
  };

  render();

  /* Шрифт — заметная веха: до него весь текст на сайте перерисуется. */
  if (document.fonts) {
    document.fonts.ready.then(() => advance(STAGES.fonts));
  } else {
    advance(STAGES.fonts);
  }

  if (document.readyState === 'complete') advance(STAGES.load);
  else window.addEventListener('load', () => advance(STAGES.load), { once: true });

  /* Страховка: если какой-нибудь ресурс повис, load не наступит никогда, и
     посетитель останется смотреть на застывшие проценты. */
  window.setTimeout(() => advance(STAGES.load), 8000);
}

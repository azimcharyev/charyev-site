import { CASES_BY_ID, CASE_DETAILS } from './data/caseDetails';
import { HERO_FIXED_MEDIA, HERO_MEDIA } from './data/heroMedia';

/**
 * Прелоадер (Figma, node 367:536).
 *
 * Разметка лежит прямо в index.html и case.html, а не рисуется React: она
 * должна быть на экране с первого кадра, до того как выполнится этот модуль.
 * Стили приезжают ссылкой в <head>, то есть тоже к первому кадру — поэтому
 * инлайнить сюда ничего не нужно.
 *
 * Проценты идут по настоящим вехам загрузки, включая медиа текущей страницы.
 * Главная заранее кладёт в HTTP-кеш Hero; отдельная страница — все кадры и
 * ролики открытого кейса. Галерея подключает src за 600 px до экрана, поэтому
 * её файлы успевают прогреться при подходе, не задерживая первый экран.
 *
 * Свечение растёт вместе с процентами и к сотне становится ровно таким, как в
 * Hero (та же --glow-image, та же формула прозрачности). Под прелоадером к
 * этому моменту уже отрисован Hero со своим свечением, поэтому гашение поля
 * не даёт скачка — исчезают только цифры и темнота.
 */

/** Доля, до которой доводит каждая веха. Основная часть шкалы — реальные
 * загрузки медиа, а не искусственный таймер. */
const STAGES = { script: 8, document: 14, fonts: 20, mediaStart: 20, mediaEnd: 98, load: 100 };
/** Насколько быстро показанное число догоняет цель, доля разницы за кадр. */
const CATCH_UP = 0.08;
/** Сколько подержать сотню, чтобы она успела прочитаться. */
const HOLD_AT_FULL = 260;
const FADE_OUT = 700;
const PRELOAD_CONCURRENCY = 4;

function unique(urls: Array<string | undefined>) {
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}

/**
 * Тяжёлые detail-ролики других проектов на главной не нужны: там лежат их
 * облегчённые preview-версии. На странице кейса, наоборот, прогреваем только
 * выбранный проект, иначе один переход заставил бы скачать все проекты сразу.
 */
function getCurrentPageMedia() {
  if (window.location.pathname.endsWith('/privacy.html')) return [];

  if (window.location.pathname.endsWith('/case.html')) {
    const requestedCase = new URLSearchParams(window.location.search).get('case') ?? CASE_DETAILS[0].id;
    const caseData = CASES_BY_ID[requestedCase] ?? CASE_DETAILS[0];

    return unique(caseData.media.flatMap((media) => [media.previewSrc, media.src]));
  }

  return unique([
    ...HERO_MEDIA,
    ...Object.values(HERO_FIXED_MEDIA),
  ]);
}

async function fetchIntoHttpCache(url: string, onProgress: (progress: number) => void) {
  const response = await fetch(url, { cache: 'force-cache', credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Не удалось загрузить ${url}: ${response.status}`);

  const total = Number(response.headers.get('content-length')) || 0;
  const reader = response.body?.getReader();
  if (!reader) {
    await response.blob();
    onProgress(1);
    return;
  }

  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    /* Если сервер не прислал размер, честно держим файл на нуле до конца.
       При известном размере 99% оставляем за фактическим завершением потока. */
    if (total > 0) onProgress(Math.min(loaded / total, .99));
  }
  onProgress(1);
}

async function preloadMedia(urls: string[], onProgress: (progress: number) => void) {
  if (!urls.length) {
    onProgress(1);
    return;
  }

  const progress = new Array<number>(urls.length).fill(0);
  const report = (index: number, value: number) => {
    progress[index] = value;
    onProgress(progress.reduce((sum, item) => sum + item, 0) / progress.length);
  };

  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < urls.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        await fetchIntoHttpCache(urls[index], (value) => report(index, value));
      } catch (error) {
        /* Один повреждённый файл не должен навсегда запирать посетителя на
           прелоадере. Остальной контент продолжаем прогревать. */
        console.warn(error);
        report(index, 1);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(PRELOAD_CONCURRENCY, urls.length) }, worker));
}

function waitForWindowLoad() {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
}

export function startPreloader() {
  const root = document.querySelector<HTMLElement>('.preloader');
  if (!root) return;

  const value = root.querySelector<HTMLElement>('.preloader__value');

  let target = STAGES.script;
  let shown = 0;
  let frame = 0;
  let done = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = () => {
    if (done) return;
    done = true;
    if (frame) cancelAnimationFrame(frame);
    root.classList.add('is-done');
    /* Убираем из дерева, а не оставляем прозрачным: слой во весь экран
       фиксированный, и композитор считал бы его на каждой прокрутке. */
    window.setTimeout(() => root.remove(), FADE_OUT);
  };

  const render = () => {
    shown = reduceMotion ? target : shown + (target - shown) * CATCH_UP;
    /* Пока не дошли до цели вплотную, показываем округление вниз: иначе на
       подходе к вехе счётчик показал бы её раньше, чем она случилась. */
    const reachedTarget = target - shown < 0.5;
    const percent = reachedTarget ? Math.floor(target) : Math.floor(shown);

    if (value) value.textContent = `${percent}%`;
    root.style.setProperty('--progress', (percent / 100).toFixed(3));

    if (percent >= 100) {
      frame = 0;
      window.setTimeout(finish, HOLD_AT_FULL);
      return;
    }

    /* На достигнутой промежуточной вехе не держим бесконечный rAF. Следующий
       сетевой progress снова запустит render через advance(). */
    if (reachedTarget) {
      frame = 0;
      return;
    }

    frame = requestAnimationFrame(render);
  };

  const advance = (to: number) => {
    if (to > target) target = to;
    if (!frame && !done) frame = requestAnimationFrame(render);
  };

  render();

  const fontReady = document.fonts?.ready.then(() => advance(STAGES.fonts)) ?? Promise.resolve();
  const documentReady = waitForWindowLoad().then(() => advance(STAGES.document));
  const mediaReady = preloadMedia(getCurrentPageMedia(), (progress) => {
    advance(STAGES.mediaStart + progress * (STAGES.mediaEnd - STAGES.mediaStart));
  });

  /* Сотня означает готовность документа, шрифта и медиа, которые посетитель
     увидит первыми. reduced-motion влияет только на CSS-анимацию, но не
     отменяет загрузку критического набора. */
  void Promise.all([fontReady, documentReady, mediaReady]).then(() => advance(STAGES.load));
}

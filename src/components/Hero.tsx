import { useRef, useState, type CSSProperties } from 'react';
import { HERO_CASE_MEDIA, HERO_FIXED_MEDIA, HERO_MEDIA } from '../data/heroMedia';
import { useHeroParallax } from '../hooks/useHeroParallax';
import { SilentVideo } from './SilentVideo';

type HeroLayer = 'foreground' | 'midground' | 'background';

type HeroCardLayout = {
  layer: HeroLayer;
  x: number;
  y: number;
  width: number;
  height: number;
  pointerDepth: number;
  scrollDepth: number;
};

type HeroForegroundSlot = {
  side: 'left' | 'right';
  vertical: 'top' | 'bottom';
};

type HeroMediaItem = {
  fixedName?: 'china' | 'wedding';
  src: string;
};

const HERO_WIDTH = 1728;
const HERO_HEIGHT = 968;
const HERO_TEXT_AREA = { left: 626, top: 230, right: 1101, bottom: 590 };
const HERO_FOREGROUND_SLOTS: HeroForegroundSlot[] = [
  { side: 'left', vertical: 'top' },
  { side: 'left', vertical: 'bottom' },
  { side: 'right', vertical: 'top' },
  { side: 'right', vertical: 'bottom' },
];
const HERO_EDGE_SLOTS = ['left', 'right'] as const;
const HERO_BACKGROUND_COUNT = 8;
const HERO_BACKGROUND_UNDER_TEXT_COUNT = 3;
const HERO_CARD_COUNT = HERO_FOREGROUND_SLOTS.length + HERO_EDGE_SLOTS.length + HERO_BACKGROUND_COUNT;
/* Четыре незакреплённые основные карточки: две передние и две по краям.
   В них распределяется по одному ролику из каждого пула кейса. */
const HERO_PRIMARY_RANDOM_CARDS = [0, 1, 4, 5] as const;

/* Индексы 2 и 3 — правые передние карточки. Фиксируем там новые ролики,
   сохраняя общее число карточек: Hero не становится тяжелее прежнего. */
const HERO_FIXED_CARDS: Partial<Record<number, HeroMediaItem & { layout: HeroCardLayout }>> = {
  2: {
    fixedName: 'wedding',
    src: HERO_FIXED_MEDIA.wedding,
    layout: {
      layer: 'foreground',
      x: 1255,
      y: 105,
      width: 205,
      height: 310,
      pointerDepth: 50,
      scrollDepth: -575,
    },
  },
  3: {
    fixedName: 'china',
    src: HERO_FIXED_MEDIA.china,
    layout: {
      layer: 'foreground',
      x: 1330,
      y: 510,
      width: 420,
      height: 236,
      pointerDepth: 52,
      scrollDepth: -906,
    },
  },
};

const randomBetween = ([min, max]: [number, number]) => min + Math.random() * (max - min);

function createForegroundCandidate(slot: HeroForegroundSlot): HeroCardLayout {
  const width = randomBetween([195, 235]);
  const height = width * randomBetween([1.38, 1.52]);
  const pointerDepth = randomBetween([48, 64]);
  const horizontalSafety = pointerDepth + 22;
  const verticalMargin = 28 + pointerDepth * .8;
  const textSide = slot.side === 'left' ? HERO_TEXT_AREA.left : HERO_TEXT_AREA.right;
  const nearestX = slot.side === 'left'
    ? textSide - horizontalSafety - width / 2
    : textSide + horizontalSafety + width / 2;
  const x = slot.side === 'left'
    ? randomBetween([nearestX - 52, nearestX])
    : randomBetween([nearestX, nearestX + 52]);
  const y = slot.vertical === 'top'
    ? randomBetween([verticalMargin, Math.max(verticalMargin, 480 - height)])
    : randomBetween([520, HERO_HEIGHT - verticalMargin - height]);

  return {
    layer: 'foreground',
    x,
    y,
    width,
    height,
    pointerDepth,
    scrollDepth: -(y + height + randomBetween([125, 190])),
  };
}

function createEdgeCandidate(side: (typeof HERO_EDGE_SLOTS)[number]): HeroCardLayout {
  const width = randomBetween([145, 178]);
  const height = width * randomBetween([1.42, 1.62]);
  const pointerDepth = randomBetween([36, 48]);
  const edgeMargin = 30 + pointerDepth;
  const nearestX = side === 'left'
    ? edgeMargin + width / 2
    : HERO_WIDTH - edgeMargin - width / 2;
  const x = side === 'left'
    ? nearestX + randomBetween([0, 38])
    : nearestX - randomBetween([0, 38]);
  const y = side === 'right'
    ? randomBetween([150, Math.max(150, 470 - height)])
    : randomBetween([275, Math.min(455, HERO_HEIGHT - edgeMargin - height)]);

  return {
    layer: 'midground',
    x,
    y,
    width,
    height,
    pointerDepth,
    scrollDepth: -(y + height + randomBetween([125, 190])),
  };
}

function createBackgroundCandidate(underText: boolean): HeroCardLayout {
  const width = randomBetween([86, 145]);
  const height = width * randomBetween([1.48, 1.86]);
  const pointerDepth = randomBetween([22, 38]);
  const horizontalMargin = 145 + pointerDepth;
  const verticalMargin = 30 + pointerDepth * .8;
  const x = underText
    ? randomBetween([HERO_TEXT_AREA.left + width / 2, HERO_TEXT_AREA.right - width / 2])
    : randomBetween([horizontalMargin + width / 2, HERO_WIDTH - horizontalMargin - width / 2]);
  const y = underText
    ? randomBetween([HERO_TEXT_AREA.top, HERO_TEXT_AREA.bottom - height])
    : randomBetween([verticalMargin, HERO_HEIGHT - verticalMargin - height]);

  return {
    layer: 'background',
    x,
    y,
    width,
    height,
    pointerDepth,
    scrollDepth: -(y + height + randomBetween([125, 190])),
  };
}

function intersectsText(layout: HeroCardLayout) {
  const left = layout.x - layout.width / 2;
  const right = layout.x + layout.width / 2;
  const top = layout.y;
  const bottom = layout.y + layout.height;

  return left < HERO_TEXT_AREA.right
    && right > HERO_TEXT_AREA.left
    && top < HERO_TEXT_AREA.bottom
    && bottom > HERO_TEXT_AREA.top;
}

function createBackgroundAroundText() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidate = createBackgroundCandidate(false);
    if (!intersectsText(candidate)) return candidate;
  }

  return createBackgroundCandidate(false);
}

function getOverlapRatio(first: HeroCardLayout, second: HeroCardLayout) {
  const separation = first.layer === 'background' && second.layer === 'background' ? 34 : 38;
  const overlapWidth = Math.max(
    0,
    Math.min(first.x + first.width / 2 + separation / 2, second.x + second.width / 2 + separation / 2)
      - Math.max(first.x - first.width / 2 - separation / 2, second.x - second.width / 2 - separation / 2),
  );
  const overlapHeight = Math.max(
    0,
    Math.min(first.y + first.height + separation / 2, second.y + second.height + separation / 2)
      - Math.max(first.y - separation / 2, second.y - separation / 2),
  );
  const smallerArea = Math.min(
    (first.width + separation) * (first.height + separation),
    (second.width + separation) * (second.height + separation),
  );

  return smallerArea > 0 ? (overlapWidth * overlapHeight) / smallerArea : 0;
}

function getDistanceToText(layout: HeroCardLayout) {
  const left = layout.x - layout.width / 2;
  const right = layout.x + layout.width / 2;
  const top = layout.y;
  const bottom = layout.y + layout.height;
  const horizontalDistance = Math.max(HERO_TEXT_AREA.left - right, left - HERO_TEXT_AREA.right, 0);
  const verticalDistance = Math.max(HERO_TEXT_AREA.top - bottom, top - HERO_TEXT_AREA.bottom, 0);

  return Math.hypot(horizontalDistance, verticalDistance);
}

function createHeroLayout(): HeroCardLayout[] {
  const placed = [
    ...HERO_FOREGROUND_SLOTS.map((slot, index) => (
      HERO_FIXED_CARDS[index]?.layout ?? createForegroundCandidate(slot)
    )),
    ...HERO_EDGE_SLOTS.map(createEdgeCandidate),
  ];

  for (let index = 0; index < HERO_BACKGROUND_COUNT; index += 1) {
    const underText = index < HERO_BACKGROUND_UNDER_TEXT_COUNT;
    const makeCandidate = underText
      ? () => createBackgroundCandidate(true)
      : createBackgroundAroundText;
    let bestCandidate = makeCandidate();
    let bestScore = Number.POSITIVE_INFINITY;

    for (let attempt = 0; attempt < 220; attempt += 1) {
      const candidate = makeCandidate();
      const overlap = placed.reduce(
        (largest, other) => Math.max(largest, getOverlapRatio(candidate, other)),
        0,
      );
      const score = overlap > 0
        ? 100000 + overlap * 100000
        : getDistanceToText(candidate);

      if (score < bestScore) {
        bestCandidate = candidate;
        bestScore = score;
      }
    }

    placed.push(bestCandidate);
  }

  /* Не тасуем: индексы фиксируют слой (0-3 foreground, 4-5 midground, 6-13
     background), а вместе с ним — играет карточка или показывает стоп-кадр.
     На десктопе стекинг задаёт z-index по слою в hero.css, порядок в DOM
     ничего не решает. На мобильном виден фиксированный набор индексов
     (--1, --2, --5, --6 — играющие; --7, --8 — размытые фоновые), и без
     тасовки рандом не подкидывает background в передний план — иначе
     карточка стоит стоп-кадром там, где ей положено играть. */
  return placed;
}

function pickRandomVideos() {
  const shuffle = <T,>(items: readonly T[]) => items
    .map((item) => ({ item, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ item }) => item);

  const primaryVideos = shuffle(
    Object.values(HERO_CASE_MEDIA).map((caseVideos) => (
      caseVideos[Math.floor(Math.random() * caseVideos.length)]
    )),
  );
  const primaryByIndex = new Map<number, string>(
    HERO_PRIMARY_RANDOM_CARDS.map((cardIndex, index) => [cardIndex, primaryVideos[index]]),
  );
  const backgroundVideos = shuffle(
    [...new Set(HERO_MEDIA)].filter((src) => !primaryVideos.includes(src)),
  );

  let backgroundIndex = 0;
  return Array.from({ length: HERO_CARD_COUNT }, (_, index): HeroMediaItem => {
    const fixed = HERO_FIXED_CARDS[index];
    if (fixed) return { src: fixed.src, fixedName: fixed.fixedName };

    const primary = primaryByIndex.get(index);
    if (primary) return { src: primary };

    const src = backgroundVideos[backgroundIndex];
    backgroundIndex += 1;
    return { src };
  });
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [heroMedia] = useState(pickRandomVideos);
  const [heroLayout] = useState(createHeroLayout);
  useHeroParallax(heroRef);

  return (
    <section className="hero" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__content">
        <div className="hero__intro">
          <h1 className="hero__title" id="hero-title">
            <span>Азим</span>
            <span>Чарыев</span>
          </h1>
          <p className="hero__copy">
            Мне всегда было мало просто красивого кадра. В&nbsp;людях, брендах и&nbsp;местах я&nbsp;ищу
            характер — то, что невозможно выдумать, но можно почувствовать. Моя задача — заметить
            его первым и&nbsp;превратить в&nbsp;образ, которому доверяют.
          </p>
        </div>
      </div>

      {heroMedia.map(({ src, fixedName }, index) => {
        const layout = heroLayout[index];
        const fixedClass = fixedName ? ` hero__media-card--fixed hero__media-card--fixed-${fixedName}` : '';

        return (
        <div
          className={`hero__media-card hero__media-card--${index + 1} hero__media-card--${layout.layer}${fixedClass}`}
          data-pointer-depth={layout.pointerDepth}
          data-scroll-depth={layout.scrollDepth}
          style={{
            '--delay': `${260 + index * 110}ms`,
            '--hero-x': layout.x,
            '--hero-y': layout.y,
            '--hero-width': layout.width,
            '--hero-height': layout.height,
          } as CSSProperties}
          key={src}
        >
          <div className="hero__media-card-frame">
            {/* Дальний план держит стоп-кадр: он размыт на 9 px и притушен до
                46%, движения там почти не разобрать, зато каждый его кадр
                заставлял пересчитывать размытие. Восемь из четырнадцати
                карточек — как раз он. */}
            <SilentVideo src={src} eager preload="auto" still={layout.layer === 'background'} />
          </div>
        </div>
        );
      })}
    </section>
  );
}

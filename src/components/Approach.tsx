import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { APPROACH_TEXT } from '../data/hero';
import { APPROACH_SHAPES } from '../data/approach';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { typographText } from '../utils/typography';

/** Слова загораются по одному: каждое вспыхивает целиком. */
const WORDS = typographText(APPROACH_TEXT).split(' ');

const DIM = 0.16;
/** Пауза перед началом вспышек после появления блока, мс. */
const START_DELAY = 260;
/** Интервал между вспышками соседних слов, мс. */
const STEP = 55;

export function Approach() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [lit, setLit] = useState(0);

  // Блок теперь занимает один экран, поэтому вспышки идут не от прокрутки,
  // а от появления блока в кадре: зашёл — текст загорелся по словам.
  const sectionRef = useScrollProgress<HTMLElement>(
    'enter',
    useCallback((progress: number, element: HTMLElement) => {
      // лёгкий параллакс плашек, --p наследуется вниз по каскаду
      element.style.setProperty('--p', (progress - 0.5).toFixed(4));
      if (progress > 0.35) element.dataset.visible = 'yes';
    }, []),
  );

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    let timers: number[] = [];
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      timers = WORDS.map((_, index) =>
        window.setTimeout(() => setLit(index + 1), START_DELAY + index * STEP),
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.intersectionRatio > 0.35) start();
      },
      { threshold: [0, 0.35, 0.6] },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [sectionRef]);

  return (
    <section className="approach" ref={sectionRef} aria-label="Мой подход">
      <p className="approach__text txt" ref={textRef}>
        {WORDS.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span className="approach__word" style={{ opacity: index < lit ? 1 : DIM }}>
              {word}
            </span>
            {/* пробел снаружи слова — по нему и переносится строка */}
            {index < WORDS.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </p>

      <div className="approach__shapes" aria-hidden="true">
        {APPROACH_SHAPES.map((shape) => (
          <div
            key={shape.id}
            className="approach__shape"
            style={
              {
                '--l': shape.left,
                '--t': shape.top,
                '--w': shape.width,
                '--h': shape.height,
                '--drift': shape.drift,
              } as CSSProperties
            }
          >
            {/* сюда встанет <video> или <img> кейса */}
          </div>
        ))}
      </div>
    </section>
  );
}

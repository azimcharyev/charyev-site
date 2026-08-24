import { useEffect, useRef } from 'react';

/**
 * Прогресс элемента относительно окна. Значение отдаётся колбэком, а не
 * через состояние: анимация пишется прямо в DOM, поэтому React не
 * перерисовывает дерево на каждый кадр скролла.
 *
 * 'through' — 0, когда верх элемента на нижней кромке экрана; 1, когда
 *             низ ушёл за верхнюю. Для параллакса на всю секцию.
 * 'enter'   — 0…1 на входе элемента в экран. Для реакции на появление.
 * 'pin'     — 0 в момент, когда секция прилипла к верху экрана, 1 — когда
 *             она вот-вот отлипнет. Для секций с position: sticky внутри.
 */
export type ProgressMode = 'through' | 'enter' | 'pin';

export function useScrollProgress<T extends HTMLElement>(
  mode: ProgressMode,
  onProgress: (progress: number, element: T) => void,
) {
  const ref = useRef<T>(null);
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight || 1;

      let raw: number;
      if (mode === 'through') {
        raw = (viewport - rect.top) / (viewport + rect.height);
      } else if (mode === 'pin') {
        raw = -rect.top / Math.max(1, rect.height - viewport);
      } else {
        raw = (viewport * 0.85 - rect.top) / (viewport * 0.55);
      }

      callback.current(Math.min(1, Math.max(0, raw)), element);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode]);

  return ref;
}

import { useEffect, type RefObject } from 'react';

/**
 * Плавно тянет высоту карточки услуг за её содержимым.
 *
 * CSS сам этого не умеет: `transition` не работает при переходе к `height:
 * auto`, а при смене тарифа список пунктов меняет длину — без скрипта карточка
 * прыгала бы рывком. Поэтому высоту ставим точным значением, а анимацию делает
 * обычный CSS-переход на .services__shell.
 *
 * Только в портрете. На десктопе три карточки стоят рядом, высота там общая и
 * задаётся вёрсткой — вмешиваться незачем.
 */
export function useServiceCardHeight(shellRef: RefObject<HTMLElement | null>, contentKey: string) {
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const portrait = window.matchMedia('(orientation: portrait)');

    const apply = () => {
      if (!portrait.matches) {
        shell.style.removeProperty('height');
        return;
      }

      const card = shell.querySelector<HTMLElement>('.service-card.is-active');
      if (!card) return;

      /* Высота карточки берётся из содержимого и от высоты шелла не зависит,
         поэтому обратной связи здесь нет — шелл просто повторяет за ней. */
      const styles = getComputedStyle(shell);
      const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      shell.style.height = `${Math.round(card.getBoundingClientRect().height + padding)}px`;
    };

    /* ResizeObserver, а не разовый замер: содержимое меняет высоту не только
       при смене тарифа, но и когда переносится строка — например, после
       поворота экрана или подгрузки шрифта. */
    const observer = new ResizeObserver(apply);
    const card = shell.querySelector<HTMLElement>('.service-card.is-active');
    if (card) observer.observe(card);

    apply();
    portrait.addEventListener('change', apply);

    return () => {
      observer.disconnect();
      portrait.removeEventListener('change', apply);
    };
  }, [shellRef, contentKey]);
}

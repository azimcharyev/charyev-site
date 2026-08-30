import { useEffect, useRef, type CSSProperties } from 'react';

type SilentVideoProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
  active?: boolean;
  playOnHover?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  eager?: boolean;
  /**
   * Загрузить и показать первый кадр, но не проигрывать. Для дальнего плана
   * Hero: те карточки размыты на 9 px и притушены до 46%, движения в них почти
   * не разобрать, а декод они жгут наравне с остальными — да ещё заставляют
   * пересчитывать размытие на каждый кадр.
   */
  still?: boolean;
};

export function SilentVideo({
  src,
  className,
  style,
  active = true,
  playOnHover = false,
  preload = 'metadata',
  eager = false,
  still = false,
}: SilentVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isVisible = false;
    let isHovered = !playOnHover;
    let hasSource = false;
    const hoverHost = playOnHover ? video.closest<HTMLElement>('.case-tile') : null;

    const syncPlayback = () => {
      if (still) {
        video.pause();
        return;
      }

      if (hasSource && active && isVisible && isHovered && !document.hidden) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const loadSource = () => {
      if (hasSource || !active) return;
      hasSource = true;
      video.preload = preload;
      video.src = src;
      video.load();
      syncPlayback();
    };

    const onEnter = () => {
      isHovered = true;
      syncPlayback();
    };
    const onLeave = () => {
      isHovered = false;
      syncPlayback();
    };

    hoverHost?.addEventListener('pointerenter', onEnter);
    hoverHost?.addEventListener('pointerleave', onLeave);
    hoverHost?.addEventListener('focusin', onEnter);
    hoverHost?.addEventListener('focusout', onLeave);
    document.addEventListener('visibilitychange', syncPlayback);

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadSource();
        loadObserver.disconnect();
      },
      { rootMargin: '600px 0px', threshold: 0 },
    );

    /* Стоп-кадру наблюдатель воспроизведения не нужен: играть он всё равно не
       будет, а лишний IntersectionObserver на каждую карточку — это лишние
       пересечения на каждой прокрутке. */
    const playbackObserver = still ? null : new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) loadSource();
        syncPlayback();
      },
      { rootMargin: '0px', threshold: .2 },
    );

    if (eager) loadSource();
    else loadObserver.observe(video);
    playbackObserver?.observe(video);

    return () => {
      loadObserver.disconnect();
      playbackObserver?.disconnect();
      hoverHost?.removeEventListener('pointerenter', onEnter);
      hoverHost?.removeEventListener('pointerleave', onLeave);
      hoverHost?.removeEventListener('focusin', onEnter);
      hoverHost?.removeEventListener('focusout', onLeave);
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [active, eager, playOnHover, preload, src, still]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      muted
      loop
      playsInline
      preload={eager ? preload : 'none'}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      aria-hidden="true"
      tabIndex={-1}
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

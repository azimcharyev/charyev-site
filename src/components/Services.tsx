import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
} from 'react';
import { SERVICES, type Service } from '../data/services';
import { ServiceBlock } from './ServiceBlock';
import navArrow from '../assets/icons/tariffs-nav-arrow.svg';
import { typographText } from '../utils/typography';

/* Десктоп (Figma, node 365:1192): шапка «Тарифы» с подписью и парой стрелок,
   под ней ряд из трёх карточек. Направлений пять, и лента ходит по кругу —
   обе стрелки активны всегда, конца у ряда нет.

   В мобильной версии видна одна карточка: направления переключаются свайпом,
   а анимированная плашка в шапке подсказывает жест. */

const COUNT = SERVICES.length;

/* Лента из трёх копий списка. Круг устроен так: едем по средней копии, а как
   только уходим в соседнюю — молча возвращаемся на ту же карточку в средней.
   Прыжок делается после доигравшего перехода и без анимации, поэтому его не
   видно. Трёх копий хватает с запасом: индекс держится в пределах 4..10, а
   показываем три подряд — максимум до 12-й из 15. */
const LOOP = [0, 1, 2].flatMap((copy) => SERVICES.map((service) => ({ service, copy })));

export function Services() {
  const [activeService, setActiveService] = useState<Service['id']>(SERVICES[0].id);
  const [tierByService, setTierByService] = useState<Record<string, string>>(() =>
    Object.fromEntries(SERVICES.map((service) => [service.id, service.defaultTier])),
  );
  /* Стартуем со средней копии, чтобы круг сразу был доступен в обе стороны. */
  const [start, setStart] = useState(COUNT);
  const [animated, setAnimated] = useState(true);
  const [leavingService, setLeavingService] = useState<Service['id'] | null>(null);
  const [mobileDirection, setMobileDirection] = useState<1 | -1>(1);
  const swipeStartX = useRef<number | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Лента ходит только на десктопе. После поворота в портрет сдвиг надо
     вернуть в среднюю копию, иначе вернувшись в ландшафт пользователь увидит
     не тот кусок ряда, что до поворота. */
  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)');
    const reset = () => {
      if (!portrait.matches) return;
      setAnimated(false);
      setStart(COUNT);
    };

    reset();
    portrait.addEventListener('change', reset);
    return () => portrait.removeEventListener('change', reset);
  }, []);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  const shift = (delta: number) => {
    setAnimated(true);
    setStart((value) => value + delta);
  };

  /* Возврат в среднюю копию — только после того, как переход доиграл: иначе
     карточки прыгнули бы посреди движения. */
  const onSettled = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'translate') return;

    if (start >= COUNT * 2) {
      setAnimated(false);
      setStart(start - COUNT);
    } else if (start < COUNT) {
      setAnimated(false);
      setStart(start + COUNT);
    }
  };

  const selectTier = (serviceId: Service['id'], tierId: string) => {
    setTierByService((previous) => ({ ...previous, [serviceId]: tierId }));
  };

  const cycleService = (serviceId: Service['id'], delta: number) => {
    const currentIndex = SERVICES.findIndex((service) => service.id === serviceId);
    const nextIndex = (currentIndex + delta + COUNT) % COUNT;
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setLeavingService(serviceId);
    setMobileDirection(delta > 0 ? 1 : -1);
    setActiveService(SERVICES[nextIndex].id);
    transitionTimer.current = setTimeout(() => {
      setLeavingService(null);
      transitionTimer.current = null;
    }, 560);
  };

  const startSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(orientation: portrait)').matches) return;
    if ((event.target as Element).closest('button, a, select')) return;
    swipeStartX.current = event.clientX;
  };

  const finishSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeStartX.current === null) return;
    const distance = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(distance) < 40) return;
    cycleService(activeService, distance < 0 ? 1 : -1);
  };

  const cancelSwipe = () => {
    swipeStartX.current = null;
  };

  const renderSwipeHint = (serviceId: Service['id']) => (
    <button
      className="service-swipe-hint"
      type="button"
      aria-label="Следующее направление. Можно также провести по карточке влево или вправо"
      onClick={() => cycleService(serviceId, 1)}
    >
      <svg className="service-swipe-hint__gesture" viewBox="0 0 48 48" aria-hidden="true">
        <path className="service-swipe-hint__arrow service-swipe-hint__arrow--left" d="m8 14-6 6 6 6" />
        <path className="service-swipe-hint__arrow service-swipe-hint__arrow--right" d="m40 14 6 6-6 6" />
        <g transform="translate(6.5 8)">
          <g className="service-swipe-hint__hand">
            <path d="M12 14V6.5a2 2 0 0 1 4 0V13" />
            <path d="M16 11.5a2 2 0 0 1 4 0V14" />
            <path d="M20 13a2 2 0 0 1 4 0v2" />
            <path d="M24 15a2 2 0 0 1 4 0v5.5c0 5-3.3 8.5-8.5 8.5h-2.2a8 8 0 0 1-6.1-2.8L6.5 20.7a2.2 2.2 0 0 1 3.2-3l2.3 2.1V14" />
          </g>
        </g>
      </svg>
      <span>Swipe</span>
    </button>
  );

  return (
    <section className="services" aria-label="Услуги">
      <div className="services__shell reveal reveal--scroll-card">
        <header className="services__head">
          <div className="services__intro">
            <h2 className="services__title">Тарифы</h2>
            <p className="services__note">
              {typographText('Конечная стоимость проекта обсуждается после брифинга')}
            </p>
          </div>

          <div className="services__nav">
            <button
              className="services__nav-button"
              type="button"
              aria-label="Предыдущие тарифы"
              onClick={() => shift(-1)}
            >
              <img src={navArrow} alt="" />
            </button>
            <button
              className="services__nav-button services__nav-button--next"
              type="button"
              aria-label="Следующие тарифы"
              onClick={() => shift(1)}
            >
              <img src={navArrow} alt="" />
            </button>
          </div>
        </header>

        <div
          className="services__viewport"
          onPointerDown={startSwipe}
          onPointerUp={finishSwipe}
          onPointerCancel={cancelSwipe}
          onPointerLeave={cancelSwipe}
        >
          <div
            className={`services__cards${animated ? '' : ' is-static'}`}
            style={{ '--tariff-start': start } as CSSProperties}
            onTransitionEnd={onSettled}
          >
            {LOOP.map(({ service, copy }) => {
              /* Средняя копия — основная: на мобильном показывается только
                 она, у неё же живёт подсказка свайпа. Копии по краям нужны ради круга и
                 в портрете скрыты — там прячется всё, кроме активной. */
              const isPrimary = copy === 1;
              const isActive = isPrimary && activeService === service.id;
              const isLeaving = isPrimary && leavingService === service.id;
              const direction = mobileDirection > 0 ? 'next' : 'previous';
              const motion = isLeaving
                ? (`leave-${direction}` as const)
                : isActive && leavingService
                  ? (`enter-${direction}` as const)
                  : undefined;

              return (
                <ServiceBlock
                  service={service}
                  active={isActive}
                  motion={motion}
                  activeTierId={tierByService[service.id]}
                  onTierChange={(tierId) => selectTier(service.id, tierId)}
                  picker={isPrimary ? renderSwipeHint(service.id) : undefined}
                  key={`${service.id}-${copy}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

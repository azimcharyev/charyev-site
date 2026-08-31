import { useEffect, useState, type CSSProperties, type TransitionEvent } from 'react';
import { SERVICES, type Service } from '../data/services';
import { ServiceBlock } from './ServiceBlock';
import navArrow from '../assets/icons/tariffs-nav-arrow.svg';
import { typographText } from '../utils/typography';

/* Десктоп (Figma, node 365:1192): шапка «Тарифы» с подписью и парой стрелок,
   под ней ряд из трёх карточек. Направлений пять, и лента ходит по кругу —
   обе стрелки активны всегда, конца у ряда нет.

   В мобильной версии видна одна карточка, а две стрелки в её шапке циклически
   переключают направления тем же способом, что и десктопная навигация. */

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
    setActiveService(SERVICES[nextIndex].id);
  };

  const renderMobileSwitcher = (serviceId: Service['id']) => (
    <div className="service-switcher" aria-label="Переключение направлений">
      <button
        className="service-switcher__button"
        type="button"
        aria-label="Предыдущее направление"
        onClick={() => cycleService(serviceId, -1)}
      >
        <img src={navArrow} alt="" />
      </button>
      <button
        className="service-switcher__button service-switcher__button--next"
        type="button"
        aria-label="Следующее направление"
        onClick={() => cycleService(serviceId, 1)}
      >
        <img src={navArrow} alt="" />
      </button>
    </div>
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

        <div className="services__viewport">
          <div
            className={`services__cards${animated ? '' : ' is-static'}`}
            style={{ '--tariff-start': start } as CSSProperties}
            onTransitionEnd={onSettled}
          >
            {LOOP.map(({ service, copy }) => {
              /* Средняя копия — основная: на мобильном показывается только
                 она, у неё же живут стрелки. Копии по краям нужны ради круга и
                 в портрете скрыты — там прячется всё, кроме активной. */
              const isPrimary = copy === 1;

              return (
                <ServiceBlock
                  service={service}
                  active={isPrimary && activeService === service.id}
                  activeTierId={tierByService[service.id]}
                  onTierChange={(tierId) => selectTier(service.id, tierId)}
                  picker={isPrimary ? renderMobileSwitcher(service.id) : undefined}
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

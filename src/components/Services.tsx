import { useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react';
import { SERVICES, type Service } from '../data/services';
import { useServiceCardHeight } from '../hooks/useServiceCardHeight';
import { ServiceBlock } from './ServiceBlock';
import navArrow from '../assets/icons/tariffs-nav-arrow.svg';
import tariffsIcon from '../assets/icons/tariffs-arrow.svg';

/* Десктоп (Figma, node 365:1192): шапка «Тарифы» с подписью и парой стрелок,
   под ней ряд из трёх карточек. Направлений пять, и лента ходит по кругу —
   обе стрелки активны всегда, конца у ряда нет.

   Мобильный макет (node 278:2318) не рисует ни ряда, ни стрелок: секция там
   занята одной карточкой, а направление выбирается пилюлей «Тарифы» в шапке.

   За пилюлей стоит настоящий <select>, растянутый поверх неё и прозрачный.
   Так по нажатию открывается системный список: на айфоне — барабан Safari, на
   андроиде — свой диалог. Самодельная панель этого не даёт: нативный список
   рисуется поверх страницы средствами ОС, ощущается частью телефона, а не
   сайта, и бесплатно приносит прокрутку, жесты и доступность. */

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

  const shellRef = useRef<HTMLDivElement>(null);
  /* Карточка растёт и сжимается за содержимым — см. useServiceCardHeight.
     Ключ включает и направление, и выбранный в нём тариф: меняется любое из
     двух, меняется и список пунктов. Только для портрета. */
  useServiceCardHeight(shellRef, `${activeService}:${tierByService[activeService]}`);

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

  /* Свой пикер у каждой карточки, а не один на активную. Иначе при выборе
     React уничтожает тот самый <select>, который пользователь только что
     трогал, вместе с уходящей карточкой — а на телефоне поверх него в этот
     момент стоит системный список. Рисуем его только у средней копии: на
     мобильном видна именно она, а плодить лишние <select> ради копий,
     которых там не видно, незачем. */
  const renderPicker = (serviceId: Service['id']) => (
    <div className="service-picker">
      <img src={tariffsIcon} alt="" />
      <span>Тарифы</span>
      <select
        className="service-picker__select"
        aria-label="Направление услуг"
        value={serviceId}
        onChange={(event) => setActiveService(event.target.value)}
      >
        {SERVICES.map((service) => (
          <option value={service.id} key={service.id}>{service.title}</option>
        ))}
      </select>
    </div>
  );

  return (
    <section className="services" aria-label="Услуги">
      <div className="services__shell reveal reveal--scroll-card" ref={shellRef}>
        <header className="services__head">
          <div className="services__intro">
            <h2 className="services__title">Тарифы</h2>
            <p className="services__note">
              Конечная стоимость проекта обсуждается после брифинга
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
                 она, у неё же живёт пикер. Копии по краям нужны ради круга и
                 в портрете скрыты — там прячется всё, кроме активной. */
              const isPrimary = copy === 1;

              return (
                <ServiceBlock
                  service={service}
                  active={isPrimary && activeService === service.id}
                  activeTierId={tierByService[service.id]}
                  onTierChange={(tierId) => selectTier(service.id, tierId)}
                  picker={isPrimary ? renderPicker(service.id) : undefined}
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

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SERVICES, VISIBLE_SERVICES, type Service } from '../data/services';
import { useServiceCardHeight } from '../hooks/useServiceCardHeight';
import { ServiceBlock } from './ServiceBlock';
import navArrow from '../assets/icons/tariffs-nav-arrow.svg';
import tariffsIcon from '../assets/icons/tariffs-arrow.svg';

/* Десктоп (Figma, node 365:1192): шапка «Тарифы» с подписью и парой стрелок,
   под ней ряд из трёх карточек. Направлений пять, поэтому ряд едет вбок —
   стрелки сдвигают его на одну карточку.

   Мобильный макет (node 278:2318) не рисует ни ряда, ни стрелок: секция там
   занята одной карточкой, а направление выбирается пилюлей «Тарифы» в шапке.

   За пилюлей стоит настоящий <select>, растянутый поверх неё и прозрачный.
   Так по нажатию открывается системный список: на айфоне — барабан Safari, на
   андроиде — свой диалог. Самодельная панель этого не даёт: нативный список
   рисуется поверх страницы средствами ОС, ощущается частью телефона, а не
   сайта, и бесплатно приносит прокрутку, жесты и доступность. */

const MAX_START = Math.max(0, SERVICES.length - VISIBLE_SERVICES);

export function Services() {
  const [activeService, setActiveService] = useState<Service['id']>(SERVICES[0].id);
  const [tierByService, setTierByService] = useState<Record<string, string>>(() =>
    Object.fromEntries(SERVICES.map((service) => [service.id, service.defaultTier])),
  );
  const [start, setStart] = useState(0);

  const shellRef = useRef<HTMLDivElement>(null);
  /* Карточка растёт и сжимается за содержимым — см. useServiceCardHeight.
     Ключ включает и направление, и выбранный в нём тариф: меняется любое из
     двух, меняется и список пунктов. Только для портрета. */
  useServiceCardHeight(shellRef, `${activeService}:${tierByService[activeService]}`);

  /* Ряд листается только на десктопе. После поворота в портрет сдвиг надо
     обнулить, иначе вернувшись в ландшафт пользователь увидит не тот кусок
     ряда, что до поворота. */
  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)');
    const reset = () => { if (portrait.matches) setStart(0); };

    reset();
    portrait.addEventListener('change', reset);
    return () => portrait.removeEventListener('change', reset);
  }, []);

  const selectTier = (serviceId: Service['id'], tierId: string) => {
    setTierByService((previous) => ({ ...previous, [serviceId]: tierId }));
  };

  /* Свой пикер у каждой карточки, а не один на активную. Иначе при выборе
     React уничтожает тот самый <select>, который пользователь только что
     трогал, вместе с уходящей карточкой — а на телефоне поверх него в этот
     момент стоит системный список. Невидимые карточки скрыты display: none,
     так что лишние контролы не мешают ни глазу, ни скринридеру. */
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
              disabled={start === 0}
              onClick={() => setStart((value) => Math.max(0, value - 1))}
            >
              <img src={navArrow} alt="" />
            </button>
            <button
              className="services__nav-button services__nav-button--next"
              type="button"
              aria-label="Следующие тарифы"
              disabled={start >= MAX_START}
              onClick={() => setStart((value) => Math.min(MAX_START, value + 1))}
            >
              <img src={navArrow} alt="" />
            </button>
          </div>
        </header>

        <div className="services__viewport">
          <div
            className="services__cards"
            style={{ '--tariff-start': start } as CSSProperties}
          >
            {SERVICES.map((service) => (
              <ServiceBlock
                service={service}
                active={activeService === service.id}
                activeTierId={tierByService[service.id]}
                onTierChange={(tierId) => selectTier(service.id, tierId)}
                picker={renderPicker(service.id)}
                key={service.id}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

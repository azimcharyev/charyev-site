import { useRef, useState } from 'react';
import { SERVICES, type Service } from '../data/services';
import { useServiceCardHeight } from '../hooks/useServiceCardHeight';
import { ServiceBlock } from './ServiceBlock';
import tariffsIcon from '../assets/icons/tariffs-arrow.svg';

/* Мобильный макет (Figma, node 278:2318) не рисует ряд кнопок «Контент /
   Фото / Продакшн»: секция там занята одной карточкой. Направление выбирается
   пилюлей «Тарифы» в шапке.

   За пилюлей стоит настоящий <select>, растянутый поверх неё и прозрачный.
   Так по нажатию открывается системный список: на айфоне — барабан Safari, на
   андроиде — свой диалог. Самодельная панель этого не даёт: нативный список
   рисуется поверх страницы средствами ОС, ощущается частью телефона, а не
   сайта, и бесплатно приносит прокрутку, жесты и доступность.

   На десктопе пилюля скрыта — там все три направления разложены в колонки. */

export function Services() {
  const [activeService, setActiveService] = useState<Service['id']>(SERVICES[0].id);
  const [tierByService, setTierByService] = useState<Record<string, string>>(() =>
    Object.fromEntries(SERVICES.map((service) => [service.id, service.defaultTier])),
  );

  const shellRef = useRef<HTMLDivElement>(null);
  /* Карточка растёт и сжимается за содержимым — см. useServiceCardHeight.
     Ключ включает и направление, и выбранный в нём тариф: меняется любое из
     двух, меняется и список пунктов. */
  useServiceCardHeight(shellRef, `${activeService}:${tierByService[activeService]}`);

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
        onChange={(event) => setActiveService(event.target.value as Service['id'])}
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
        <nav className="services__nav" aria-label="Направления услуг">
          {SERVICES.map((service) => (
            <button
              className="services__nav-button"
              type="button"
              aria-pressed={activeService === service.id}
              onClick={() => setActiveService(service.id)}
              key={service.id}
            >
              {service.title}
            </button>
          ))}
        </nav>

        <div className="services__cards">
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
    </section>
  );
}

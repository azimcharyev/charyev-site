import type { ReactNode } from 'react';
import { getTelegramHref, type Service } from '../data/services';
import bullet from '../assets/icons/bullet.svg';
import { typographText } from '../utils/typography';

type ServiceBlockProps = {
  service: Service;
  active?: boolean;
  /** Выбранный тариф. Состояние живёт в Services: на мобильном тариф и
      категорию задаёт одна и та же панель, поэтому карточка управляемая. */
  activeTierId: string;
  onTierChange: (tierId: string) => void;
  /** Слот в шапке карточки. На мобильном сюда попадает пилюля «Тарифы»,
      на десктопе он пустой. */
  picker?: ReactNode;
};

export function ServiceBlock({
  service,
  active = false,
  activeTierId,
  onTierChange,
  picker,
}: ServiceBlockProps) {
  const tier = service.tiers.find((item) => item.id === activeTierId) ?? service.tiers[0];
  const panelId = `panel-${service.id}`;
  /* Ряд пилюль нужен только там, где есть из чего выбирать: у «Фото»,
     «Ведения соцсетей» и «Маркетингового анализа» тариф один. */
  const hasTiers = service.tiers.length > 1;

  return (
    <article
      className={`service-card service-card--${service.id}${active ? ' is-active' : ''}`}
      aria-labelledby={`service-${service.id}`}
    >
      <div className="service-card__head">
        <h2 className="service-card__title" id={`service-${service.id}`}>{typographText(service.title)}</h2>
        {picker}
      </div>

      {hasTiers && (
        <div className="service-card__tabs" role="tablist" aria-label={`Тарифы: ${service.title}`}>
          {service.tiers.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${service.id}-${item.id}`}
              className="service-card__tab"
              aria-selected={item.id === tier.id}
              aria-controls={panelId}
              onClick={() => onTierChange(item.id)}
            >
              {typographText(item.label)}
            </button>
          ))}
        </div>
      )}

      {/* Список сверху, цена с кнопкой снизу — карточка держит высоту из
          макета (740), и низ прижат к её нижней кромке независимо от того,
          сколько пунктов в тарифе. */}
      <div
        className="service-card__body"
        id={panelId}
        role={hasTiers ? 'tabpanel' : undefined}
        aria-labelledby={hasTiers ? `tab-${service.id}-${tier.id}` : undefined}
        key={tier.id}
      >
        <ul className="service-card__features">
          {tier.features.map((feature) => (
            <li key={feature}>
              <img src={bullet} alt="" />
              <span>{typographText(feature)}</span>
            </li>
          ))}
        </ul>

        <div className="service-card__summary">
          <div className="service-card__price">
            <span>Цена:</span>
            <strong>{typographText(tier.price)}</strong>
          </div>
          {/* Ссылка, а не кнопка: ведёт в телеграм Азима с уже набранным
              сообщением — см. getTelegramHref. */}
          <a
            className="service-card__cta"
            href={getTelegramHref(service, tier)}
            target="_blank"
            rel="noreferrer"
          >
            Выбрать
          </a>
        </div>
      </div>
    </article>
  );
}

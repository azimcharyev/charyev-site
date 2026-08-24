import type { ReactNode } from 'react';
import type { Service } from '../data/services';
import bullet from '../assets/icons/bullet.svg';

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

  return (
    <article
      className={`service-card service-card--${service.id}${active ? ' is-active' : ''}`}
      aria-labelledby={`service-${service.id}`}
    >
      <div className="service-card__head">
        <h2 className="service-card__title" id={`service-${service.id}`}>{service.title}</h2>
        {picker}
      </div>
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
            {item.label}
          </button>
        ))}
      </div>

      <div
        className="service-card__body"
        id={panelId}
        role="tabpanel"
        aria-labelledby={`tab-${service.id}-${tier.id}`}
        key={tier.id}
      >
        {/* Три группы, а не плоский список: на мобильном карточка держит
            фиксированную высоту, и по ней раскладывается сетка 1fr / auto / 1fr
            — описание сверху, плашка ровно по центру, цена с кнопкой внизу.
            Равные крайние дорожки и дают точный центр. */}
        <div className="service-card__lead">
          {tier.description && <p className="service-card__description">{tier.description}</p>}
        </div>

        <ul className="service-card__features">
          {tier.features.map((feature) => (
            <li key={feature}>
              <img src={bullet} alt="" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="service-card__summary">
          <div className="service-card__price">
            <span>Цена:</span>
            <strong>{tier.price}</strong>
          </div>
          {tier.note && <p className="service-card__note">{tier.note}</p>}
          <button className="service-card__cta" type="button">Выбрать</button>
        </div>
      </div>
    </article>
  );
}

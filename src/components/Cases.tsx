import { useEffect, useRef, useState, type CSSProperties } from 'react';
import caseArrow from '../assets/icons/case-arrow.svg';
import eye from '../assets/icons/case-hint-eye.svg';
import filterPhoto from '../assets/icons/cases-photo.svg';
import filterShort from '../assets/icons/cases-reels.svg';
import filterVideo from '../assets/icons/cases-video.svg';
import { CASES_BY_ID, CASE_GALLERY, getCaseHref } from '../data/caseDetails';
import { SilentVideo } from './SilentVideo';

type FilterId = keyof typeof CASE_GALLERY;

const filters: Array<{ id: FilterId; label: string; icon: string; width: number; height: number }> = [
  { id: 'short', label: 'Короткие ролики', icon: filterShort, width: 20, height: 30 },
  { id: 'video', label: 'Видео', icon: filterVideo, width: 26, height: 17 },
  { id: 'photo', label: 'Фото', icon: filterPhoto, width: 25, height: 25 },
];

export function Cases() {
  const [activeFilter, setActiveFilter] = useState<FilterId>('short');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const items = CASE_GALLERY[activeFilter];

  useEffect(() => {
    const section = sectionRef.current;
    const portrait = window.matchMedia('(orientation: portrait)');
    if (!section) return;

    let observer: IntersectionObserver | null = null;

    const syncObserver = () => {
      observer?.disconnect();
      observer = null;

      if (!portrait.matches) {
        setIsMenuVisible(false);
        setIsMenuOpen(false);
        return;
      }

      /* Считаем секцию «в кадре», когда она пересекает среднюю пятую часть
         экрана. Порог по доле самой секции здесь не годится: лента из шести
         плиток выше трёх тысяч пикселей, в экран влезает от силы её четверть,
         и прежние 25% были недостижимы — переключатель не появлялся вовсе.

         Побочный эффект ровно тот, что нужен: когда снизу приходит футер и
         занимает середину экрана, секция из полосы выходит и меню уезжает
         вниз само. */
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsMenuVisible(entry.isIntersecting);
          if (!entry.isIntersecting) setIsMenuOpen(false);
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
      );
      observer.observe(section);
    };

    syncObserver();
    portrait.addEventListener('change', syncObserver);

    return () => {
      observer?.disconnect();
      portrait.removeEventListener('change', syncObserver);
    };
  }, []);

  const selectFilter = (filter: FilterId) => {
    setActiveFilter(filter);
    setIsMenuOpen(false);
  };

  return (
    <section
      className={`cases cases--${activeFilter}`}
      id="cases"
      aria-label="Кейсы"
      data-free-scroll
      ref={sectionRef}
    >
      <div
        className={`cases__filter-track${isMenuVisible ? ' is-visible' : ''}${isMenuOpen ? ' is-open' : ''}`}
      >
        <button
          className="cases__filter-toggle"
          type="button"
          aria-label="Открыть меню типов кейсов"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="cases__filters" aria-label="Фильтр кейсов">
          {filters.map((filter) => (
            <div className="cases__filter-guard" key={filter.id}>
              <button
                className="cases__filter-button"
                type="button"
                aria-pressed={activeFilter === filter.id}
                aria-label={filter.label}
                onClick={() => selectFilter(filter.id)}
              >
                <span
                  className="cases__filter-icon"
                  style={{
                    '--filter-icon': `url("${filter.icon}")`,
                    width: `calc(${filter.width} * var(--px))`,
                    height: `calc(${filter.height} * var(--px))`,
                  } as CSSProperties}
                  aria-hidden="true"
                />
              </button>
              <span className="cases__filter-label" aria-hidden="true">
                {filter.label}
              </span>
            </div>
          ))}
        </nav>

        <button
          className="cases__filter-close"
          type="button"
          aria-label="Закрыть меню типов кейсов"
          onClick={() => setIsMenuOpen(false)}
        >
          <span />
        </button>
      </div>

      <div className="cases__grid">
        {items.map((item, index) => {
          const isPackagedCase = 'caseId' in item;
          const media = item.media.type === 'video' ? (
            <SilentVideo src={item.media.src} />
          ) : (
            <img src={item.media.src} alt="" loading="lazy" draggable="false" />
          );

          if (!isPackagedCase) {
            return (
              <article
                className="case-tile case-tile--standalone"
                style={{ '--tile-index': index } as CSSProperties}
                aria-label="Самостоятельный видеоролик"
                key={`${activeFilter}-standalone-${item.media.src}`}
              >
                {media}
              </article>
            );
          }

          const caseData = CASES_BY_ID[item.caseId];
          const hintPathId = `case-hint-path-${activeFilter}-${item.caseId}-${index}`;

          return (
            <a
              className={`case-tile${activeFilter === 'video' ? ' case-tile--horizontal' : ''}`}
              href={getCaseHref(item.caseId)}
              aria-label={`Открыть кейс «${caseData.title}»`}
              style={{ '--tile-index': index } as CSSProperties}
              key={`${activeFilter}-${item.caseId}-${index}`}
            >
              {media}
              <span className="case-tile__hint" aria-hidden="true">
                <svg className="case-tile__hint-ring" viewBox="0 0 260 260">
                  <defs>
                    <path
                      id={hintPathId}
                      d="M130 130 m0 -104 a104 104 0 1 1 0 208 a104 104 0 1 1 0 -208"
                    />
                  </defs>
                  <text textLength="520" lengthAdjust="spacing">
                    <textPath href={`#${hintPathId}`}>Наведи и посмотри</textPath>
                  </text>
                </svg>
                <img className="case-tile__hint-eye" src={eye} alt="" />
              </span>
              <span className="case-tile__overlay">
                <span className="case-tile__copy">
                  <strong>{caseData.title}</strong>
                  <span>{caseData.teaser}</span>
                </span>
                {/* На десктопе это подпись, на мобильном — компактная пилюля
                    со стрелкой (макет, node 331:408). Разметка одна, лишнее
                    прячет CSS. */}
                <span className="case-tile__cta">
                  <span className="case-tile__cta-label">Посмотреть кейс</span>
                  <img className="case-tile__cta-arrow" src={caseArrow} alt="" />
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

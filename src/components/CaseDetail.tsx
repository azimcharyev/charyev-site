import { useEffect, useState } from 'react';
import back from '../assets/icons/case-back.svg';
import bullet from '../assets/icons/case-bullet.svg';
import externalLink from '../assets/icons/external-link.svg';
import instagram from '../assets/icons/case-instagram.svg';
import { CASE_DETAILS, CASES_BY_ID, type CaseMedia } from '../data/caseDetails';
import { useCaseScrollMotion } from '../hooks/useCaseScrollMotion';
import { Footer } from './Footer';
import { SilentVideo } from './SilentVideo';

function FactList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <img src={bullet} alt="" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectMedia({ media }: { media: CaseMedia }) {
  if (media.type === 'video') {
    return (
      <SilentVideo
        src={media.src}
        style={{ objectPosition: media.position, filter: media.tone === 'dark' ? 'brightness(.58)' : undefined }}
      />
    );
  }

  return (
    <img
      src={media.src}
      alt=""
      loading="lazy"
      draggable="false"
      style={{ objectPosition: media.position }}
    />
  );
}

export function CaseDetail() {
  const requestedCase = new URLSearchParams(window.location.search).get('case') ?? 'nikolay-petrov';
  const caseData = CASES_BY_ID[requestedCase] ?? CASE_DETAILS[0];
  const isDenseCase = caseData.facts.reduce((total, fact) => total + fact.items.length, 0) > 6;
  const isHorizontalCase = caseData.layout === 'horizontal';
  /* Описание на мобильном — панель поверх кадров, а не колонка сбоку: по
     кнопке «Описание» фон уходит в размытие и поверх него выезжает карточка.
     На десктопе карточка видна всегда, и состояние ни на что не влияет. */
  const [isAboutOpen, setAboutOpen] = useState(false);
  useCaseScrollMotion();

  useEffect(() => {
    document.title = `${caseData.title} — кейс Азима Чарыева`;
  }, [caseData.title]);

  useEffect(() => {
    if (!isAboutOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAboutOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isAboutOpen]);

  return (
    <div className={`case-site${isAboutOpen ? ' is-about-open' : ''}`}>
      <main className={`case-page${isHorizontalCase ? ' case-page--horizontal' : ''}`}>
        <div className="case-page__sidebar">
          <aside
            className={`case-page__card${isDenseCase ? ' case-page__card--dense' : ''}`}
            id="case-about"
          >
            <div className="case-page__summary">
              <h1>{caseData.title}</h1>
              <p className="case-page__intro">{caseData.intro}</p>
            </div>

            {caseData.facts.map((fact) => (
              <section className="case-page__fact" key={fact.title}>
                <h2>{fact.title}</h2>
                <FactList items={fact.items} />
              </section>
            ))}
          </aside>

          <nav className="case-page__nav" aria-label="Навигация по кейсу">
            <a className="case-page__back" href="/#cases" aria-label="Вернуться к кейсам">
              <img src={back} alt="" />
            </a>
            {/* Кнопка живёт только в мобильной раскладке: на десктопе описание
                и так лежит слева отдельной колонкой. */}
            <button
              className="case-page__about"
              type="button"
              aria-label="Описание проекта"
              aria-expanded={isAboutOpen}
              aria-controls="case-about"
              onClick={() => setAboutOpen((open) => !open)}
            >
              {/* Два состояния из макета: закрытая — бирюзовая с подписью,
                  открытая — белая с крестиком. Оба лежат в разметке, нужное
                  показывает CSS по классу на .case-site. */}
              <span className="case-page__about-label">Описание</span>
              <span className="case-page__about-close" aria-hidden="true" />
            </button>
            {/* Ссылка на ролик — вторая кнопка острова у горизонтальных кейсов
                (макет, node 351:531). Пока адреса нет, рисуем тем же видом, но
                не ссылкой: <a> без href не фокусируется и не кликается, так что
                обещания перехода не будет — ни мышью, ни с клавиатуры, ни
                скринридеру. Появится адрес в данных — станет настоящей. */}
            {isHorizontalCase && (
              caseData.link ? (
                <a
                  className="case-page__link"
                  href={caseData.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={externalLink} alt="" />
                  <span>{caseData.title}</span>
                </a>
              ) : (
                <span className="case-page__link is-empty">
                  <img src={externalLink} alt="" />
                  <span>{caseData.title}</span>
                </span>
              )
            )}
            {caseData.instagram && (
              <a
                className="case-page__instagram"
                href={`https://www.instagram.com/${caseData.instagram}/`}
                target="_blank"
                rel="noreferrer"
              >
                <img src={instagram} alt="" />
                <span>{caseData.instagram}</span>
              </a>
            )}
          </nav>
        </div>

        {isAboutOpen && (
          <button
            className="case-page__scrim"
            type="button"
            aria-label="Закрыть описание"
            onClick={() => setAboutOpen(false)}
          />
        )}

        <section
          className={`case-page__media${isHorizontalCase ? ' case-page__media--horizontal' : ''}`}
          aria-label={`Материалы проекта «${caseData.title}»`}
        >
          {isHorizontalCase ? (
            caseData.media.map((media, index) => (
              <div
                className="case-page__media-row case-page__media-row--horizontal"
                key={`${media.src}-${index}`}
              >
                <figure className="case-page__visual">
                  <ProjectMedia media={media} />
                </figure>
              </div>
            ))
          ) : (
            <>
              <div className="case-page__media-row case-page__media-row--top">
                {caseData.media.slice(0, 2).map((media, index) => (
                  <figure className="case-page__visual" key={`${media.src}-${index}`}>
                    <ProjectMedia media={media} />
                  </figure>
                ))}
              </div>
              <div className="case-page__media-row case-page__media-row--bottom">
                {caseData.media.slice(2).map((media, index) => (
                  <figure className="case-page__visual" key={`${media.src}-${index}`}>
                    <ProjectMedia media={media} />
                  </figure>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

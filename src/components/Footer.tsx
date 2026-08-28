import instagram from '../assets/icons/instagram.svg';
import mail from '../assets/icons/mail.svg';
import phone from '../assets/icons/phone.svg';
import qr from '../assets/icons/contact-qr.png';
import telegram from '../assets/icons/telegram.svg';
import whatsapp from '../assets/icons/whatsapp.svg';
import youtube from '../assets/icons/youtube.svg';

const PHONE_PRETTY = '+7 (919) 186 - 52 - 08';
const PHONE_DESKTOP = '+7\u00a0(919)\u00a0186-52-08';
const PHONE_HREF = 'tel:+79191865208';
const PRIVACY_HREF = '/privacy.html';

const socials = [
  { label: 'Instagram', icon: instagram, href: 'https://www.instagram.com/azim.charyev.cinema/' },
  { label: 'Telegram', icon: telegram, href: 'https://t.me/charyev_azim' },
  {
    label: 'WhatsApp',
    icon: whatsapp,
    href: 'https://api.whatsapp.com/send/?phone=89056576030&text&type=phone_number&app_absent=0',
  },
  { label: 'YouTube', icon: youtube, href: 'https://www.youtube.com/@azim.charyev/featured' },
];
const mobileSocials = [socials[0], socials[3], socials[2], socials[1]];

export function Footer() {
  return (
    <footer className="footer" aria-label="Контакты">
      {/* Desktop: точная композиция Figma, node 397:1795. Отдельная разметка
          не даёт перестройке трёх колонок затронуть мобильный футер. */}
      <div className="footer__shell footer__shell--desktop">
        <div className="footer-desktop__left">
          <a className="footer-desktop__phone" href={PHONE_HREF}>
            <img className="footer-desktop__qr" src={qr} alt="QR-код контакта" />
            <span className="footer-desktop__phone-copy">
              <strong>Наведи камеру<br />телефона и&nbsp;позвони</strong>
              <small>{PHONE_DESKTOP}</small>
            </span>
          </a>

          <a
            className="footer-desktop__copyright"
            href="/"
            aria-label="Перейти на главную страницу"
            title="На главную"
          >
            © Azim Charyev 2026
          </a>
        </div>

        <div className="footer-desktop__center">
          <h2>Об исполнителе</h2>
          <dl className="footer-desktop__about-card">
            <div className="footer-desktop__about-row">
              <dt>Исполнитель</dt>
              <dd>ИП Чарыев Азымберди Оразбердиевич</dd>
            </div>
            <div className="footer-desktop__about-row">
              <dt>ИНН</dt>
              <dd>366237878050</dd>
            </div>
            <div className="footer-desktop__about-row">
              <dt>ОГРНИП</dt>
              <dd>324366800124435</dd>
            </div>
            <p className="footer-desktop__about-note">
              Цены на&nbsp;сайте носят информационный характер и&nbsp;не&nbsp;являются
              публичной офертой. Точная стоимость обсуждается после&nbsp;брифинга.
            </p>
          </dl>

          <a className="footer-desktop__privacy" href={PRIVACY_HREF}>
            Политика обработки персональных данных
          </a>
        </div>

        <div className="footer-desktop__right">
          <div className="footer-desktop__socials">
            <h2>Социальные сети</h2>

            <a className="footer-desktop__mail" href="mailto:azim.charyev@yandex.ru">
              <span className="footer-desktop__mail-icon"><img src={mail} alt="" /></span>
              <span className="footer-desktop__mail-copy">
                <strong>azim.charyev@yandex.ru</strong>
                <small>Нажми и&nbsp;напиши</small>
              </span>
            </a>

            <div className="footer-desktop__social-grid">
              {socials.map((social) => (
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  key={social.label}
                >
                  <img src={social.icon} alt="" />
                </a>
              ))}
            </div>

            <p className="footer-desktop__social-note">
              *Компания Meta&nbsp;— признана в&nbsp;России<br />экстремистской организацией
            </p>
          </div>

          <a
            className="footer-desktop__designer"
            href="https://levmich.studio"
            target="_blank"
            rel="noreferrer"
          >
            Дизайн сайта
          </a>
        </div>
      </div>

      {/* Mobile: Figma, node 328:428. Отдельная разметка сохраняет точный
          порядок блоков и не затрагивает десктопную композицию. */}
      <div className="footer__shell footer__shell--mobile">
        <section className="footer-mobile__about">
          <h2>Об исполнителе</h2>
          <dl className="footer-mobile__about-card">
            <div className="footer-mobile__about-row">
                <dt>Исполнитель</dt>
                <dd>Чарыев Азымберди Оразбердиевич</dd>
            </div>
            <div className="footer-mobile__about-row">
                <dt>Статус</dt>
                <dd>Индивидуальный предприниматель</dd>
            </div>
            <div className="footer-mobile__about-row">
                <dt>ИНН</dt>
                <dd>366237878050</dd>
            </div>
            <div className="footer-mobile__about-row">
                <dt>ОГРНИП</dt>
                <dd>324366800124435</dd>
            </div>
            <p className="footer-mobile__about-note">
              Цены на&nbsp;сайте носят информационный характер и&nbsp;не&nbsp;являются
              публичной офертой.<br />Точная стоимость обсуждается после&nbsp;брифинга.
            </p>
          </dl>
        </section>

        <a className="footer-mobile__contact" href={PHONE_HREF}>
          <span className="footer-mobile__contact-icon"><img src={phone} alt="" /></span>
          <span className="footer-mobile__contact-copy">
            <strong>{PHONE_PRETTY}</strong>
            <small>Нажми и&nbsp;позвони</small>
          </span>
        </a>

        <section className="footer-mobile__socials">
          <h2>Социальные сети</h2>

          <a className="footer-mobile__contact" href="mailto:azim.charyev@yandex.ru">
            <span className="footer-mobile__contact-icon"><img src={mail} alt="" /></span>
            <span className="footer-mobile__contact-copy">
              <strong>azim.charyev@yandex.ru</strong>
              <small>Нажми и&nbsp;напиши</small>
            </span>
          </a>

          <div className="footer-mobile__social-grid">
            {mobileSocials.map((social) => (
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                key={social.label}
              >
                <img src={social.icon} alt="" />
              </a>
            ))}
          </div>

          <p className="footer-mobile__social-note">
            *Компания Meta&nbsp;— признана в&nbsp;России<br />экстремистской организацией
          </p>
        </section>

        <div className="footer-mobile__bottom">
          <a className="footer-mobile__button" href={PRIVACY_HREF}>
            Политика обработки персональных данных
          </a>

          <a
            className="footer-mobile__button"
            href="https://levmich.studio"
            target="_blank"
            rel="noreferrer"
          >
            Дизайн сайта
          </a>

          <a
            className="footer-mobile__copyright"
            href="/"
            aria-label="Перейти на главную страницу"
            title="На главную"
          >
            © Azim Charyev 2026
          </a>
        </div>
      </div>
    </footer>
  );
}

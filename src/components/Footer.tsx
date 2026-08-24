import instagram from '../assets/icons/instagram.svg';
import mail from '../assets/icons/mail.svg';
import phone from '../assets/icons/phone.svg';
import qr from '../assets/icons/contact-qr.png';
import telegram from '../assets/icons/telegram.svg';
import whatsapp from '../assets/icons/whatsapp.svg';
import youtube from '../assets/icons/youtube.svg';

const PHONE = '+7(919)186-52-08';
/* В мобильном макете номер набран с пробелами — так он и подписан. */
const PHONE_PRETTY = '+7 (919) 186 - 52 - 08';
const PHONE_HREF = 'tel:+79191865208';

const socials = [
  { label: 'Instagram', icon: instagram, href: 'https://www.instagram.com/' },
  { label: 'WhatsApp', icon: whatsapp, href: 'https://www.whatsapp.com/' },
  { label: 'Telegram', icon: telegram, href: 'https://telegram.org/' },
  { label: 'YouTube', icon: youtube, href: 'https://www.youtube.com/' },
];

export function Footer() {
  return (
    <footer className="footer" aria-label="Контакты">
      <div className="footer__shell">
        <div className="footer__contacts">
          <section className="footer__group footer__group--mail">
            <h2>Почта</h2>
            <a className="footer__mail" href="mailto:azim.charyev@yandex.ru">
              <span className="footer__mail-icon"><img src={mail} alt="" /></span>
              <span className="footer__mail-copy">
                <strong>azim.charyev@yandex.ru</strong>
                <small>Нажми и напиши</small>
              </span>
            </a>
          </section>

          <section className="footer__group footer__group--phone">
            <h2>Телефон</h2>

            {/* Десктоп: карточка с QR — наводят камеру телефона. */}
            <a className="footer__phone-card" href={PHONE_HREF}>
              <img className="footer__qr" src={qr} alt="QR-код контакта" />
              <span className="footer__phone-copy">
                <strong>Наведи камеру<br />телефона и позвони</strong>
                <small>{PHONE}</small>
              </span>
            </a>

            {/* Мобильный: QR бессмысленен — телефон уже в руке. В макете
                (node 328:747) вместо него карточка «Нажми и позвони», парная
                к почтовой, поэтому и классы переиспользуются. Оба варианта
                лежат в разметке рядом, показывает нужный CSS: так десктопная
                карточка остаётся нетронутой. */}
            <a className="footer__phone-mobile" href={PHONE_HREF}>
              <span className="footer__mail-icon"><img src={phone} alt="" /></span>
              <span className="footer__mail-copy">
                <strong>{PHONE_PRETTY}</strong>
                <small>Нажми и позвони</small>
              </span>
            </a>
          </section>
        </div>

        <p className="footer__copyright">© Azim Charyev 2026</p>

        <div className="footer__right">
          <section className="footer__socials">
            <h2>Социальные сети</h2>
            <div className="footer__social-grid">
              {socials.map((social) => (
                <a href={social.href} target="_blank" rel="noreferrer" key={social.label}>
                  <img src={social.icon} alt="" />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
            <p className="footer__social-note">
              *Компания Meta — признана в России<br />террористической организацией
            </p>
          </section>

          <a className="footer__privacy" href="#privacy">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
}

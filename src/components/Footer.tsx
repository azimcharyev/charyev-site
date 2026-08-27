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

/* Порядок из макета: Instagram и Telegram сверху, WhatsApp и YouTube снизу. */
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
            *Компания Meta — признана в России<br />экстремистской организацией
          </p>
        </section>

        <div className="footer__right">
          <section className="footer__about">
            <h2>Об исполнителе</h2>

            {/* Раскрытие исполнителя. Обязательно для ИП: ФИО (ст. 9 ЗоЗПП),
                ИНН и ОГРНИП (ст. 8 ЗоЗПП, ст. 5 закона о рекламе). Оговорка
                про оферту снимает риск, что прайс с ценами прочитают как
                публичную оферту (ст. 437 ГК). */}
            <dl className="footer__about-card">
              <div className="footer__about-row">
                <dt>Исполнитель</dt>
                <dd>Чарыев Азымберди Оразбердиевич</dd>
              </div>
              <div className="footer__about-row">
                <dt>Статус</dt>
                <dd>Индивидуальный предприниматель</dd>
              </div>
              <div className="footer__about-row">
                <dt>ИНН</dt>
                <dd>366237878050</dd>
              </div>
              <div className="footer__about-row">
                <dt>ОГРНИП</dt>
                <dd>324366800124435</dd>
              </div>
              <p className="footer__about-note">
                Цены на сайте носят информационный характер и не являются публичной
                офертой. Точная стоимость обсуждается после брифинга.
              </p>
            </dl>
          </section>

          <a
            className="footer__designer"
            href="https://levmich.studio"
            target="_blank"
            rel="noreferrer"
          >
            <span>Дизайн сайта</span>
            <span className="footer__designer-emoji" aria-hidden="true">🧑‍💻</span>
          </a>
        </div>

        <p className="footer__copyright">© Azim Charyev 2026</p>
      </div>
    </footer>
  );
}

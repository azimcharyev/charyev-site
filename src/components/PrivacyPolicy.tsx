import { useEffect, useRef } from 'react';
import { Footer } from './Footer';

const OPERATOR_EMAIL = 'azim.charyev@yandex.ru';

export function PrivacyPolicy() {
  const homeButtonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const button = homeButtonRef.current;
    const footer = document.querySelector<HTMLElement>('.policy-site > .footer');
    const policy = document.querySelector<HTMLElement>('.policy-page');
    if (!button || !footer || !policy) return;
    const portrait = window.matchMedia('(orientation: portrait)');
    const visualViewport = window.visualViewport;

    let frame = 0;
    const updateButtonPosition = () => {
      frame = 0;
      /* На мобильных window.innerHeight и видимая область расходятся, когда
         браузер показывает свои верхнюю и нижнюю панели. Берём настоящий rect
         fixed-кнопки и вычитаем уже применённый сдвиг — так получаем её
         исходную нижнюю границу в текущем visual viewport. */
      const currentShift = Number.parseFloat(
        button.style.getPropertyValue('--policy-home-shift'),
      ) || 0;
      const buttonRect = button.getBoundingClientRect();
      const buttonBottom = buttonRect.bottom - currentShift;
      const mobileFooter = footer.querySelector<HTMLElement>('.footer__shell--mobile');
      const desktopFooter = footer.querySelector<HTMLElement>('.footer__shell--desktop');
      const stopTarget = portrait.matches
        ? (mobileFooter ?? footer)
        : (desktopFooter ?? footer);
      const policyBottom = policy.getBoundingClientRect().bottom;
      const footerTop = stopTarget.getBoundingClientRect().top;
      /* Центрируем кнопку в реальном промежутке между островками. Формула
         работает для обоих макетов: на мобильном CSS оставляет 20 px с каждой
         стороны, на десктопе свободное место делится строго пополам. */
      const centeredButtonBottom = (policyBottom + footerTop + buttonRect.height) / 2;
      const shift = Math.min(0, centeredButtonBottom - buttonBottom);
      button.style.setProperty('--policy-home-shift', `${shift}px`);
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateButtonPosition);
    };

    updateButtonPosition();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    visualViewport?.addEventListener('scroll', scheduleUpdate, { passive: true });
    visualViewport?.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      visualViewport?.removeEventListener('scroll', scheduleUpdate);
      visualViewport?.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="policy-site">
      <a
        ref={homeButtonRef}
        className="policy-page__back"
        href="/"
        aria-label="Перейти на главную страницу"
      >
        На главную
      </a>

      <main className="policy-page">
        <header className="policy-page__header">
          <p className="policy-page__date">Редакция от 28 августа 2026 года</p>
          <h1>Политика в&nbsp;отношении обработки персональных данных</h1>
          <p className="policy-page__lead">
            Настоящая Политика определяет порядок обработки и&nbsp;защиты персональных данных
            индивидуальным предпринимателем Чарыевым Азымберди Оразбердиевичем при работе сайта
            <a href="https://azimcharyev.ru"> azimcharyev.ru</a> и&nbsp;общении с&nbsp;его посетителями.
          </p>
        </header>

        <section className="policy-page__section">
          <h2>1. Общие положения</h2>
          <p>
            1.1. Политика составлена в&nbsp;соответствии с&nbsp;Федеральным законом от&nbsp;27.07.2006
            №&nbsp;152-ФЗ «О&nbsp;персональных данных» и&nbsp;иными применимыми нормативными правовыми
            актами Российской Федерации.
          </p>
          <p>
            1.2. Оператор персональных данных: ИП&nbsp;Чарыев Азымберди Оразбердиевич,
            ИНН&nbsp;366237878050, ОГРНИП&nbsp;324366800124435 (далее&nbsp;— Оператор).
          </p>
          <p>
            1.3. Политика распространяется на&nbsp;данные посетителей сайта, лиц, направивших
            обращение или вступивших в&nbsp;договорные отношения с&nbsp;Оператором, а&nbsp;также лиц,
            сведения о&nbsp;которых размещены в&nbsp;портфолио на&nbsp;законном основании.
          </p>
          <p>
            1.4. Политика не&nbsp;регулирует обработку данных на&nbsp;сайтах и&nbsp;в&nbsp;приложениях
            третьих лиц, на&nbsp;которые посетитель переходит по&nbsp;внешним ссылкам.
          </p>
        </section>

        <section className="policy-page__section">
          <h2>2. Какие данные обрабатываются</h2>
          <p>
            2.1. На&nbsp;сайте нет регистрации и&nbsp;форм обратной связи. Оператор получает данные,
            которые пользователь добровольно сообщает по&nbsp;электронной почте, телефону или
            в&nbsp;выбранном мессенджере: имя или псевдоним, номер телефона, адрес электронной почты,
            имя пользователя в&nbsp;социальной сети или мессенджере, сведения о&nbsp;компании,
            проекте и&nbsp;содержание обращения.
          </p>
          <p>
            2.2. При заключении и&nbsp;исполнении договора могут дополнительно обрабатываться
            реквизиты заказчика и&nbsp;иные данные, необходимые для исполнения договора,
            бухгалтерского и&nbsp;налогового учёта.
          </p>
          <p>
            2.3. В&nbsp;портфолио с&nbsp;надлежащего согласия либо на&nbsp;ином законном основании могут
            размещаться имя или псевдоним героя, изображение, голос, видеозапись, ссылка
            на&nbsp;публичный профиль и&nbsp;сведения о&nbsp;проекте.
          </p>
          <p>
            2.4. При загрузке сайта инфраструктура хостинга может автоматически получать
            технические сведения: IP-адрес, тип браузера и&nbsp;устройства, заголовки запроса,
            адрес запрошенной страницы, источник перехода, дату и&nbsp;время обращения. Оператор
            не&nbsp;использует эти сведения для установления личности посетителя или рекламы.
          </p>
          <p>
            2.5. Оператор не&nbsp;намерен обрабатывать специальные категории персональных данных
            и&nbsp;биометрические персональные данные посетителей сайта. Не&nbsp;следует сообщать такие
            сведения в&nbsp;обычном обращении.
          </p>
        </section>

        <section className="policy-page__section">
          <h2>3. Цели и&nbsp;правовые основания обработки</h2>
          <div className="policy-page__table" role="table" aria-label="Цели обработки данных">
            <div className="policy-page__table-row" role="row">
              <strong role="cell">Ответ на&nbsp;обращение и&nbsp;обсуждение проекта</strong>
              <span role="cell">
                Согласие пользователя и&nbsp;действия по&nbsp;его инициативе до&nbsp;заключения договора.
              </span>
            </div>
            <div className="policy-page__table-row" role="row">
              <strong role="cell">Заключение и&nbsp;исполнение договора</strong>
              <span role="cell">
                Необходимость заключить или исполнить договор, стороной которого является субъект
                персональных данных.
              </span>
            </div>
            <div className="policy-page__table-row" role="row">
              <strong role="cell">Бухгалтерский, налоговый и&nbsp;иной обязательный учёт</strong>
              <span role="cell">Выполнение обязанностей, установленных законодательством РФ.</span>
            </div>
            <div className="policy-page__table-row" role="row">
              <strong role="cell">Публикация кейсов и&nbsp;портфолио</strong>
              <span role="cell">
                Отдельное согласие на&nbsp;обработку данных, разрешённых для распространения,
                договор или иное предусмотренное законом основание.
              </span>
            </div>
            <div className="policy-page__table-row" role="row">
              <strong role="cell">Работа и&nbsp;безопасность сайта</strong>
              <span role="cell">
                Законные интересы Оператора при условии соблюдения прав и&nbsp;свобод посетителей.
              </span>
            </div>
          </div>
        </section>

        <section className="policy-page__section">
          <h2>4. Порядок и&nbsp;способы обработки</h2>
          <p>
            4.1. Оператор может осуществлять сбор, запись, систематизацию, накопление, хранение,
            уточнение, извлечение, использование, предоставление в&nbsp;предусмотренных законом
            случаях, блокирование, удаление и&nbsp;уничтожение персональных данных с&nbsp;использованием
            средств автоматизации и&nbsp;без их&nbsp;использования.
          </p>
          <p>
            4.2. Обрабатываются только данные, необходимые для конкретных и&nbsp;законных целей.
            Оператор принимает разумные правовые, организационные и&nbsp;технические меры для защиты
            данных от&nbsp;неправомерного доступа, изменения, раскрытия или уничтожения.
          </p>
          <p>
            4.3. Доступ к&nbsp;данным предоставляется только лицам, которым он&nbsp;необходим для
            достижения заявленной цели, исполнения договора или обязанности по&nbsp;закону.
          </p>
        </section>

        <section className="policy-page__section">
          <h2>5. Сроки хранения и&nbsp;прекращение обработки</h2>
          <p>
            5.1. Данные обращения, которое не&nbsp;привело к&nbsp;заключению договора, хранятся
            не&nbsp;дольше одного года после последнего содержательного контакта, если более долгий
            срок не&nbsp;нужен для защиты законных интересов Оператора.
          </p>
          <p>
            5.2. Данные, связанные с&nbsp;договором, расчётами и&nbsp;обязательным учётом, хранятся
            в&nbsp;течение срока действия договора и&nbsp;после него&nbsp;— в&nbsp;пределах сроков,
            установленных законодательством РФ.
          </p>
          <p>
            5.3. Данные удаляются или обезличиваются после достижения цели, истечения срока
            хранения, отзыва согласия либо получения законного требования о&nbsp;прекращении обработки,
            если у&nbsp;Оператора отсутствует иное законное основание продолжить обработку.
          </p>
        </section>

        <section className="policy-page__section">
          <h2>6. Хостинг, внешние сервисы и&nbsp;передача данных</h2>
          <p>
            6.1. Сайт размещён с&nbsp;использованием GitHub Pages и&nbsp;сети доставки контента Fastly.
            Эти сервисы могут автоматически обрабатывать технические данные запросов и&nbsp;направлять
            трафик через инфраструктуру, расположенную в&nbsp;разных государствах. Условия такой
            обработки определяются соответствующими поставщиками услуг.
          </p>
          <p>
            6.2. На&nbsp;сайте размещены ссылки на&nbsp;Яндекс Почту, Telegram, WhatsApp, Instagram,
            YouTube и&nbsp;другие внешние ресурсы. Они не&nbsp;встроены в&nbsp;страницу и&nbsp;начинают
            обрабатывать данные после перехода пользователя либо отправки им&nbsp;сообщения.
          </p>
          <p>
            6.3. Выбирая иностранный сервис для связи, пользователь учитывает, что обработка
            и&nbsp;трансграничная передача данных внутри этого сервиса регулируются его собственной
            политикой. Для обращения без использования мессенджеров можно воспользоваться телефоном
            или электронной почтой Оператора.
          </p>
          <p>
            6.4. Оператор не&nbsp;продаёт персональные данные и&nbsp;не&nbsp;передаёт их&nbsp;третьим лицам
            для самостоятельной рекламы. Передача допускается с&nbsp;согласия субъекта, для исполнения
            договора, по&nbsp;поручению Оператора с&nbsp;обязательствами по&nbsp;защите данных либо когда
            этого требует закон.
          </p>
        </section>

        <section className="policy-page__section">
          <h2>7. Cookies и&nbsp;аналитика</h2>
          <p>
            7.1. На&nbsp;дату настоящей редакции сайт не&nbsp;использует системы веб-аналитики,
            рекламные трекеры и&nbsp;не&nbsp;устанавливает собственные файлы cookie.
          </p>
          <p>
            7.2. Браузер может сохранять технический кеш изображений, видео, шрифтов и&nbsp;других
            файлов сайта для ускорения повторной загрузки. Кеш не&nbsp;используется Оператором для
            идентификации или профилирования посетителя и&nbsp;может быть очищен в&nbsp;настройках
            браузера.
          </p>
          <p>
            7.3. Если на&nbsp;сайте появятся формы, аналитика или иные инструменты сбора данных,
            Политика будет обновлена, а&nbsp;там, где это требуется, у&nbsp;пользователя будет запрошено
            отдельное согласие.
          </p>
        </section>

        <section className="policy-page__section">
          <h2>8. Права субъекта персональных данных</h2>
          <p>Субъект персональных данных вправе:</p>
          <ul>
            <li>получать сведения об&nbsp;обработке своих персональных данных;</li>
            <li>требовать уточнения, блокирования или удаления данных;</li>
            <li>отозвать согласие и&nbsp;потребовать прекратить обработку;</li>
            <li>
              устанавливать запреты и&nbsp;условия в&nbsp;отношении данных, разрешённых для
              распространения;
            </li>
            <li>
              обжаловать действия Оператора в&nbsp;Роскомнадзор или суд и&nbsp;пользоваться иными
              правами, предусмотренными законодательством РФ.
            </li>
          </ul>
        </section>

        <section className="policy-page__section policy-page__section--contact">
          <h2>9. Обращения и&nbsp;заключительные положения</h2>
          <p>
            9.1. Для реализации своих прав или получения разъяснений направьте письмо на&nbsp;адрес
            <a href={`mailto:${OPERATOR_EMAIL}`}> {OPERATOR_EMAIL}</a> с&nbsp;темой «Персональные
            данные». В&nbsp;обращении следует указать сведения, позволяющие идентифицировать заявителя
            и&nbsp;найти относящиеся к&nbsp;нему данные. Оператор вправе запросить подтверждение личности,
            чтобы не&nbsp;раскрыть данные постороннему лицу.
          </p>
          <p>
            9.2. Политика действует бессрочно до&nbsp;замены новой редакцией. Актуальная версия всегда
            размещается по&nbsp;адресу
            <a href="https://azimcharyev.ru/privacy.html"> azimcharyev.ru/privacy.html</a>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

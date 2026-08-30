import dentalVideoOne from '../assets/optimized/detail/dental-intro-01.mp4';
import dentalVideoTwo from '../assets/optimized/detail/dental-intro-02.mp4';
import dentalVideoOnePreview from '../assets/optimized/preview/dental-intro-01.mp4';
import dentalVideoTwoPreview from '../assets/optimized/preview/dental-intro-02.mp4';
import dentalPhotoOne from '../assets/cases/dental-implant/photo-01-web.jpg';
import dentalPhotoTwo from '../assets/cases/dental-implant/photo-02-web.jpg';
import lidaVideoOne from '../assets/optimized/detail/lida-intro-01.mp4';
import lidaVideoTwo from '../assets/optimized/detail/lida-intro-02.mp4';
import lidaVideoOnePreview from '../assets/optimized/preview/lida-intro-01.mp4';
import lidaVideoTwoPreview from '../assets/optimized/preview/lida-intro-02.mp4';
import lidaPhotoOne from '../assets/cases/lida-lyutikova/photo-01-web.jpg';
import lidaPhotoTwo from '../assets/cases/lida-lyutikova/photo-02-web.jpg';
import standaloneOne from '../assets/optimized/preview/standalone-01.mp4';
import standaloneTwo from '../assets/optimized/preview/standalone-02.mp4';
import standaloneThree from '../assets/optimized/preview/standalone-03.mp4';
import standaloneFour from '../assets/optimized/preview/standalone-04.mp4';
import standaloneFive from '../assets/optimized/preview/standalone-05.mp4';
import standaloneSix from '../assets/optimized/preview/standalone-06.mp4';
import gogoRentPreview from '../assets/optimized/horizontal-preview/gogo-rent.mp4';
import parkEstatePreview from '../assets/optimized/horizontal-preview/park-estate.mp4';
import okeanyPreview from '../assets/optimized/horizontal-preview/okeany.mp4';
import rolfOilPreview from '../assets/optimized/horizontal-preview/rolf-oil.mp4';
import birthdaySergeyPreview from '../assets/optimized/horizontal-preview/birthday-sergey.mp4';
import texmodPreview from '../assets/optimized/horizontal-preview/texmod.mp4';
import gogoRentDetail from '../assets/optimized/horizontal-detail/gogo-rent.mp4';
import parkEstateDetail from '../assets/optimized/horizontal-detail/park-estate.mp4';
import okeanyDetail from '../assets/optimized/horizontal-detail/okeany.mp4';
import rolfOilDetail from '../assets/optimized/horizontal-detail/rolf-oil.mp4';
import rolfBackstageDetail from '../assets/optimized/horizontal-detail/rolf-backstage.mp4';
import birthdaySergeyDetail from '../assets/optimized/horizontal-detail/birthday-sergey.mp4';
import texmodDetail from '../assets/optimized/horizontal-detail/texmod.mp4';
/* Съёмки для раздела «Фото» на главной. Это не кейсы: у них нет ни подписи,
   ни страницы — просто кадры. Собираются скриптом optimize-gallery-photos.ps1
   из оригиналов в Assets. */
import galleryGirlOne from '../assets/gallery/photo/girl-01.jpg';
import galleryGirlTwo from '../assets/gallery/photo/girl-02.jpg';
import galleryGirlThree from '../assets/gallery/photo/girl-03.jpg';
import galleryDentalOne from '../assets/gallery/photo/dental-01.jpg';
import galleryDentalTwo from '../assets/gallery/photo/dental-02.jpg';
import galleryDentalThree from '../assets/gallery/photo/dental-03.jpg';
import galleryShipsOne from '../assets/gallery/photo/ships-01.jpg';
import galleryShipsTwo from '../assets/gallery/photo/ships-02.jpg';
import galleryShipsThree from '../assets/gallery/photo/ships-03.jpg';
import galleryNikolayOne from '../assets/gallery/photo/nikolay-01.jpg';
import galleryNikolayTwo from '../assets/gallery/photo/nikolay-02.jpg';
import galleryNikolayThree from '../assets/gallery/photo/nikolay-03.jpg';

import rolfPhotoOne from '../assets/cases/horizontal/rolf-oil/rolf-production-01-web.jpg';
import rolfPhotoTwo from '../assets/cases/horizontal/rolf-oil/rolf-production-02-web.jpg';
import { MEDIA, MEDIA_PREVIEW } from './media';

export type CaseMedia = {
  src: string;
  previewSrc?: string;
  type: 'video' | 'image';
  position?: string;
  tone?: 'natural' | 'dark';
};

export type CaseFact = {
  title: string;
  items: string[];
};

/**
 * Аккаунт героя кейса — третья кнопка острова у вертикальных кейсов.
 *
 * Хранится готовым адресом, а не ником: сети разные, и склеивать адрес из
 * шаблона на каждую пришлось бы отдельно. У TikTok в наборе иконок своего
 * значка нет, поэтому там общий значок внешней ссылки.
 */
export type CaseSocial = {
  network: 'instagram' | 'tiktok';
  handle: string;
  href: string;
};

export type CaseDetailData = {
  id: string;
  title: string;
  teaser: string;
  intro: string;
  facts: CaseFact[];
  social?: CaseSocial;
  /**
   * Ссылка на сам ролик — ютуб, вимео, что угодно. В макете горизонтального
   * кейса (node 351:535) это вторая кнопка острова, подписанная названием
   * кейса. Пока адрес не задан, кнопка не рисуется: остаётся одна «назад».
   */
  link?: string;
  layout?: 'vertical' | 'horizontal';
  media: CaseMedia[];
};

export const CASE_DETAILS: CaseDetailData[] = [
  {
    id: 'nikolay-petrov',
    title: 'Николай Петров',
    teaser:
      'Не было ни соцсетей, ни понятного образа. Через месяц один ролик собрал 1,2 млн просмотров.',
    intro:
      'У Николая была впечатляющая история: бизнес, армейская служба, ошибки и потери, которые могли стать основой личного бренда. Но он не вёл соцсети: не было ни позиционирования, ни понимания того, что транслировать аудитории.',
    facts: [
      {
        title: 'Решение',
        items: [
          'Погрузился в биографию и характер, нашёл темы для публичного образа',
          'Сформировал позиционирование и визуальный стиль',
          'Съёмка в разных локациях: предприниматель, мужчина, человек действия',
          'Выстроил систему контента с постепенным раскрытием истории',
        ],
      },
      {
        title: 'Результат',
        items: [
          '1,2 млн просмотров',
          'Более 10 миллионов просмотров на всех платформах',
          'Вокруг Николая сформировалась своя аудитория',
        ],
      },
    ],
    social: {
      network: 'instagram',
      handle: 'nickfcong',
      href: 'https://www.instagram.com/nickfcong/',
    },
    media: [
      { src: MEDIA.standing, previewSrc: MEDIA_PREVIEW.standing, type: 'video', position: '48% center' },
      { src: MEDIA.studio, previewSrc: MEDIA_PREVIEW.studio, type: 'video', tone: 'dark' },
      { src: MEDIA.seated, previewSrc: MEDIA_PREVIEW.seated, type: 'video', position: '48% center' },
      { src: MEDIA.finger, previewSrc: MEDIA_PREVIEW.finger, type: 'video' },
    ],
  },
  {
    id: 'dental-implant',
    title: 'Дентал Имплант',
    teaser:
      'Не было единого визуального языка и понятной линии. Контент превратился в цельный образ клиники.',
    intro:
      'У клиники уже были сильные врачи, хорошая репутация и постоянные пациенты. Но в социальных сетях это почти не чувствовалось: контент выходил разрозненно, без единого визуального языка и понятной линии.',
    facts: [
      {
        title: 'Решение',
        items: [
          'Разобрал позиционирование клиники и причины доверия пациентов',
          'Сформировал контентные направления и единый визуальный стиль',
          'Выстроил систему тем, сценариев, съёмок, рилсов и публикаций',
          'Поставил в центр контента врачей и понятное объяснение лечения',
          'Переупаковал карточки клиники в Яндекс Картах и 2ГИС',
          'Превратил геосервисы в отдельный канал привлечения пациентов',
        ],
      },
      {
        title: 'Результат',
        items: [
          'Социальные сети превратились в цельный образ клиники',
          'Врачи стали узнаваемыми лицами бренда',
          'Контент начал формировать доверие ещё до первого визита',
        ],
      },
    ],
    social: {
      network: 'instagram',
      handle: 'dental___implant',
      href: 'https://www.instagram.com/dental___implant/',
    },
    media: [
      { src: dentalVideoOne, previewSrc: dentalVideoOnePreview, type: 'video' },
      { src: dentalPhotoOne, type: 'image', position: '54% center' },
      { src: dentalVideoTwo, previewSrc: dentalVideoTwoPreview, type: 'video' },
      { src: dentalPhotoTwo, type: 'image', position: '46% center' },
    ],
  },
  {
    id: 'lida-lyutikova',
    title: 'Лида Лютикова',
    teaser:
      'Лиду знали по лёгким роликам. Мы показали спортсменку с характером, амбициями и собственной историей.',
    intro:
      'У Лиды уже была своя аудитория, но в социальных сетях её знали в основном по лёгким роликам, снятым на телефон. Почти не было контента, который показывал бы её как настоящую футболистку: характер, тренировки и уровень игры.',
    facts: [
      {
        title: 'Решение',
        items: [
          'Определил живую и кинематографичную визуальную линию',
          'Соединил характер Лиды, футбол, личные мысли и её энергию',
          'Сохранил естественность без искусственного образа спортсменки',
          'С нуля разработал самостоятельный бренд «Лютик»',
          'Создал логотип, цветовую систему, шрифты и паттерны',
          'Подготовил систему для соцсетей, формы, мерча и полиграфии',
        ],
      },
      {
        title: 'Результат',
        items: [
          'Появился образ молодой спортсменки с характером и амбициями',
          'Новая подача объединила текущую аудиторию с любителями футбола',
        ],
      },
    ],
    social: {
      network: 'tiktok',
      handle: 'lida_lyutik',
      href: 'https://www.tiktok.com/@lida_lyutik?is_from_webapp=1&sender_device=pc',
    },
    media: [
      { src: lidaVideoOne, previewSrc: lidaVideoOnePreview, type: 'video', position: '54% center' },
      { src: lidaPhotoOne, type: 'image', position: '52% center' },
      { src: lidaVideoTwo, previewSrc: lidaVideoTwoPreview, type: 'video' },
      { src: lidaPhotoTwo, type: 'image', position: '48% center' },
    ],
  },
  {
    id: 'gogo-rent',
    title: 'GOGO RENT',
    teaser: 'Техника перестала быть просто товаром — бренд начал продавать эмоцию, свободу и опыт.',
    intro:
      'Мне не хотелось снимать очередной прокат техники: ключи, двигатель, красивый проезд и логотип в конце. Я отталкивался от того, зачем человек вообще берёт эту технику в отпуске. Не ради самого скутера или квадроцикла — ради ощущения, что сегодня можно свернуть с привычного маршрута и увидеть место совсем иначе.',
    facts: [
      {
        title: 'Подход',
        items: [
          'Весь визуал построен вокруг движения, дороги, воздуха и ощущения свободы',
          'Подобраны маршруты и локации, техника снята в реальной среде с людьми в кадре',
        ],
      },
      {
        title: 'Результат',
        items: [
          'Фото и видео стали самостоятельной частью коммуникации GOGO',
          'Бренд начал продавать прежде всего эмоцию и опыт, который человек получает вместе с техникой',
        ],
      },
    ],
    link: 'https://rutube.ru/video/ff3c17f6e307c361d29385b21f9b0127/',
    layout: 'horizontal',
    media: [{ src: gogoRentDetail, previewSrc: gogoRentPreview, type: 'video' }],
  },
  {
    id: 'park-estate',
    title: 'Park Estate',
    teaser: 'Не реклама квадратных метров, а история о жизни, частью которой можно стать вместе с Park Estate.',
    intro:
      'Park Estate — агентство недвижимости в Алании. Здесь мне хотелось уйти от типичного ролика про квадратные метры, красивые фасады и виды на море.',
    facts: [
      {
        title: 'Решение',
        items: [
          'Показать не недвижимость, а жизнь вокруг неё: людей, семьи, прогулки, город и море',
          'Выстроить концепцию, подобрать героев и локации, снять и собрать ролик целиком',
        ],
      },
      {
        title: 'Результат',
        items: ['Получилась небольшая история о мире, частью которого можно стать вместе с Park Estate'],
      },
    ],
    layout: 'horizontal',
    media: [{ src: parkEstateDetail, previewSrc: parkEstatePreview, type: 'video' }],
  },
  {
    id: 'okeany',
    title: 'Океаны',
    teaser: 'Авторский клип без заказчика: от идеи и актёров до съёмки и финального монтажа.',
    intro:
      'Этот клип я снял полностью за свои деньги — без заказчика и без задачи что-то продать. Просто услышал трек, увидел в голове историю и решил сделать её так, как чувствую.',
    facts: [
      {
        title: 'Производство',
        items: [
          'С нуля разработал концепцию и весь визуальный язык',
          'Нашёл профессиональных актёров Воронежского драматического театра и танцоров балета',
          'Подобрал локации, работал как режиссёр и оператор, полностью собрал историю на монтаже',
        ],
      },
      {
        title: 'Съёмка',
        items: [
          'Проект снят на Fujifilm X-T4',
          'Свет, композиция, движение и работа с актёром стали важнее стоимости камеры',
        ],
      },
    ],
    layout: 'horizontal',
    media: [{ src: okeanyDetail, previewSrc: okeanyPreview, type: 'video' }],
  },
  {
    id: 'rolf-oil',
    title: 'Rolf Oil',
    teaser: 'Бэкстейдж рекламной кампании в Турции стал самостоятельной историей о продакшне.',
    intro:
      'Съёмка рекламной кампании Rolf Oil проходила в Турции. Я работал внутри продакшна и отвечал за бэкстейдж проекта.',
    facts: [
      {
        title: 'Подход',
        items: [
          'Не просто фиксировать происходящее за камерой, а собрать самостоятельный визуальный материал',
          'Показать подготовку площадки, работу команды, движение автомобилей, локации и моменты между дублями',
        ],
      },
      {
        title: 'Результат',
        items: ['Бэкстейдж стал отдельной историей о том, как создавался рекламный ролик'],
      },
    ],
    link: 'https://rutube.ru/video/2b436ae866403d7158ae59fbb8ff4edf/',
    layout: 'horizontal',
    media: [
      { src: rolfOilDetail, previewSrc: rolfOilPreview, type: 'video' },
      { src: rolfBackstageDetail, type: 'video' },
      { src: rolfPhotoOne, type: 'image' },
      { src: rolfPhotoTwo, type: 'image' },
    ],
  },
  {
    id: 'birthday-sergey',
    title: 'С днём рождения, Серёжа',
    teaser: 'Живой влог с дня рождения Сергея Косенко в Бодруме — люди, движение и атмосфера дня.',
    intro:
      '23 августа 2023 года останется здесь. Это яркая история о дне рождения известного блогера Сергея Косенко в Бодруме, снятая в формате живого влога.',
    facts: [
      {
        title: 'Задача',
        items: [
          'Поймать сам день: людей, разговоры, поездки, вечер и эмоции',
          'Сохранить всё, что происходило между основными событиями',
        ],
      },
      {
        title: 'Результат',
        items: ['Получился полноценный влог-выпуск, передающий атмосферу и характер этого дня'],
      },
    ],
    link: 'https://rutube.ru/video/80749e13cabd47f15bbedbc19e19594d/',
    layout: 'horizontal',
    media: [{ src: birthdaySergeyDetail, previewSrc: birthdaySergeyPreview, type: 'video' }],
  },
  {
    id: 'texmod',
    title: 'Текс Мод',
    teaser: 'HR-ролик без актёров и пафоса — компания показана через людей, которые её создают.',
    intro:
      'Клиент пришёл с простой задачей: нужен HR-ролик, который поможет привлекать молодых сотрудников. Но мне не хотелось делать очередное видео про «дружную команду, развитие и карьерные возможности».',
    facts: [
      {
        title: 'Решение',
        items: [
          'Показать компанию через людей, которые в ней работают, без актёров и заученных фраз',
          'Сначала поговорить с каждым героем, найти его характер, а затем строить съёмку вокруг него',
        ],
      },
      {
        title: 'Результат',
        items: ['Получилась живая история о компании изнутри и людях, которые каждый день её создают'],
      },
    ],
    link: 'https://rutube.ru/video/fc430b92aeb1d86e21dc71ee481f0659/',
    layout: 'horizontal',
    media: [{ src: texmodDetail, previewSrc: texmodPreview, type: 'video' }],
  },
];

export const CASES_BY_ID = Object.fromEntries(CASE_DETAILS.map((item) => [item.id, item]));

export function getCaseHref(id: string) {
  return `./case.html?case=${id}`;
}

export const STANDALONE_VIDEOS = [
  standaloneOne,
  standaloneTwo,
  standaloneThree,
  standaloneFour,
  standaloneFive,
  standaloneSix,
] as const;

export const CASE_GALLERY = {
  short: [
    { caseId: 'nikolay-petrov', media: { src: MEDIA_PREVIEW.studio, type: 'video' as const } },
    { caseId: 'dental-implant', media: { src: dentalVideoOnePreview, type: 'video' as const } },
    { caseId: 'lida-lyutikova', media: { src: lidaVideoOnePreview, type: 'video' as const } },
    { media: { src: standaloneOne, type: 'video' as const } },
    { media: { src: standaloneTwo, type: 'video' as const } },
    { media: { src: standaloneThree, type: 'video' as const } },
  ],
  video: [
    { caseId: 'gogo-rent', media: { src: gogoRentPreview, type: 'video' as const } },
    { caseId: 'park-estate', media: { src: parkEstatePreview, type: 'video' as const } },
    { caseId: 'okeany', media: { src: okeanyPreview, type: 'video' as const } },
    { caseId: 'rolf-oil', media: { src: rolfOilPreview, type: 'video' as const } },
    { caseId: 'birthday-sergey', media: { src: birthdaySergeyPreview, type: 'video' as const } },
    { caseId: 'texmod', media: { src: texmodPreview, type: 'video' as const } },
  ],
  photo: [
    /* Раздел — чистая галерея: только съёмки, без плиток кейсов. Плитка без
       caseId рисуется как .case-tile--standalone: ни подписи, ни ссылки, ни
       реакции на курсор. На страницы кейсов ведут вкладки «Короткие ролики» и
       «Видео», так что ничего не теряется. */
    { media: { src: galleryGirlOne, type: 'image' as const } },
    { media: { src: galleryGirlTwo, type: 'image' as const } },
    { media: { src: galleryGirlThree, type: 'image' as const } },
    { media: { src: galleryDentalOne, type: 'image' as const } },
    { media: { src: galleryDentalTwo, type: 'image' as const } },
    { media: { src: galleryDentalThree, type: 'image' as const } },
    { media: { src: galleryShipsOne, type: 'image' as const } },
    { media: { src: galleryShipsTwo, type: 'image' as const } },
    { media: { src: galleryShipsThree, type: 'image' as const } },
    { media: { src: galleryNikolayOne, type: 'image' as const } },
    { media: { src: galleryNikolayTwo, type: 'image' as const } },
    { media: { src: galleryNikolayThree, type: 'image' as const } },
  ],
} as const;

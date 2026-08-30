/**
 * Ролики для карточек Hero — отдельный, самый мелкий размер (270 px).
 *
 * Карточки показывают видео шириной 82–135 px, а раньше сюда шли те же
 * 540-пиксельные превью, что и на страницу кейса: по площади это в 16–43 раза
 * лишней работы на кадр. На главной таких карточек четырнадцать, и играют они
 * одновременно, поэтому именно этот перерасход бил по плавности сильнее всего.
 * Дальний план имеет ещё более лёгкие копии 160 px с заранее запечённым
 * размытием: движение сохраняется, но CSS не размывает видео каждый кадр.
 *
 * Ролики сгруппированы по кейсам: в основные карточки Hero попадает ровно
 * один случайный ролик из каждой группы. Поэтому два видео одного героя
 * больше не могут одновременно оказаться на переднем плане.
 */

import studio from '../assets/optimized/thumb/nikolay-studio.mp4';
import seated from '../assets/optimized/thumb/nikolay-seated.mp4';
import standing from '../assets/optimized/thumb/nikolay-standing.mp4';
import closeup from '../assets/optimized/thumb/nikolay-closeup.mp4';
import finger from '../assets/optimized/thumb/nikolay-finger.mp4';
import army from '../assets/optimized/thumb/nikolay-army.mp4';
import dentalOne from '../assets/optimized/thumb/dental-intro-01.mp4';
import dentalTwo from '../assets/optimized/thumb/dental-intro-02.mp4';
import lidaOne from '../assets/optimized/thumb/lida-intro-01.mp4';
import lidaTwo from '../assets/optimized/thumb/lida-intro-02.mp4';
import standaloneOne from '../assets/optimized/thumb/standalone-01.mp4';
import standaloneTwo from '../assets/optimized/thumb/standalone-02.mp4';
import standaloneThree from '../assets/optimized/thumb/standalone-03.mp4';
import standaloneFour from '../assets/optimized/thumb/standalone-04.mp4';
import standaloneFive from '../assets/optimized/thumb/standalone-05.mp4';
import standaloneSix from '../assets/optimized/thumb/standalone-06.mp4';
import chinaFixed from '../assets/optimized/thumb/china-fixed.mp4';
import weddingFixed from '../assets/optimized/thumb/wedding-fixed.mp4';

import studioBackground from '../assets/optimized/thumb-background/nikolay-studio.mp4';
import seatedBackground from '../assets/optimized/thumb-background/nikolay-seated.mp4';
import standingBackground from '../assets/optimized/thumb-background/nikolay-standing.mp4';
import closeupBackground from '../assets/optimized/thumb-background/nikolay-closeup.mp4';
import fingerBackground from '../assets/optimized/thumb-background/nikolay-finger.mp4';
import armyBackground from '../assets/optimized/thumb-background/nikolay-army.mp4';
import dentalOneBackground from '../assets/optimized/thumb-background/dental-intro-01.mp4';
import dentalTwoBackground from '../assets/optimized/thumb-background/dental-intro-02.mp4';
import lidaOneBackground from '../assets/optimized/thumb-background/lida-intro-01.mp4';
import lidaTwoBackground from '../assets/optimized/thumb-background/lida-intro-02.mp4';
import standaloneOneBackground from '../assets/optimized/thumb-background/standalone-01.mp4';
import standaloneTwoBackground from '../assets/optimized/thumb-background/standalone-02.mp4';
import standaloneThreeBackground from '../assets/optimized/thumb-background/standalone-03.mp4';
import standaloneFourBackground from '../assets/optimized/thumb-background/standalone-04.mp4';
import standaloneFiveBackground from '../assets/optimized/thumb-background/standalone-05.mp4';
import standaloneSixBackground from '../assets/optimized/thumb-background/standalone-06.mp4';

export const HERO_CASE_MEDIA = {
  nikolay: [studio, seated, standing, closeup, finger, army],
  dental: [dentalOne, dentalTwo],
  lida: [lidaOne, lidaTwo],
  standalone: [
    standaloneOne,
    standaloneTwo,
    standaloneThree,
    standaloneFour,
    standaloneFive,
    standaloneSix,
  ],
} as const;

export const HERO_MEDIA = Object.values(HERO_CASE_MEDIA).flat();

export const HERO_BACKGROUND_MEDIA = [
  studioBackground,
  seatedBackground,
  standingBackground,
  closeupBackground,
  fingerBackground,
  armyBackground,
  dentalOneBackground,
  dentalTwoBackground,
  lidaOneBackground,
  lidaTwoBackground,
  standaloneOneBackground,
  standaloneTwoBackground,
  standaloneThreeBackground,
  standaloneFourBackground,
  standaloneFiveBackground,
  standaloneSixBackground,
] as const;

const HERO_BACKGROUND_BY_SOURCE = new Map(
  HERO_MEDIA.map((source, index) => [source, HERO_BACKGROUND_MEDIA[index]]),
);

export function getHeroBackgroundMedia(source: string) {
  return HERO_BACKGROUND_BY_SOURCE.get(source) ?? source;
}

/* Эти два ролика заказчик закрепил в композиции Hero: они не участвуют в
   случайной выборке и при каждом открытии остаются на своих местах. */
export const HERO_FIXED_MEDIA = {
  china: chinaFixed,
  wedding: weddingFixed,
} as const;

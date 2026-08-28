/**
 * Ролики для карточек Hero — отдельный, самый мелкий размер (270 px).
 *
 * Карточки показывают видео шириной 82–135 px, а раньше сюда шли те же
 * 540-пиксельные превью, что и на страницу кейса: по площади это в 16–43 раза
 * лишней работы на кадр. На главной таких карточек четырнадцать, и играют они
 * одновременно, поэтому именно этот перерасход бил по плавности сильнее всего.
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

/* Эти два ролика заказчик закрепил в композиции Hero: они не участвуют в
   случайной выборке и при каждом открытии остаются на своих местах. */
export const HERO_FIXED_MEDIA = {
  china: chinaFixed,
  wedding: weddingFixed,
} as const;

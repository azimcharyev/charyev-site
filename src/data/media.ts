import studio from '../assets/optimized/detail/nikolay-studio.mp4';
import seated from '../assets/optimized/detail/nikolay-seated.mp4';
import standing from '../assets/optimized/detail/nikolay-standing.mp4';
import finger from '../assets/optimized/detail/nikolay-finger.mp4';
import studioPreview from '../assets/optimized/preview/nikolay-studio.mp4';
import seatedPreview from '../assets/optimized/preview/nikolay-seated.mp4';
import standingPreview from '../assets/optimized/preview/nikolay-standing.mp4';
import closeupPreview from '../assets/optimized/preview/nikolay-closeup.mp4';
import fingerPreview from '../assets/optimized/preview/nikolay-finger.mp4';
import armyPreview from '../assets/optimized/preview/nikolay-army.mp4';

export const MEDIA = {
  studio,
  seated,
  standing,
  closeup: closeupPreview,
  finger,
  army: armyPreview,
} as const;

export const MEDIA_PREVIEW = {
  studio: studioPreview,
  seated: seatedPreview,
  standing: standingPreview,
  closeup: closeupPreview,
  finger: fingerPreview,
  army: armyPreview,
} as const;

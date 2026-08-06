import React from 'react';
import { PranayamSession } from './PranayamSession';
import { buildTimeline } from './sessionTimeline';

/**
 * The BEGINNER session — 5 minutes of practice per technique, ~30 minutes total.
 * Protocols live in BEGINNER_SPECS (breathPattern.ts); this file only picks the level.
 */
const BEGINNER = buildTimeline('beginner');

export const compositionConfig = {
  id: 'Daily5PranayamBeginner',
  width: 1920,
  height: 1080,
  fps: 30,
  durationInSeconds: BEGINNER.SESSION_SEC,
};

export const Daily5PranayamBeginner: React.FC = () => <PranayamSession level="beginner" />;

export default Daily5PranayamBeginner;

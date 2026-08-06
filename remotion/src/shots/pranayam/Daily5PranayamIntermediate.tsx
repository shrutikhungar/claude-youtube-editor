import React from 'react';
import { PranayamSession } from './PranayamSession';
import { buildTimeline } from './sessionTimeline';

/**
 * The intermediate session — same screen, harder protocol.
 *
 * Everything that differs lives in INTERMEDIATE_SPECS (breathPattern.ts): the forceful
 * techniques run at double speed, rep counts roughly triple, every retention lengthens,
 * and practice is 480s per technique rather than 300s. Nothing about the layout, the
 * ring, the counters or the cue scheduling is duplicated — this file only chooses a
 * level and lets the shared session render itself from that level's numbers.
 *
 * Its narration and breathing tracks live in library/audio/pranayam/intermediate/.
 */
const INTERMEDIATE = buildTimeline('intermediate');

export const compositionConfig = {
  id: 'Daily5PranayamIntermediate',
  width: 1920,
  height: 1080,
  fps: 30,
  durationInSeconds: INTERMEDIATE.SESSION_SEC,
};

export const Daily5PranayamIntermediate: React.FC = () => (
  <PranayamSession level="intermediate" />
);

export default Daily5PranayamIntermediate;

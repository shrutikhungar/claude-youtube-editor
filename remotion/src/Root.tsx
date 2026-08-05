import React from 'react';
import { Composition, AbsoluteFill, Img, staticFile } from 'remotion';
import { shots } from './registry.gen';
import { COLORS } from './brand';
import { FONT_DISPLAY, FONT_BODY } from './fonts';
import { CaptionsOverlay } from './shots/brand/CaptionsOverlay';

/**
 * Third line under each footer block. For the course and app it is the text fallback for
 * the QR codes either side of the banner (a viewer on a TV can read it, a viewer on a
 * phone scans the code); for the contact block it is the custom-routine invitation.
 * A chip rather than a plain line so it reads as an action, not as more tagline.
 */
const FooterChip: React.FC<{ url: string }> = ({ url }) => (
  <div style={{
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(207, 168, 100, 0.16)',
    border: '1px solid rgba(207, 168, 100, 0.45)',
    borderRadius: 8,
    padding: '3px 10px',
    fontFamily: FONT_BODY,
    fontSize: 13,
    fontWeight: 700,
    color: '#f2e2c4',
    letterSpacing: '0.01em',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  }}>
    {url}
  </div>
);

const GlobalWrapper: React.FC<{ children: React.ReactNode; isBottomBanner?: boolean; showCaptions?: boolean }> = ({ children, isBottomBanner = false, showCaptions = false }) => {
  return (
    <AbsoluteFill style={{
      border: `6px solid ${COLORS.accent}`,
      boxSizing: 'border-box'
    }}>
      {children}
      {showCaptions && <CaptionsOverlay />}
      <div style={{
        position: 'absolute',
        top: isBottomBanner ? 'auto' : 0,
        bottom: isBottomBanner ? 0 : 'auto',
        left: 0,
        right: 0,
        height: '110px',
        backgroundColor: '#574c41',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 28px',
        color: COLORS.paper,
        fontFamily: FONT_DISPLAY,
        zIndex: 9999,
        borderTop: '2px solid rgba(207, 168, 100, 0.4)'
      }}>
        {/* Far Left: QR Code 1 */}
        <Img src={staticFile('library/images/FeelingsCourseQR.webp')} style={{ width: 80, height: 80, borderRadius: 12, border: `2px solid ${COLORS.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />

        {/* Section 1: Feelings & Emotions Course — sits beside its own QR code. */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '28px' }}>📖</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '20px', letterSpacing: '0.08em', fontWeight: 700, color: '#fffef7', lineHeight: 1.1 }}>FEELINGS & EMOTIONS COURSE</div>
            <div style={{ fontSize: '13px', color: '#dcc69e', fontFamily: FONT_BODY, letterSpacing: '0.06em', marginTop: 3 }}>Understand • Heal • Transform</div>
            <FooterChip url="skrmblissai.in/FeelingsAndEmotionCourse" />
          </div>
        </div>

        {/* Vertical Divider 1 */}
        <div style={{ width: '1px', height: '54px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />

        {/* Section 2: Contact. The studio wordmark already runs in the top-left header,
            so this slot carries the details a viewer would actually act on. The WhatsApp
            QR sits with it because it is the same call to action. */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {/* Decodes to https://wa.me/918217581238 */}
          <Img src={staticFile('library/images/ReachWhatsapp.png')} style={{ width: 72, height: 72, borderRadius: 10, border: `2px solid ${COLORS.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Body font, not the display face — that one is caps-only and would
                render the address as CONNECT@SKRMBLISSAI.IN. */}
            <div style={{ fontFamily: FONT_BODY, fontSize: '19px', letterSpacing: '0.02em', fontWeight: 700, color: '#fffef7', lineHeight: 1.1 }}>connect@skrmblissai.in</div>
            {/* Named as WhatsApp so the QR beside it is self-explanatory. */}
            <div style={{ fontSize: '15px', color: '#cfa864', fontFamily: FONT_BODY, letterSpacing: '0.06em', marginTop: 3, fontWeight: 700 }}>WhatsApp +91 821 758 1238</div>
            <FooterChip url="Write in for a custom routine" />
          </div>
        </div>

        {/* Vertical Divider 2 */}
        <div style={{ width: '1px', height: '54px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />

        {/* Section 3: MindGym App */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '28px' }}>📱</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '20px', letterSpacing: '0.08em', fontWeight: 700, color: '#fffef7', lineHeight: 1.1 }}>MINDGYM APP</div>
            <div style={{ fontSize: '13px', color: '#dcc69e', fontFamily: FONT_BODY, letterSpacing: '0.06em', marginTop: 3 }}>Practice • Reflect • Evolve</div>
            <FooterChip url="skrmblissai.in/mindgym" />
          </div>
        </div>

        {/* Far Right: QR Code 2 */}
        <Img src={staticFile('library/images/MindGymQR.webp')} style={{ width: 80, height: 80, borderRadius: 12, border: `2px solid ${COLORS.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
      </div>
    </AbsoluteFill>
  );
};

// Every shot file exports `compositionConfig` + a default component. gen-registry.mjs
// discovers them into registry.gen. This maps each to a <Composition>.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {shots.map(({ Comp, config }) => {
        const isBottom = config.id === 'Daily5Pranayam';
        const isMeditation = config.id === 'MeditationEpisode';
        const WrappedComp: React.FC = () => (
          <GlobalWrapper isBottomBanner={isBottom} showCaptions={isMeditation}>
            <Comp />
          </GlobalWrapper>
        );
        return (
          <Composition
            key={config.id}
            id={config.id}
            component={WrappedComp}
            durationInFrames={Math.max(1, Math.round(config.durationInSeconds * config.fps))}
            fps={config.fps}
            width={config.width}
            height={config.height}
          />
        );
      })}
    </>
  );
};

import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

export const compositionConfig = {
  id: 'PromoEndCard',
  durationInSeconds: 18,
  fps: 30,
  width: 1920,
  height: 1080,
};

export const PromoEndCard: React.FC<{ startSec?: number }> = ({ startSec = 0 }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const rawSec = frame / fps;
  const currentTime = startSec > 0 ? Math.max(0, rawSec - startSec) : rawSec % 18;

  // 3 Distinct 6-second slides (0-6s, 6-12s, 12-18s)
  const slideIndex = currentTime < 6 ? 1 : currentTime < 12 ? 2 : 3;
  const relTime = currentTime % 6;
  const opacity = interpolate(relTime, [0, 0.4, 5.6, 6], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, zIndex: 2000 }}>
      {/* Background soft glow */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at center, ${COLORS.accent}20 0%, ${COLORS.paper} 80%)`,
        opacity
      }}>
        {slideIndex === 1 && (
          /* SLIDE 1: Feelings & Emotion Course */
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '60px 80px',
            gap: '50px'
          }}>
            {/* Left: Flyer (100% Complete View with Zero Cropping) */}
            <div style={{
              width: '880px',
              height: '495px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              border: `3px solid ${COLORS.accent}40`,
              backgroundColor: '#fffef7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Img src={staticFile('library/images/CourseFlyerLandscape.webp')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            {/* Right: Info & QR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: '18px', letterSpacing: '0.2em', color: COLORS.accent, fontWeight: 700, textTransform: 'uppercase' }}>
                TRANSFORM YOUR EMOTIONAL HEALTH
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: '44px', fontWeight: 700, color: COLORS.ink, lineHeight: 1.15 }}>
                Understanding Your Feelings & Emotions Course
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: '20px', color: COLORS.ink, opacity: 0.85, lineHeight: 1.5 }}>
                Master emotional regulation, heal core beliefs, and build deep internal peace with our self-paced course.
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
                <Img src={staticFile('library/images/FeelingsCourseQR.webp')} style={{ width: '110px', height: '110px', borderRadius: '16px', border: `3px solid ${COLORS.accent}` }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: '16px', color: COLORS.accent, fontWeight: 700 }}>SCAN TO ENROLL NOW</span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: '18px', color: COLORS.ink, fontWeight: 600, marginTop: '4px' }}>skrmblissai.in/FeelingsAndEmotionCourse</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {slideIndex === 2 && (
          /* SLIDE 2: MindGym Web App (Original Side-by-Side Layout) */
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '60px 80px',
            gap: '50px'
          }}>
            {/* Left: Info & QR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: '18px', letterSpacing: '0.2em', color: COLORS.accent, fontWeight: 700, textTransform: 'uppercase' }}>
                JOIN THE DAILY PRACTICE COMMUNITY
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: '48px', fontWeight: 700, color: COLORS.ink, lineHeight: 1.15 }}>
                MindGym Web App
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: '20px', color: COLORS.ink, opacity: 0.85, lineHeight: 1.5 }}>
                Access daily guided meditations, pranayam timers, progress tracking, and supportive community sessions.
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
                <Img src={staticFile('library/images/MindGymQR.webp')} style={{ width: '110px', height: '110px', borderRadius: '16px', border: `3px solid ${COLORS.accent}` }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: '16px', color: COLORS.accent, fontWeight: 700 }}>ACCESS MINDGYM WEB APP</span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: '18px', color: COLORS.ink, fontWeight: 600, marginTop: '4px' }}>skrmblissai.in/mindgym</span>
                </div>
              </div>
            </div>

            {/* Right: Visual App Banner */}
            <div style={{
              width: '640px',
              height: '420px',
              borderRadius: '24px',
              backgroundColor: 'rgba(250, 248, 245, 0.95)',
              border: `3px solid ${COLORS.accent}40`,
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              textAlign: 'center'
            }}>
              <Img src={staticFile('library/images/MindGymQR.webp')} style={{ width: '180px', height: '180px', borderRadius: '24px', marginBottom: '16px' }} />
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: '32px', fontWeight: 700, color: COLORS.ink }}>MindGym Daily Meditations</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: '18px', color: COLORS.accent, fontWeight: 600, marginTop: '6px' }}>Your Daily Mental Fitness Companion</div>
            </div>
          </div>
        )}

        {slideIndex === 3 && (
          /* SLIDE 3: Studio Finale — 3 Hero Action Cards + Farewell Quote */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '40px 80px',
            gap: '32px',
            textAlign: 'center'
          }}>
            {/* Grand Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                fontFamily: FONT_BODY,
                fontSize: '16px',
                fontWeight: 800,
                color: COLORS.accent,
                letterSpacing: '0.22em',
                textTransform: 'uppercase'
              }}>
                SOULFUL INTELLIGENCE STUDIO
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY,
                fontSize: '52px',
                fontWeight: 700,
                color: COLORS.ink,
                letterSpacing: '0.02em'
              }}>
                CONTINUE YOUR DAILY PRACTICE
              </div>
            </div>

            {/* 3 Hero Interactive Action Cards (Side-by-Side) */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '28px', justifyContent: 'center', width: '100%', maxWidth: '1480px' }}>
              {/* Action 1: LIKE */}
              <div style={{
                flex: 1,
                backgroundColor: 'rgba(255, 253, 248, 0.95)',
                border: `2px solid ${COLORS.accent}60`,
                borderRadius: '28px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 16px 40px rgba(122, 106, 88, 0.12)',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ fontSize: '44px' }}>👍</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: '28px', fontWeight: 700, color: COLORS.ink }}>LIKE</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '15px', color: COLORS.accent, fontWeight: 700 }}>Show support for daily pranayam</div>
              </div>

              {/* Action 2: COMMENT */}
              <div style={{
                flex: 1,
                backgroundColor: 'rgba(255, 253, 248, 0.95)',
                border: `2px solid ${COLORS.accent}60`,
                borderRadius: '28px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 16px 40px rgba(122, 106, 88, 0.12)',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ fontSize: '44px' }}>💬</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: '28px', fontWeight: 700, color: COLORS.ink }}>COMMENT</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '15px', color: COLORS.accent, fontWeight: 700 }}>Share your practice experience</div>
              </div>

              {/* Action 3: SUBSCRIBE */}
              <div style={{
                flex: 1,
                backgroundColor: 'rgba(255, 253, 248, 0.95)',
                border: `2.5px solid ${COLORS.accent}`,
                borderRadius: '28px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 20px 48px rgba(207, 168, 100, 0.25)',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ fontSize: '44px' }}>🔔</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: '28px', fontWeight: 700, color: COLORS.ink }}>SUBSCRIBE</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: '15px', color: COLORS.accent, fontWeight: 800 }}>Join weekly mindfulness series</div>
              </div>
            </div>

            {/* Subtitle Message */}
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: '20px',
              color: COLORS.ink,
              opacity: 0.85,
              maxWidth: '900px',
              lineHeight: 1.4
            }}>
              Subscribe for weekly guided breathwork workouts, meditation sessions, and emotional regulation series.
            </div>

            {/* Peaceful Farewell Quote Banner */}
            <div style={{
              width: '1100px',
              backgroundColor: 'rgba(255, 253, 248, 0.95)',
              border: `2px solid ${COLORS.accent}40`,
              borderRadius: '24px',
              padding: '20px 40px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 12px 32px rgba(122, 106, 88, 0.10)'
            }}>
              <span style={{ fontSize: '24px' }}>🪷</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontStyle: 'italic', color: COLORS.ink, fontWeight: 600 }}>
                "May peace, clarity, and presence remain with you throughout your day. Namaste 🙏"
              </span>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default PromoEndCard;

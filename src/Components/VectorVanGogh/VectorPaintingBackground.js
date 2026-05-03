import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PALETTE } from './palettes';
import { buildStarryNight } from './compositions/StarryNight';

gsap.registerPlugin(ScrollTrigger);

// Compute composition once at module load — zero cost per render.
const IS_MOBILE    = typeof window !== 'undefined' && window.innerWidth < 768;
const COMPOSITION  = buildStarryNight(IS_MOBILE);

const VectorPaintingBackground = () => {
  const svgRef = useRef(null);

  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-mode') !== 'light'
  );

  // Mirror the site's theme toggle so stroke colours update instantly.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-mode') !== 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
    });
    return () => observer.disconnect();
  }, []);

  // Single ScrollTrigger that drives every path's strokeDashoffset.
  // Runs once on mount; stable keys ensure React reuses DOM nodes so the
  // queried elements stay valid across theme re-renders.
  useGSAP(() => {
    if (!svgRef.current) return;

    const pathEls = Array.from(
      svgRef.current.querySelectorAll('path[data-animated]')
    );

    const lengths = pathEls.map((el) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray  = len;
      el.style.strokeDashoffset = len;
      // Hide completely so round-cap bleed at the M point never shows.
      // Flipped to visible on first non-zero frac in onUpdate.
      el.style.opacity = '0';
      return len;
    });

    const trigger = ScrollTrigger.create({
      start:  0,
      end:    'max',
      scrub:  0.4,
      onUpdate(self) {
        for (let i = 0; i < pathEls.length; i++) {
          const ss   = parseFloat(pathEls[i].dataset.scrollStart);
          const se   = parseFloat(pathEls[i].dataset.scrollEnd);
          const frac = Math.max(0, Math.min(1, (self.progress - ss) / (se - ss)));
          if (frac === 0) {
            pathEls[i].style.opacity = '0';
          } else {
            // Remove the override — strokeOpacity attribute provides artistic transparency.
            pathEls[i].style.opacity = '';
            pathEls[i].style.strokeDashoffset = lengths[i] * (1 - frac);
          }
        }
      },
    });

    return () => trigger.kill();
  });

  const palette = isDark ? PALETTE.dark : PALETTE.light;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        zIndex:        -2,
        pointerEvents: 'none',
      }}
      viewBox={COMPOSITION.viewBox}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Organic edge displacement — applied to hills */}
        <filter id="paintTexture" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4"
            xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Soft halo for the moon spiral */}
        <filter id="moonGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Tight glow for star rays */}
        <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {COMPOSITION.pathGroups.map((group) =>
        group.paths.map((path, idx) => (
          <path
            key={`${group.id}-${idx}`}
            d={path.d}
            stroke={palette[path.paletteKey][path.paletteIndex]}
            strokeWidth={path.strokeWidth}
            strokeOpacity={path.opacity}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={path.filter ? `url(#${path.filter})` : undefined}
            data-animated="true"
            data-scroll-start={path.scrollStart}
            data-scroll-end={path.scrollEnd}
          />
        ))
      )}
    </svg>
  );
};

export default VectorPaintingBackground;

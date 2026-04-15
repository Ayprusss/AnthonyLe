import React, { useEffect, useRef } from 'react';

const RIPPLE_SPEED = 0.0082;
const RIPPLE_FREQUENCY = 0.07;
const PARTICLE_SIZE_MULTIPLIER = 1.15;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const HeroRippleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const points = [];
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isRunning = true;
    let centerX = 0;
    let centerY = 0;
    let fieldHalfWidth = 0;
    let fieldHalfHeight = 0;
    let maxDistance = 1;
    let spacing = 24;
    let waveAmplitude = 12.8;
    let drawScale = 1;
    let rippleRgb = '255, 255, 255';

    const updateRippleColor = () => {
      const nextRippleRgb = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--ripple-rgb')
        .trim();

      if (nextRippleRgb && nextRippleRgb !== rippleRgb) {
        rippleRgb = nextRippleRgb;
        for (const point of points) {
          point.colorStyle = `rgba(${rippleRgb}, ${point.alpha.toFixed(3)})`;
          point.reducedColorStyle = `rgba(${rippleRgb}, ${point.reducedAlpha.toFixed(3)})`;
        }
      }
    };

    const computeDynamicConfig = () => {
      const minDim = Math.min(width, height);
      const aspectRatio = width / Math.max(height, 1);
      const widthRatio = clamp(0.88 + (aspectRatio - 1) * 0.08, 0.9, 1.12);
      const heightRatio = clamp(0.86 + (1 / Math.max(aspectRatio, 0.01) - 0.6) * 0.07, 0.84, 0.98);

      fieldHalfWidth = width * widthRatio * 0.5;
      fieldHalfHeight = height * heightRatio * 0.5;
      maxDistance = Math.max(Math.hypot(fieldHalfWidth, fieldHalfHeight), 1);
      spacing = clamp(minDim * 0.03, 18, 30);
      waveAmplitude = clamp(minDim * 0.016, 8, 18);
      drawScale = clamp(minDim / 950, 0.9, 1.28);
    };

    const createPoints = () => {
      points.length = 0;
      computeDynamicConfig();

      for (let y = -fieldHalfHeight; y <= fieldHalfHeight; y += spacing) {
        for (let x = -fieldHalfWidth; x <= fieldHalfWidth; x += spacing) {
          const distanceFromCenter = Math.hypot(x, y);
          const distanceFactor = clamp(distanceFromCenter / maxDistance, 0, 1);
          const angle = Math.atan2(y, x);
          const size = (1 + distanceFactor * 5) * PARTICLE_SIZE_MULTIPLIER * drawScale;
          const rippleFreqDist = distanceFromCenter * RIPPLE_FREQUENCY;
          const alpha = 0.18 + distanceFactor * 0.44;
          const reducedAlpha = 0.2 + distanceFactor * 0.35;
          points.push({
            x,
            y,
            angle,
            size,
            distanceFromCenter,
            cosAngle: Math.cos(angle),
            sinAngle: Math.sin(angle),
            rippleFreqDist,
            cosRipple: Math.cos(rippleFreqDist),
            sinRipple: Math.sin(rippleFreqDist),
            alpha,
            stretch: 1 + distanceFactor * 1.75,
            reducedAlpha,
            colorStyle: `rgba(${rippleRgb}, ${alpha.toFixed(3)})`,
            reducedColorStyle: `rgba(${rippleRgb}, ${reducedAlpha.toFixed(3)})`,
          });
        }
      }
    };

    const resize = () => {
      const nextWidth = canvas.clientWidth;
      const nextHeight = canvas.clientHeight;
      if (nextWidth === 0 || nextHeight === 0) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width * 0.5;
      centerY = height * 0.5;
      createPoints();
    };

    const drawReducedMotion = () => {
      context.clearRect(0, 0, width, height);
      for (const point of points) {
        const particleX = centerX + point.x;
        const particleY = centerY + point.y;
        context.fillStyle = point.reducedColorStyle;
        context.fillRect(particleX, particleY, point.size * 1.4, point.size * 0.7);
      }
    };

    const drawFrame = (timestamp) => {
      if (!isRunning) {
        return;
      }

      context.clearRect(0, 0, width, height);
      const timeWave = timestamp * RIPPLE_SPEED;
      const cosTimeWave = Math.cos(timeWave);
      const sinTimeWave = Math.sin(timeWave);

      for (const point of points) {
        // sin(A - B) = sin(A)cos(B) - cos(A)sin(B)
        const offset = (point.sinRipple * cosTimeWave - point.cosRipple * sinTimeWave) * waveAmplitude;
        const dx = point.cosAngle * offset;
        const dy = point.sinAngle * offset;

        // Apply point transformations using context.setTransform directly instead of save/translate/rotate/restore stack.
        // The transformation matrix elements are [a, b, c, d, e, f].
        // Set context.setTransform(a, b, c, d, e, f) where:
        // a = horizontal scaling (cos of rotation angle)
        // b = vertical skewing (sin of rotation angle)
        // c = horizontal skewing (-sin of rotation angle)
        // d = vertical scaling (cos of rotation angle)
        // e = horizontal translation
        // f = vertical translation

        context.setTransform(
          point.cosAngle * dpr,
          point.sinAngle * dpr,
          -point.sinAngle * dpr,
          point.cosAngle * dpr,
          (centerX + point.x + dx) * dpr,
          (centerY + point.y + dy) * dpr
        );

        context.fillStyle = point.colorStyle;
        context.fillRect(
          -point.size * 0.5,
          -point.size * 0.22,
          point.size * point.stretch,
          point.size * 0.44
        );
      }

      // Reset transform after all points are drawn to restore standard coordinates
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId);
        }
      } else {
        isRunning = true;
        if (!reducedMotionQuery.matches) {
          animationFrameId = window.requestAnimationFrame(drawFrame);
        } else {
          drawReducedMotion();
        }
      }
    };

    let resizeAnimationFrameId = null;

    const performResizeUpdate = () => {
      resize();
      if (reducedMotionQuery.matches) {
        drawReducedMotion();
      }
      resizeAnimationFrameId = null;
    };

    const onResize = () => {
      if (!resizeAnimationFrameId) {
        resizeAnimationFrameId = window.requestAnimationFrame(performResizeUpdate);
      }
    };

    const onMotionPreferenceChange = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (reducedMotionQuery.matches) {
        drawReducedMotion();
        return;
      }
      isRunning = true;
      animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!resizeAnimationFrameId) {
        resizeAnimationFrameId = window.requestAnimationFrame(performResizeUpdate);
      }
    });
    let themeUpdateFrameId = null;
    const themeObserver = new MutationObserver(() => {
      if (themeUpdateFrameId) {
        window.cancelAnimationFrame(themeUpdateFrameId);
      }
      themeUpdateFrameId = window.requestAnimationFrame(() => {
        updateRippleColor();
        if (reducedMotionQuery.matches) {
          drawReducedMotion();
        }
      });
    });

    resize();
    updateRippleColor();
    if (reducedMotionQuery.matches) {
      drawReducedMotion();
    } else {
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', onResize);
    reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);
    resizeObserver.observe(canvas);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode', 'data-section'],
    });

    return () => {
      isRunning = false;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (themeUpdateFrameId) {
        window.cancelAnimationFrame(themeUpdateFrameId);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onResize);
      reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange);
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-ripple-canvas" aria-hidden="true" />;
};

export default HeroRippleBackground;

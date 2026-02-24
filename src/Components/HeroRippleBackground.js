import React, { useEffect, useRef } from 'react';

const BASE_SPACING = 24;
const FIELD_WIDTH_RATIO = 0.98;
const FIELD_HEIGHT_RATIO = 0.92;
const RIPPLE_SPEED = 0.0082;
const RIPPLE_FREQUENCY = 0.07;
const BASE_WAVE_AMPLITUDE = 12.8;
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

    const getSpacing = () => {
      if (width < 520) {
        return 30;
      }
      if (width < 900) {
        return 27;
      }
      return BASE_SPACING;
    };

    const createPoints = () => {
      points.length = 0;
      const spacing = getSpacing();
      fieldHalfWidth = width * FIELD_WIDTH_RATIO * 0.5;
      fieldHalfHeight = height * FIELD_HEIGHT_RATIO * 0.5;
      maxDistance = Math.max(Math.hypot(fieldHalfWidth, fieldHalfHeight), 1);

      for (let y = -fieldHalfHeight; y <= fieldHalfHeight; y += spacing) {
        for (let x = -fieldHalfWidth; x <= fieldHalfWidth; x += spacing) {
          const distanceFromCenter = Math.hypot(x, y);
          const distanceFactor = clamp(distanceFromCenter / maxDistance, 0, 1);
          const angle = Math.atan2(y, x);
          const size = (1 + distanceFactor * 3) * PARTICLE_SIZE_MULTIPLIER;
          points.push({ x, y, angle, size, distanceFromCenter });
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
        const alpha = 0.2 + (point.distanceFromCenter / maxDistance) * 0.35;
        context.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        context.fillRect(particleX, particleY, point.size * 1.4, point.size * 0.7);
      }
    };

    const drawFrame = (timestamp) => {
      if (!isRunning) {
        return;
      }

      context.clearRect(0, 0, width, height);
      const timeWave = timestamp * RIPPLE_SPEED;

      for (const point of points) {
        const centerNormalized = point.distanceFromCenter / maxDistance;
        const offset = Math.sin(point.distanceFromCenter * RIPPLE_FREQUENCY - timeWave) * BASE_WAVE_AMPLITUDE;
        const dx = Math.cos(point.angle) * offset;
        const dy = Math.sin(point.angle) * offset;
        const alpha = 0.18 + centerNormalized * 0.44;
        const stretch = 1 + centerNormalized * 1.75;

        context.save();
        context.translate(centerX + point.x + dx, centerY + point.y + dy);
        context.rotate(point.angle);
        context.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        context.fillRect(-point.size * 0.5, -point.size * 0.22, point.size * stretch, point.size * 0.44);
        context.restore();
      }

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

    const onResize = () => {
      resize();
      if (reducedMotionQuery.matches) {
        drawReducedMotion();
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

    resize();
    if (reducedMotionQuery.matches) {
      drawReducedMotion();
    } else {
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', onResize);
    reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);

    return () => {
      isRunning = false;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onResize);
      reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-ripple-canvas" aria-hidden="true" />;
};

export default HeroRippleBackground;

import { useState, useCallback, useRef, useEffect } from 'react';
import './TextScramble.css';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

/**
 * Entrance text-scramble effect.
 *
 * Props:
 *   text         – target string to reveal
 *   as           – HTML tag to render (default "span")
 *   className    – passed through to root element
 *   delay        – ms before scramble starts (coordinate with Framer Motion delays)
 *   inView       – if true, trigger fires when element enters viewport instead of on mount
 *   noColorChange – suppress accent color on scrambling chars (use for -webkit-text-stroke text)
 */
export function TextScramble({
  text,
  as: Tag = 'span',
  className = '',
  delay = 0,
  inView = false,
  noColorChange = false,
}) {
  const [displayText, setDisplayText] = useState(() =>
    text
      .split('')
      .map(c => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]))
  );
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef(null);
  const frameRef = useRef(0);
  const rootRef = useRef(null);
  const hasRun = useRef(false);

  const scramble = useCallback(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    setIsScrambling(true);
    frameRef.current = 0;

    const nonSpaceLen = text.replace(/ /g, '').length;
    const framesTotal = Math.max(Math.min(nonSpaceLen * 3, 40), 7);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      frameRef.current++;
      const progress = frameRef.current / framesTotal;
      const revealedLength = Math.floor(progress * text.length);

      const next = text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < revealedLength) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        });

      setDisplayText(next);

      if (frameRef.current >= framesTotal) {
        clearInterval(intervalRef.current);
        setDisplayText(text.split(''));
        setIsScrambling(false);
      }
    }, 50);
  }, [text]);

  useEffect(() => {
    if (inView) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const t = setTimeout(scramble, delay);
            observer.disconnect();
            return () => clearTimeout(t);
          }
        },
        { threshold: 0.1 }
      );
      const el = rootRef.current;
      if (el) observer.observe(el);
      return () => observer.disconnect();
    } else {
      const t = setTimeout(scramble, delay);
      return () => clearTimeout(t);
    }
  }, [scramble, delay, inView]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Tag ref={rootRef} className={`ts-root ${className}`}>
      {displayText.map((char, i) => (
        <span
          key={i}
          className={`ts-char${
            !noColorChange && isScrambling && char !== text[i]
              ? ' ts-char--scrambling'
              : ''
          }`}
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </Tag>
  );
}

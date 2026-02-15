import { useEffect, useState, useRef, RefObject } from 'react';

/**
 * Motion System Utilities
 * Elegant, performance-focused animation utilities for portfolio
 */

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Hook: Detects when element enters viewport
 * @param threshold - Percentage of element that must be visible (0-1)
 * @param triggerOnce - Whether to trigger animation only once
 */
export function useInView(
  threshold: number = 0.1,
  triggerOnce: boolean = true
): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion()) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce]);

  return [ref, isInView];
}

/**
 * Hook: Calculates scroll progress through an element
 * Returns value between 0 and 1
 */
export function useScrollProgress(ref: RefObject<HTMLElement>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;

    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      const scrolled = windowHeight - rect.top;
      const totalScrollDistance = elementHeight + windowHeight;
      const calculatedProgress = Math.max(
        0,
        Math.min(1, scrolled / totalScrollDistance)
      );

      setProgress(calculatedProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
}

/**
 * Hook: Stagger delay for child animations
 * @param index - Position in list
 * @param baseDelay - Base delay in milliseconds
 * @param staggerDelay - Delay between items in milliseconds
 */
export function useStaggerDelay(
  index: number,
  baseDelay: number = 0,
  staggerDelay: number = 100
): number {
  if (prefersReducedMotion()) return 0;
  return baseDelay + index * staggerDelay;
}

/**
 * Hook: Smooth value interpolation for animations
 */
export function useSmoothValue(
  targetValue: number,
  duration: number = 300
): number {
  const [smoothValue, setSmoothValue] = useState(targetValue);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(targetValue);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setSmoothValue(targetValue);
      return;
    }

    startValueRef.current = smoothValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue =
        startValueRef.current + (targetValue - startValueRef.current) * eased;

      setSmoothValue(newValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration]);

  return smoothValue;
}

/**
 * Hook: Parallax effect based on scroll position
 * @param strength - Parallax intensity (0-1)
 */
export function useParallax(strength: number = 0.5): [RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;

      // Only calculate when element is in or near viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        const parallaxOffset = (scrolled - elementTop) * strength;
        setOffset(parallaxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [strength]);

  return [ref, offset];
}

/**
 * Utility: Generate stagger animation styles
 */
export function getStaggerStyle(
  index: number,
  baseDelay: number = 0,
  staggerDelay: number = 100
): React.CSSProperties {
  if (prefersReducedMotion()) {
    return { opacity: 1, transform: 'none' };
  }

  return {
    animationDelay: `${baseDelay + index * staggerDelay}ms`,
  };
}

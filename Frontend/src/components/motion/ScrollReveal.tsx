import { ReactNode, CSSProperties } from 'react';
import { useInView } from '../../utils/motion';
import { DURATION, EASE, TRANSLATE } from '../../constants/motion';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
}

/**
 * ScrollReveal Component
 * Reveals content elegantly on scroll
 */
export function ScrollReveal({
  children,
  delay = 0,
  className = '',
  threshold = 0.15,
}: ScrollRevealProps) {
  const [ref, isInView] = useInView(threshold, true);

  const style: CSSProperties = {
    opacity: isInView ? 1 : 0,
    transform: isInView ? 'translateY(0)' : `translateY(${TRANSLATE.moderate}px)`,
    transition: `opacity ${DURATION.slow}ms ${EASE.cinematic} ${delay}ms, transform ${DURATION.slow}ms ${EASE.cinematic} ${delay}ms`,
    willChange: !isInView ? 'opacity, transform' : 'auto',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

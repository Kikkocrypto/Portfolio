import { ReactNode, CSSProperties } from 'react';
import { useParallax } from '../../utils/motion';

interface ParallaxWrapperProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * ParallaxWrapper Component
 * Lightweight parallax effect - use sparingly for sophistication
 */
export function ParallaxWrapper({
  children,
  strength = 0.3,
  className = '',
}: ParallaxWrapperProps) {
  const [ref, offset] = useParallax(strength);

  const style: CSSProperties = {
    transform: `translateY(${offset}px)`,
    willChange: 'transform',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

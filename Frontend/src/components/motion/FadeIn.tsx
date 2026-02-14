import { ReactNode, CSSProperties } from 'react';
import { useInView } from '../../utils/motion';
import { DURATION, EASE, TRANSLATE, OPACITY } from '../../constants/motion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

/**
 * FadeIn Component
 * Elegant fade + subtle directional motion
 */
export function FadeIn({
  children,
  delay = 0,
  duration = DURATION.normal,
  distance = TRANSLATE.subtle,
  direction = 'up',
  threshold = 0.1,
  triggerOnce = true,
  className = '',
}: FadeInProps) {
  const [ref, isInView] = useInView(threshold, triggerOnce);

  const getTransform = (): string => {
    if (isInView) return 'translate(0, 0)';

    switch (direction) {
      case 'up':
        return `translate(0, ${distance}px)`;
      case 'down':
        return `translate(0, -${distance}px)`;
      case 'left':
        return `translate(${distance}px, 0)`;
      case 'right':
        return `translate(-${distance}px, 0)`;
      default:
        return 'translate(0, 0)';
    }
  };

  const style: CSSProperties = {
    opacity: isInView ? OPACITY.visible : OPACITY.hidden,
    transform: getTransform(),
    transition: `opacity ${duration}ms ${EASE.elegant} ${delay}ms, transform ${duration}ms ${EASE.elegant} ${delay}ms`,
    willChange: !isInView ? 'opacity, transform' : 'auto',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

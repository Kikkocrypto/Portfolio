import { ReactNode, Children, cloneElement, isValidElement } from 'react';
import { useInView } from '../../utils/motion';
import { STAGGER } from '../../constants/motion';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  baseDelay?: number;
  threshold?: number;
  className?: string;
}

/**
 * StaggerContainer Component
 * Applies sequential animation timing to children
 */
export function StaggerContainer({
  children,
  staggerDelay = STAGGER.comfortable,
  baseDelay = 0,
  threshold = 0.1,
  className = '',
}: StaggerContainerProps) {
  const [ref, isInView] = useInView(threshold, true);

  const childrenArray = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {childrenArray.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            ...child.props,
            style: {
              ...child.props.style,
              animationDelay: isInView ? `${baseDelay + index * staggerDelay}ms` : '0ms',
            },
            key: index,
          });
        }
        return child;
      })}
    </div>
  );
}

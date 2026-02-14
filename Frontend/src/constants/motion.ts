/**
 * Motion Design System Constants
 * Sophisticated, minimal, intentional animations
 */

// Duration presets (ms)
export const DURATION = {
  instant: 150,
  fast: 300,
  normal: 400,
  slow: 500,
  slower: 600,
} as const;

// Easing functions - elegant, natural motion
export const EASE = {
  // Smooth acceleration and deceleration
  inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  
  // Gentle start, smooth finish
  out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  
  // Smooth start, confident finish
  in: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Cinematic, sophisticated
  cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
  
  // Subtle, refined
  elegant: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

// Translate distances for fade-in animations (px)
export const TRANSLATE = {
  minimal: 8,
  subtle: 12,
  moderate: 16,
  generous: 24,
} as const;

// Stagger delays for sequential animations (ms)
export const STAGGER = {
  tight: 60,
  compact: 80,
  comfortable: 100,
  relaxed: 120,
  spacious: 160,
} as const;

// Hover scale values (unitless)
export const SCALE = {
  minimal: 1.01,
  subtle: 1.02,
  moderate: 1.03,
  image: 1.05,
} as const;

// Opacity values
export const OPACITY = {
  hidden: 0,
  subtle: 0.4,
  medium: 0.7,
  visible: 1,
} as const;

// Blur values for backdrop effects (px)
export const BLUR = {
  light: 4,
  medium: 8,
  heavy: 12,
} as const;

// Shadow presets for elevation
export const SHADOW = {
  none: 'none',
  subtle: '0 2px 8px rgba(44, 36, 22, 0.04)',
  soft: '0 4px 16px rgba(44, 36, 22, 0.08)',
  medium: '0 8px 24px rgba(44, 36, 22, 0.12)',
  elevated: '0 12px 32px rgba(44, 36, 22, 0.16)',
} as const;

// Intersection Observer thresholds
export const THRESHOLD = {
  minimal: 0.05,
  light: 0.1,
  moderate: 0.2,
  substantial: 0.5,
} as const;

// Z-index layers
export const Z_INDEX = {
  base: 0,
  elevated: 10,
  sticky: 20,
  header: 50,
  modal: 100,
} as const;

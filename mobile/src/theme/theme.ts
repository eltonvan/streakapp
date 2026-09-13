export const palette = {
  background: '#09090B',
  surface: '#18181B',
  border: '#27272A',
  text: '#A1A1AA',
  textSecondary: '#71717A',
  white: '#FAFAFA',
} as const;

export const gradients = {
  primary: ['#A855F7', '#6366F1'] as const,
  secondary: ['#F97316', '#EF4444'] as const,
  accent: ['#22D3EE', '#3B82F6'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
export const Colors = {
  // Brand Base Colors (Premium Dark & Gold)
  deepBlue: '#0F172A',
  darkBlue: '#1E293B',
  gold: '#D4AF37',
  lightGold: '#FDE047',
  
  // Theme Overrides for Dark UI
  background: '#020617', // Near black
  surface: 'rgba(30, 41, 59, 0.7)', // Glassmorphic surface
  surfaceDeep: '#0F172A',
  
  // Text Colors
  white: '#FFFFFF',
  slate: '#F8FAFC',
  text: '#FFFFFF',
  subtext: '#94A3B8',
  
  // Functional Colors
  border: 'rgba(255, 255, 255, 0.1)',
  error: '#EF4444',
  success: '#10B981',

  // Gradient Definition
  brandGradient: ['#020617', '#0F172A'] as const,
  goldGradient: ['#D4AF37', '#FDE047', '#D4AF37'] as const,
  glassGradient: ['rgba(30, 41, 59, 0.5)', 'rgba(15, 23, 42, 0.8)'] as const,

  // Legacy mappings to preserve existing components
  navy: '#0F172A', 
  mutedBlue: '#1E293B', 
  electricBlue: '#D4AF37', 
};


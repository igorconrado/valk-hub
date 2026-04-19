export const TYPE_COLORS: Record<string, { bg: string; text: string; border?: string }> = {
  dev:          { bg: 'rgba(59,130,246,0.12)',  text: '#60A5FA' },  // blue
  task:         { bg: 'rgba(107,114,128,0.12)', text: '#9CA3AF' },  // gray
  meeting_prep: { bg: 'rgba(139,92,246,0.12)',  text: '#A78BFA' },  // purple
  report:       { bg: 'rgba(245,158,11,0.12)',  text: '#FBBF24' },  // amber
  research:     { bg: 'rgba(6,182,212,0.12)',   text: '#22D3EE' },  // cyan
  decision:     { bg: 'rgba(245,158,11,0.18)',  text: '#F59E0B' },  // amber stronger
  growth:       { bg: 'rgba(236,72,153,0.12)',  text: '#F472B6' },  // pink
  design:       { bg: 'rgba(139,92,246,0.12)',  text: '#A78BFA' },  // purple
  ops:          { bg: 'rgba(16,185,129,0.12)',  text: '#34D399' },  // green
};

export const PRIORITY_COLORS: Record<string, string> = {
  low:    '#6B7280',
  medium: '#3B82F6',
  high:   '#F59E0B',
  urgent: '#E24B4A',
};

export const STATUS_COLORS: Record<string, string> = {
  backlog:  '#6B7280',
  doing:    '#3B82F6',
  on_hold:  '#F59E0B',
  review:   '#A78BFA',
  done:     '#10B981',
  cancelled: '#4B5563',
};

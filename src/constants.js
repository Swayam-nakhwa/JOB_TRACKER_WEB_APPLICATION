export const STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected']

/**
 * Returns the localStorage key scoped to a specific user.
 * Each account gets its own isolated entry so switching accounts
 * never shows another user's data.
 *
 * @param {string} userId - The authenticated user's unique ID
 * @returns {string} e.g. "job-tracker-applications:google_swayam_1"
 */
export function getJobsKey(userId) {
  return `job-tracker-applications:${userId}`
}

/**
 * Status badge styles — dark-background-friendly colours.
 * Used on job cards (dark slate backgrounds) so we use dark-toned badges.
 */
export const STATUS_STYLES = {
  Applied:   'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Interview: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Offered:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Rejected:  'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

/** Accessible status icon/emoji for screen readers and visual cues. */
export const STATUS_ICONS = {
  Applied:   '📤',
  Interview: '🗓️',
  Offered:   '🎉',
  Rejected:  '❌',
}

/** Demo Google accounts for local sign-in testing. */
export const PRESET_GOOGLE_ACCOUNTS = [
  {
    id: 'google_swayam_1',
    name: 'Swayam Developer',
    email: 'swayam.dev@gmail.com',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
  },
  {
    id: 'google_alex_2',
    name: 'Alex Johnson',
    email: 'alex.engineer@gmail.com',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
  },
  {
    id: 'google_priya_3',
    name: 'Priya Sharma',
    email: 'priya.tech@gmail.com',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
  },
]

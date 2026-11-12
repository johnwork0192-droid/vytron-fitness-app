export type Workout = {
  title: string
  category: string
  duration: string
  level: string
  image: string
  accent: string
}

export const workouts: Workout[] = [
  {
    title: 'Upper body strength',
    category: 'STRENGTH',
    duration: '45 min',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85',
    accent: 'lime',
  },
  {
    title: 'Conditioning circuit',
    category: 'HIIT',
    duration: '30 min',
    level: 'All levels',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
    accent: 'orange',
  },
  {
    title: 'Mobility reset',
    category: 'RECOVERY',
    duration: '20 min',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85',
    accent: 'blue',
  },
]

export const week = [
  { day: 'MON', date: '12', complete: true, active: false },
  { day: 'TUE', date: '13', complete: true, active: false },
  { day: 'WED', date: '14', complete: false, active: true },
  { day: 'THU', date: '15', complete: false, active: false },
  { day: 'FRI', date: '16', complete: false, active: false },
  { day: 'SAT', date: '17', complete: false, active: false },
  { day: 'SUN', date: '18', complete: false, active: false },
]

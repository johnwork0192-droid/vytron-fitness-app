import { exercises, type Exercise, type MuscleGroup, type TrainingLevel, type TrainingPlace } from '../training/exercises'

export type Goal = 'muscle' | 'fat-loss' | 'maintain' | 'strength' | 'fitness'
export type CoachProfile = { name: string; age: number; height: number; weight: number; goal: Goal; level: TrainingLevel; place: TrainingPlace; days: number; sex: 'female' | 'male' }
export type ChatMessage = { id: string; role: 'user' | 'coach'; text: string; createdAt: number }
export type WorkoutPlan = { id: string; title: string; createdAt: number; days: Array<{ name: string; exercises: string[] }> }
export type SessionLog = { date: string; exercise: string; sets: number; reps: number; weight: number }
export type CoachStore = { profile: CoachProfile; messages: ChatMessage[]; plans: WorkoutPlan[]; sessions: SessionLog[]; weightLog: Array<{ date: string; weight: number }> }

const KEY = 'vytron-ai-coach-v1'
export const defaultProfile: CoachProfile = { name: 'Jordan', age: 28, height: 178, weight: 76, goal: 'muscle', level: 'Intermediate', place: 'GYM', days: 3, sex: 'male' }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null }
export function loadCoachStore(): CoachStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isRecord(parsed)) {
        const profile = isRecord(parsed.profile) ? { ...defaultProfile, ...parsed.profile } as CoachProfile : defaultProfile
        return { profile, messages: Array.isArray(parsed.messages) ? parsed.messages as ChatMessage[] : [], plans: Array.isArray(parsed.plans) ? parsed.plans as WorkoutPlan[] : [], sessions: Array.isArray(parsed.sessions) ? parsed.sessions as SessionLog[] : [], weightLog: Array.isArray(parsed.weightLog) ? parsed.weightLog as CoachStore['weightLog'] : [] }
      }
    }
  } catch { /* use safe defaults when storage is unavailable or invalid */ }
  return { profile: defaultProfile, messages: [], plans: [], sessions: [], weightLog: [] }
}
export function saveCoachStore(store: CoachStore) {
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* storage may be disabled or full */ }
}

const goalMuscles: Record<Goal, MuscleGroup[]> = { muscle: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'], 'fat-loss': ['Legs', 'Chest', 'Back', 'Abs'], maintain: ['Chest', 'Back', 'Legs', 'Abs'], strength: ['Legs', 'Chest', 'Back'], fitness: ['Legs', 'Chest', 'Abs', 'Back'] }
export function createPlan(profile: CoachProfile, focus: MuscleGroup[] = []): WorkoutPlan {
  const groups = focus.length ? focus : goalMuscles[profile.goal]
  const days = Array.from({ length: Math.max(2, Math.min(6, profile.days)) }, (_, index) => {
    const group = groups[index % groups.length]
    const nextGroup = groups[(index + 1) % groups.length]
    const candidates = exercises.filter((exercise) => exercise.place === profile.place && (exercise.muscle === group || exercise.musclesWorked.includes(group) || exercise.muscle === nextGroup))
    const levelMatch = candidates.filter((exercise) => exercise.level === profile.level)
    const chosen = (levelMatch.length ? levelMatch : candidates).slice(0, 4)
    return { name: `Day ${index + 1} · ${group}`, exercises: (chosen.length ? chosen : exercises.filter((exercise) => exercise.place === profile.place)).map((exercise) => exercise.id) }
  })
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return { id, title: `${profile.place} · ${profile.goal.replace('-', ' ')} plan`, createdAt: Date.now(), days }
}

export function estimateNutrition(profile: CoachProfile) {
  const safeWeight = Number.isFinite(profile.weight) ? Math.min(250, Math.max(35, profile.weight)) : defaultProfile.weight
  const safeHeight = Number.isFinite(profile.height) ? Math.min(230, Math.max(120, profile.height)) : defaultProfile.height
  const safeAge = Number.isFinite(profile.age) ? Math.min(100, Math.max(16, profile.age)) : defaultProfile.age
  const bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + (profile.sex === 'male' ? 5 : -161)
  const maintenance = Math.round(bmr * (1.45 + Math.min(Math.max(profile.days, 0), 6) * 0.025))
  const calories = Math.max(1200, Math.round(maintenance + (profile.goal === 'muscle' ? 250 : profile.goal === 'fat-loss' ? -350 : 0)))
  const protein = Math.round(safeWeight * (profile.goal === 'fat-loss' ? 1.8 : 1.6))
  const fat = Math.round(calories * 0.27 / 9)
  return { calories, protein, fat, carbs: Math.round((calories - protein * 4 - fat * 9) / 4) }
}

export type CoachContext = { profile: CoachProfile; sessions: SessionLog[]; plans: WorkoutPlan[] }
export type CoachReply = { text: string; mode: 'demo' | 'real' }
export async function askCoach(message: string, context: CoachContext, signal?: AbortSignal): Promise<CoachReply> {
  if (import.meta.env.VITE_AI_MODE === 'real') {
    const response = await fetch('/api/coach/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, context }), signal })
    if (!response.ok) throw new Error(response.status === 503 ? 'AI service is not configured yet.' : `AI service error (${response.status}).`)
    const data = await response.json() as { reply?: string }
    if (!data.reply) throw new Error('AI service returned an empty response.')
    return { text: data.reply, mode: 'real' }
  }
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, 450)
    signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
  })
  const normalized = message.toLowerCase()
  if (/pain|injur|hurt|боль|травм|здоров/.test(normalized)) return { mode: 'demo', text: 'I can’t assess pain or diagnose an injury. Please stop the activity that causes discomfort and consult a qualified healthcare professional. Seek urgent care for severe or sudden symptoms.' }
  const { profile, sessions, plans } = context
  if (/progress|прогресс|analy/.test(normalized)) return { mode: 'demo', text: `Progress snapshot: ${sessions.length} logged session${sessions.length === 1 ? '' : 's'} and ${plans.length} saved plan${plans.length === 1 ? '' : 's'}. Your current setup is ${profile.days} training days/week at ${profile.level} level. Log workouts consistently to make trends and personal records meaningful.` }
  if (/rest|recover|отдых|восстанов/.test(normalized)) return { mode: 'demo', text: 'A practical starting point is 60–90 seconds between moderate sets and 2–3 minutes for demanding strength sets. Leave at least a day before training the same muscle hard; prioritize sleep and adjust for fatigue. This is general guidance, not medical advice.' }
  if (/today|сегодня/.test(normalized)) return { mode: 'demo', text: plans[0]?.days[0] ? `Your saved plan starts with ${plans[0].days[0].name}. Choose the matching exercises in Workouts, warm up, and keep a few comfortable reps in reserve.` : `You have no saved plan yet. Create one for ${profile.place} and ${profile.days} weekly sessions in the Plan Builder.` }
  const aim = profile.goal === 'muscle' ? 'gradually increase reps or load while keeping good form' : profile.goal === 'fat-loss' ? 'pair sustainable nutrition with consistent strength training and everyday activity' : profile.goal === 'strength' ? 'focus on controlled, progressive compound lifts and longer rests' : 'build a repeatable routine with balanced strength and conditioning'
  return { mode: 'demo', text: `Based on your ${profile.level.toLowerCase()} level, ${profile.place} setup, and ${profile.days} training days/week, start with a repeatable plan and ${aim}. I can personalize this further when you log sessions and update your profile. Demo mode uses local rules, not a language model.` }
}
export function findExercise(id: string): Exercise | undefined { return exercises.find((exercise) => exercise.id === id) }

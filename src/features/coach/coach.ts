import { exercises, type Exercise, type MuscleGroup, type TrainingLevel, type TrainingPlace } from '../training/exercises'
import { getAccessToken, isSupabaseConfigured } from '../../lib/supabase'

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
  try { const raw = localStorage.getItem(KEY); if (raw) { const data: unknown = JSON.parse(raw); if (isRecord(data)) return { profile: { ...defaultProfile, ...(isRecord(data.profile) ? data.profile : {}) } as CoachProfile, messages: Array.isArray(data.messages) ? data.messages as ChatMessage[] : [], plans: Array.isArray(data.plans) ? data.plans as WorkoutPlan[] : [], sessions: Array.isArray(data.sessions) ? data.sessions as SessionLog[] : [], weightLog: Array.isArray(data.weightLog) ? data.weightLog as CoachStore['weightLog'] : [] } } } catch { /* corrupted or unavailable local storage */ }
  return { profile: defaultProfile, messages: [], plans: [], sessions: [], weightLog: [] }
}
export function saveCoachStore(store: CoachStore) { try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* browser storage may be disabled or full */ } }
const goalMuscles: Record<Goal, MuscleGroup[]> = { muscle: ['Chest','Back','Legs','Shoulders','Arms'], 'fat-loss': ['Legs','Chest','Back','Abs'], maintain: ['Chest','Back','Legs','Abs'], strength: ['Legs','Chest','Back'], fitness: ['Legs','Chest','Abs','Back'] }
export function createPlan(profile: CoachProfile, focus: MuscleGroup[] = []): WorkoutPlan {
  const groups = focus.length ? focus : goalMuscles[profile.goal]
  const days = Array.from({ length: Math.max(2, Math.min(6, profile.days)) }, (_, index) => {
    const group = groups[index % groups.length]; const next = groups[(index + 1) % groups.length]
    const matches = exercises.filter((exercise) => exercise.place === profile.place && (exercise.muscle === group || exercise.musclesWorked.includes(group) || exercise.muscle === next))
    const levelMatches = matches.filter((exercise) => exercise.level === profile.level)
    return { name: `Day ${index + 1} · ${group}`, exercises: (levelMatches.length ? levelMatches : matches).slice(0, 4).map((exercise) => exercise.id) }
  })
  return { id: crypto.randomUUID(), title: `${profile.place} · ${profile.goal.replace('-', ' ')} plan`, createdAt: Date.now(), days }
}
export function estimateNutrition(profile: CoachProfile) {
  const weight = Number.isFinite(profile.weight) ? Math.min(250, Math.max(35, profile.weight)) : 76
  const height = Number.isFinite(profile.height) ? Math.min(230, Math.max(120, profile.height)) : 178
  const age = Number.isFinite(profile.age) ? Math.min(100, Math.max(16, profile.age)) : 28
  const bmr = 10 * weight + 6.25 * height - 5 * age + (profile.sex === 'male' ? 5 : -161)
  const calories = Math.max(1200, Math.round(bmr * (1.45 + Math.min(Math.max(profile.days, 0), 6) * .025) + (profile.goal === 'muscle' ? 250 : profile.goal === 'fat-loss' ? -350 : 0)))
  const protein = Math.round(weight * (profile.goal === 'fat-loss' ? 1.8 : 1.6)); const fat = Math.round(calories * .27 / 9)
  return { calories, protein, fat, carbs: Math.round((calories - protein * 4 - fat * 9) / 4) }
}
export type CoachContext = { profile: CoachProfile; sessions: SessionLog[]; plans: WorkoutPlan[] }
export type CoachReply = { text: string; mode: 'demo' | 'real' }
async function demoReply(message: string, context: CoachContext): Promise<CoachReply> {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
  const q = message.toLowerCase(); const { profile, sessions, plans } = context
  if (/pain|injur|hurt|боль|травм|здоров/.test(q)) return { mode: 'demo', text: 'I can’t assess pain or diagnose an injury. Stop the activity that causes discomfort and consult a qualified healthcare professional; seek urgent care for severe or sudden symptoms.' }
  if (/progress|прогресс|analy/.test(q)) return { mode: 'demo', text: `Progress snapshot: ${sessions.length} recorded sessions and ${plans.length} saved plans. Your current setup is ${profile.days} days/week at ${profile.level} level. Log workouts consistently to establish useful trends.` }
  if (/rest|recover|отдых|восстанов/.test(q)) return { mode: 'demo', text: 'As general guidance, start with 60–90 seconds between moderate sets and 2–3 minutes for demanding strength sets. Leave a day before hard training of the same muscles and adjust for fatigue. Not medical advice.' }
  if (/today|сегодня/.test(q)) return { mode: 'demo', text: plans[0]?.days[0] ? `Your saved plan starts with ${plans[0].days[0].name}. Open Workouts, warm up, and keep a few comfortable reps in reserve.` : `No plan is saved yet. Generate one for your ${profile.place} setup and ${profile.days} weekly training days.` }
  const focus = profile.goal === 'muscle' ? 'gradually increase reps or load while maintaining good form' : profile.goal === 'fat-loss' ? 'combine sustainable nutrition with consistent strength work and daily activity' : 'build a repeatable routine with balanced training and recovery'
  return { mode: 'demo', text: `For your ${profile.level} ${profile.place} setup and ${profile.days} days/week, start with a manageable routine and ${focus}. DEMO uses local rules, not a language model.` }
}
export async function askCoach(message: string, context: CoachContext, signal?: AbortSignal): Promise<CoachReply> {
  if (import.meta.env.VITE_AI_MODE !== 'real' || !isSupabaseConfigured()) return demoReply(message, context)
  const token = await getAccessToken()
  if (!token) return demoReply(message, context)
  const response = await fetch('/api/coach/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message, context }), signal })
  if (!response.ok) { const result = await response.json().catch(() => ({})) as { error?: string }; throw new Error(result.error || `AI service error (${response.status}).`) }
  const result = await response.json() as { reply?: string }
  if (!result.reply) throw new Error('AI service returned an empty response.')
  return { text: result.reply, mode: 'real' }
}
export function findExercise(id: string): Exercise | undefined { return exercises.find((exercise) => exercise.id === id) }

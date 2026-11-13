import { getSupabase } from './supabase'
import {
  defaultProfile,
  type ChatMessage,
  type CoachProfile,
  type CoachStore,
  type SessionLog,
  type WorkoutPlan,
} from '../features/coach/coach'

function check<T>(result: {
  data: T
  error: { message: string } | null
}): T {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function loadCloudStore(
  userId: string,
): Promise<Partial<CoachStore>> {
  const db = getSupabase()

  const [
    profileResult,
    messageResult,
    planResult,
    sessionResult,
    metricResult,
  ] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).maybeSingle(),
    db
      .from('coach_messages')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(200),
    db
      .from('workout_plans')
      .select('id, title, plan, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(100),
    db
      .from('workout_sessions')
      .select('client_id, exercise, sets, reps, weight, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(500),
    db
      .from('body_metrics')
      .select('weight_kg, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: true })
      .limit(500),
  ])

  const profileRow = check(profileResult)
  const messages = check(messageResult)
  const plans = check(planResult)
  const sessions = check(sessionResult)
  const metrics = check(metricResult)

  const profile: CoachProfile = profileRow
    ? {
        ...defaultProfile,
        name: profileRow.display_name || defaultProfile.name,
        age: profileRow.age ?? defaultProfile.age,
        height: profileRow.height_cm ?? defaultProfile.height,
        weight: Number(profileRow.weight_kg ?? defaultProfile.weight),
        goal: profileRow.goal ?? defaultProfile.goal,
        level: profileRow.level ?? defaultProfile.level,
        place: profileRow.place ?? defaultProfile.place,
        days: profileRow.training_days ?? defaultProfile.days,
        sex: profileRow.sex ?? defaultProfile.sex,
      }
    : defaultProfile

  return {
    profile,
    messages: messages.map((row) => ({
      id: row.id,
      role: row.role,
      text: row.content,
      createdAt: new Date(row.created_at).getTime(),
    })) as ChatMessage[],
    plans: plans.map((row) => ({
      ...row.plan,
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at).getTime(),
    })) as WorkoutPlan[],
    sessions: sessions.map((row) => ({
      date: row.completed_at,
      exercise: row.exercise,
      sets: row.sets,
      reps: row.reps,
      weight: Number(row.weight),
    })) as SessionLog[],
    weightLog: metrics.map((row) => ({
      date: row.recorded_at,
      weight: Number(row.weight_kg),
    })),
  }
}

export async function saveCloudStore(
  userId: string,
  store: CoachStore,
) {
  const db = getSupabase()
  const p = store.profile

  check(
    await db.from('profiles').upsert({
      id: userId,
      display_name: p.name,
      age: p.age,
      height_cm: p.height,
      weight_kg: p.weight,
      goal: p.goal,
      level: p.level,
      place: p.place,
      training_days: p.days,
      sex: p.sex,
      updated_at: new Date().toISOString(),
    }),
  )

  for (const plan of store.plans) {
    check(
      await db.from('workout_plans').upsert({
        id: plan.id,
        user_id: userId,
        title: plan.title,
        plan,
        created_at: new Date(plan.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }),
    )
  }

  for (const session of store.sessions) {
    const clientId = `${userId}:${session.date}:${session.exercise}`

    check(
      await db.from('workout_sessions').upsert(
        {
          user_id: userId,
          client_id: clientId,
          exercise: session.exercise,
          sets: session.sets,
          reps: session.reps,
          weight: session.weight,
          completed_at: session.date,
        },
        { onConflict: 'user_id,client_id' },
      ),
    )
  }

  for (const metric of store.weightLog) {
    const clientId = `${userId}:${metric.date}`

    check(
      await db.from('body_metrics').upsert(
        {
          user_id: userId,
          client_id: clientId,
          weight_kg: metric.weight,
          recorded_at: metric.date,
        },
        { onConflict: 'user_id,client_id' },
      ),
    )
  }

  // The endpoint persists real-AI turns.
  // Persist DEMO conversations via authenticated RLS.
  const { data: existing } = await db
    .from('coach_messages')
    .select('content, role, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  const known = new Set(
    (existing ?? []).map(
      (row) => `${row.role}|${row.created_at}|${row.content}`,
    ),
  )

  const missing = store.messages.filter(
    (message) =>
      !known.has(
        `${message.role}|${new Date(message.createdAt).toISOString()}|${message.text}`,
      ),
  )

  if (missing.length) {
    check(
      await db.from('coach_messages').insert(
        missing.map((message) => ({
          user_id: userId,
          role: message.role,
          content: message.text,
          created_at: new Date(message.createdAt).toISOString(),
        })),
      ),
    )
  }
}

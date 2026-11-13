import { Activity, ArrowRight, Bot, Check, CircleAlert, Dumbbell, Flame, HeartPulse, LoaderCircle, MessageCircle, Plus, Send, Sparkles, Trash2, Utensils, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { muscleGroups, type MuscleGroup } from '../training/exercises'
import { askCoach, createPlan, estimateNutrition, findExercise, loadCoachStore, saveCoachStore, type ChatMessage, type CoachStore, type Goal, type WorkoutPlan } from './coach'
import './coach.css'

type Language = 'en' | 'ru'
const copy = {
  en: { coach: 'AI COACH', title: 'Your next level,', accent: 'built together.', desc: 'A personal training partner shaped around your goals, equipment, and real training history.', demo: 'RULE-BASED DEMO · NOT A LANGUAGE MODEL', real: 'CONNECTED AI', chat: 'Coach chat', plan: 'Plan builder', nutrition: 'Nutrition', progress: 'Your activity', input: 'Ask about training, recovery, or your goals…', send: 'Send message', clear: 'Clear chat', quick: 'QUICK QUESTIONS', questions: ['Create my workout plan', 'How can I build muscle?', 'How can I lose fat?', 'What should I train today?', 'Analyze my progress', 'How much rest do I need?'], profile: 'YOUR TRAINING PROFILE', goal: 'Goal', level: 'Level', place: 'Training place', days: 'Days per week', generate: 'Generate weekly plan', save: 'Save plan', saved: 'SAVED PROGRAMS', start: 'Open workouts', workouts: 'sessions', week: 'This week', nutritionNote: 'Approximate estimates only · not medical advice', calories: 'kcal / day', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', meals: 'SAMPLE MEALS', mealsText: 'Breakfast · Greek yogurt, oats & berries | Lunch · rice, vegetables & tofu/chicken | Dinner · salmon/beans, potatoes & greens', log: 'Log a workout', empty: 'No messages yet. Ask your coach a question or choose a quick prompt.', focus: 'Focus muscles (optional)', goalNames: ['Build muscle', 'Lose fat', 'Maintain fitness', 'Build strength', 'General fitness'], loading: 'Thinking…', planDays: 'training days', deleting: 'Clear saved chat history?', connect: 'Connect a secure server endpoint to enable real AI.', age: 'Age', height: 'Height (cm)', weight: 'Weight (kg)', sex: 'Sex for estimate', male: 'Male', female: 'Female', remove: 'Remove', day: 'DAY', weekly: 'weekly target', estimate: 'ESTIMATED DAILY TARGET', caloriesNote: 'Calculated from profile and activity assumptions; individual needs vary.', nutritionHelp: 'Consult a registered dietitian for individualized advice.' },
  ru: { coach: 'AI-ТРЕНЕР', title: 'Твой следующий уровень —', accent: 'создадим вместе.', desc: 'Персональный помощник с учётом целей, оборудования и истории тренировок.', demo: 'ДЕМО НА ПРАВИЛАХ · НЕ ЯЗЫКОВАЯ МОДЕЛЬ', real: 'AI ПОДКЛЮЧЁН', chat: 'Чат с тренером', plan: 'Конструктор плана', nutrition: 'Питание', progress: 'Активность', input: 'Спроси о тренировках, восстановлении или целях…', send: 'Отправить', clear: 'Очистить чат', quick: 'БЫСТРЫЕ ВОПРОСЫ', questions: ['Составь план тренировок', 'Как набрать мышцы?', 'Как похудеть?', 'Что тренировать сегодня?', 'Проанализируй прогресс', 'Сколько отдыхать?'], profile: 'ПРОФИЛЬ ТРЕНИРОВОК', goal: 'Цель', level: 'Уровень', place: 'Место тренировок', days: 'Дней в неделю', generate: 'Создать план на неделю', save: 'Сохранить план', saved: 'СОХРАНЁННЫЕ ПРОГРАММЫ', start: 'Открыть тренировки', workouts: 'тренировок', week: 'За неделю', nutritionNote: 'Примерная оценка · не медицинская рекомендация', calories: 'ккал / день', protein: 'Белки', carbs: 'Углеводы', fat: 'Жиры', meals: 'ПРИМЕРЫ БЛЮД', mealsText: 'Завтрак · греческий йогурт, овсянка и ягоды | Обед · рис, овощи и тофу/курица | Ужин · рыба/бобовые, картофель и зелень', log: 'Записать тренировку', empty: 'Пока нет сообщений. Задай вопрос или выбери быстрый запрос.', focus: 'Группы мышц (необязательно)', goalNames: ['Набор мышц', 'Снижение веса', 'Поддержание формы', 'Развитие силы', 'Общая форма'], loading: 'Формирую ответ…', planDays: 'тренировочных дней', deleting: 'Очистить историю чата?', connect: 'Для работы настоящего AI подключите защищённый серверный API.', age: 'Возраст', height: 'Рост (см)', weight: 'Вес (кг)', sex: 'Пол для оценки', male: 'Мужской', female: 'Женский', remove: 'Удалить', day: 'ДЕНЬ', weekly: 'от недельной цели', estimate: 'ПРИМЕРНАЯ ЦЕЛЬ НА ДЕНЬ', caloriesNote: 'Расчёт основан на данных профиля и допущениях об активности; потребности различаются.', nutritionHelp: 'Для индивидуальных рекомендаций обратитесь к диетологу.' },
} as const
const goals: Goal[] = ['muscle', 'fat-loss', 'maintain', 'strength', 'fitness']
const quickKeys = ['Create my workout plan', 'How can I build muscle?', 'How can I lose fat?', 'What should I train today?', 'Analyze my progress', 'How much rest do I need?']
function newId() { return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}` }

export default function CoachModule() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<Language>(() => typeof navigator !== 'undefined' && navigator.language.startsWith('ru') ? 'ru' : 'en')
  const [tab, setTab] = useState<'chat' | 'plan' | 'nutrition'>('chat')
  const [store, setStore] = useState<CoachStore>(loadCoachStore)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'demo' | 'real'>(import.meta.env.VITE_AI_MODE === 'real' ? 'real' : 'demo')
  const [focus, setFocus] = useState<MuscleGroup[]>([])
  const [planDraft, setPlanDraft] = useState<WorkoutPlan | null>(null)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const t = copy[lang]
  const nutrition = useMemo(() => estimateNutrition(store.profile), [store.profile])

  useEffect(() => {
    const onNav = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const item = target.closest('.nav-item')
      const label = item?.textContent?.trim() ?? ''
      if (label.startsWith('AI Coach') || label.startsWith('AI-ТРЕНЕР')) setOpen(true)
      if (label.startsWith('Overview')) setOpen(false)
    }
    const onCustom = () => setOpen(true)
    document.addEventListener('click', onNav, true)
    window.addEventListener('vytron:open-coach', onCustom)
    return () => { document.removeEventListener('click', onNav, true); window.removeEventListener('vytron:open-coach', onCustom) }
  }, [])
  useEffect(() => { saveCoachStore(store) }, [store])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [store.messages, busy])

  const updateProfile = (patch: Partial<CoachStore['profile']>) => setStore((current) => ({ ...current, profile: { ...current.profile, ...patch } }))
  const ask = async (text: string) => {
    const value = text.trim()
    if (!value || busy) return
    const user: ChatMessage = { id: newId(), role: 'user', text: value, createdAt: Date.now() }
    setDraft(''); setError(''); setBusy(true)
    setStore((current) => ({ ...current, messages: [...current.messages, user] }))
    try {
      const answer = await askCoach(value, { profile: store.profile, sessions: store.sessions, plans: store.plans })
      setMode(answer.mode)
      setStore((current) => ({ ...current, messages: [...current.messages, { id: newId(), role: 'coach', text: answer.text, createdAt: Date.now() }] }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to reach the coach service. Please try again.')
    } finally { setBusy(false) }
  }
  const buildPlan = () => setPlanDraft(createPlan(store.profile, focus))
  const savePlan = () => { if (!planDraft) return; setStore((current) => ({ ...current, plans: [planDraft, ...current.plans] })); setPlanDraft(null) }
  const logSession = () => setStore((current) => ({ ...current, sessions: [...current.sessions, { date: new Date().toISOString(), exercise: 'Completed workout', sets: 12, reps: 120, weight: 0 }] }))
  const openWorkouts = () => {
    setOpen(false)
    document.querySelectorAll<HTMLButtonElement>('.nav-item').forEach((button) => { if (button.textContent?.includes('Workouts')) button.click() })
  }

  if (!open) return null
  return <div className="coach-shell" role="dialog" aria-modal="true" aria-label="VYTRON AI Coach">
    <header className="coach-topbar"><button className="coach-back" onClick={() => setOpen(false)}><X size={18}/><span>VYTRON <b>FITNESS</b></span></button><div className="coach-top-actions"><span className={`coach-mode ${mode}`}><i/>{mode === 'demo' ? t.demo : t.real}</span><button className="coach-lang" onClick={() => setLang((value) => value === 'en' ? 'ru' : 'en')} aria-label="Switch language">{lang === 'en' ? 'RU' : 'EN'}</button><button className="coach-close" onClick={() => setOpen(false)} aria-label="Close AI coach"><X size={19}/></button></div></header>
    <main className="coach-page">
      <section className="coach-hero"><div><p className="coach-eyebrow"><Sparkles size={14}/>{t.coach}</p><h1>{t.title}<br/><em>{t.accent}</em></h1><p>{t.desc}</p><div className="coach-hero-meta"><span><i/>{mode === 'demo' ? t.demo : t.real}</span><span>{t.connect}</span></div></div><div className="coach-orb"><Bot size={42}/><span>VYTRON<br/>INTELLIGENCE</span></div></section>
      <section className="coach-layout">
        <aside className="coach-side"><div className="coach-profile-card"><div className="coach-section-head"><span>{t.profile}</span><span className="coach-avatar">{store.profile.name.slice(0,2).toUpperCase()}</span></div><label>Name<input value={store.profile.name} onChange={(e) => updateProfile({ name: e.target.value })}/></label><div className="coach-form-grid"><label>{t.goal}<select value={store.profile.goal} onChange={(e) => updateProfile({ goal: e.target.value as Goal })}>{goals.map((goal, i) => <option key={goal} value={goal}>{t.goalNames[i]}</option>)}</select></label><label>{t.level}<select value={store.profile.level} onChange={(e) => updateProfile({ level: e.target.value as CoachStore['profile']['level'] })}>{['Beginner','Intermediate','Advanced'].map((level) => <option key={level}>{level}</option>)}</select></label><label>{t.place}<select value={store.profile.place} onChange={(e) => updateProfile({ place: e.target.value as 'HOME' | 'GYM' })}><option>HOME</option><option>GYM</option></select></label><label>{t.days}<select value={store.profile.days} onChange={(e) => updateProfile({ days: Number(e.target.value) })}>{[2,3,4,5,6].map((days) => <option key={days} value={days}>{days} {t.planDays}</option>)}</select></label></div><div className="coach-form-grid"><label>{t.age}<input type="number" min="16" max="100" value={store.profile.age} onChange={(e) => updateProfile({ age: Number(e.target.value) || 16 })}/></label><label>{t.height}<input type="number" min="120" max="230" value={store.profile.height} onChange={(e) => updateProfile({ height: Number(e.target.value) || 120 })}/></label><label>{t.weight}<input type="number" min="35" max="250" value={store.profile.weight} onChange={(e) => updateProfile({ weight: Number(e.target.value) || 35 })}/></label><label>{t.sex}<select value={store.profile.sex} onChange={(e) => updateProfile({ sex: e.target.value as 'male'|'female' })}><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label></div></div>
          <div className="coach-activity-card"><div className="coach-section-head"><span>{t.progress}</span><Activity size={17}/></div><div className="coach-activity-stats"><div><strong>{store.sessions.length}</strong><span>{t.workouts}</span></div><div><strong>{store.sessions.filter((session) => Date.now() - new Date(session.date).getTime() < 7 * 86400000).length}</strong><span>{t.week}</span></div></div><p>{store.sessions.length ? `${Math.min(100, Math.round(store.sessions.filter((session) => Date.now() - new Date(session.date).getTime() < 7 * 86400000).length / Math.max(1, store.profile.days) * 100))}% ${t.weekly}` : lang === 'en' ? 'Log sessions to see your training consistency.' : 'Записывай занятия, чтобы отслеживать регулярность.'}</p><button className="coach-log" onClick={logSession}><Plus size={15}/>{t.log}</button></div>
        </aside>
        <section className="coach-workspace"><nav className="coach-tabs"><button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}><MessageCircle size={16}/>{t.chat}</button><button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}><Dumbbell size={16}/>{t.plan}</button><button className={tab === 'nutrition' ? 'active' : ''} onClick={() => setTab('nutrition')}><Utensils size={16}/>{t.nutrition}</button></nav>
          {tab === 'chat' && <div className="coach-chat"><div className="coach-chat-head"><div><span className="coach-live"><i/> ONLINE</span><h2>{t.chat}</h2></div><button className="coach-clear" onClick={() => { if (window.confirm(t.deleting)) setStore((current) => ({ ...current, messages: [] })) }}><Trash2 size={14}/>{t.clear}</button></div><div className="coach-messages" aria-live="polite">{store.messages.length === 0 && <div className="coach-empty"><div><Sparkles size={23}/></div><p>{t.empty}</p></div>}{store.messages.map((message) => <article key={message.id} className={`coach-message ${message.role}`}><span className="message-icon">{message.role === 'coach' ? <Bot size={15}/>:store.profile.name.slice(0,1).toUpperCase()}</span><div><small>{message.role === 'coach' ? 'VYTRON COACH' : store.profile.name}</small><p>{message.text}</p></div></article>)}{busy && <div className="coach-thinking"><LoaderCircle size={16}/>{t.loading}</div>}{error && <div className="coach-error"><CircleAlert size={16}/>{error}</div>}<div ref={bottomRef}/></div><div className="coach-quick"><span>{t.quick}</span><div>{quickKeys.map((question,index) => <button key={question} onClick={() => void ask(lang === 'en' ? question : t.questions[index])}>{t.questions[index]}<ArrowRight size={12}/></button>)}</div></div><form className="coach-compose" onSubmit={(e) => { e.preventDefault(); void ask(draft) }}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.input} aria-label={t.input}/><button type="submit" disabled={busy || !draft.trim()} aria-label={t.send}><Send size={17}/></button></form></div>}
          {tab === 'plan' && <div className="coach-plan"><div className="coach-pane-heading"><span className="coach-eyebrow">PERSONALIZED PROGRAM</span><h2>{t.plan}</h2><p>Exercises are selected from the existing HOME/GYM library based on your profile.</p></div><div className="coach-focus"><label>{t.focus}</label><div>{muscleGroups.map((muscle) => <button key={muscle} className={focus.includes(muscle) ? 'selected' : ''} onClick={() => setFocus((current) => current.includes(muscle) ? current.filter((value) => value !== muscle) : [...current,muscle])}>{muscle}</button>)}</div></div><button className="coach-primary" onClick={buildPlan}><Sparkles size={16}/>{t.generate}</button>{planDraft && <PlanCard plan={planDraft} lang={lang} onSave={savePlan} onWorkouts={openWorkouts} saveLabel={t.save} startLabel={t.start}/>}<div className="coach-plan-saved"><span>{t.saved} · {store.plans.length}</span>{store.plans.map((plan) => <PlanCard key={plan.id} plan={plan} lang={lang} onSave={() => setStore((current) => ({ ...current, plans: current.plans.filter((item) => item.id !== plan.id) }))} onWorkouts={openWorkouts} saveLabel={t.remove} startLabel={t.start} saved/>)}</div></div>}
          {tab === 'nutrition' && <div className="coach-nutrition"><div className="coach-pane-heading"><span className="coach-eyebrow"><HeartPulse size={13}/> NUTRITION ESTIMATE</span><h2>{t.nutrition}</h2><p>{t.nutritionNote}</p></div><div className="nutrition-calorie"><div><span>{t.estimate}</span><strong>{nutrition.calories.toLocaleString()} <small>{t.calories}</small></strong><p>{t.caloriesNote}</p></div><Flame size={25}/></div><div className="nutrition-macros">{[[t.protein,nutrition.protein,'#b7fa45'],[t.carbs,nutrition.carbs,'#9b8cff'],[t.fat,nutrition.fat,'#ffb457']].map(([label,amount,color]) => <div key={label as string}><span>{label}</span><strong>{amount} g</strong><i style={{ background: color as string, width: `${Math.min(100,Number(amount)/Math.max(nutrition.protein,nutrition.carbs,nutrition.fat)*100)}%` }}/></div>)}</div><div className="coach-meals"><span><Utensils size={15}/>{t.meals}</span><p>{t.mealsText}</p></div><p className="nutrition-disclaimer"><CircleAlert size={14}/>{t.nutritionNote}. {t.nutritionHelp}</p></div>}
        </section>
      </section><footer className="coach-footer"><span>© 2025 VYTRON FITNESS</span><span>TRAIN SMART · MOVE WELL <i>✳</i></span></footer>
    </main>
  </div>
}

function PlanCard({ plan, lang, onSave, onWorkouts, saveLabel, startLabel, saved = false }: { plan: WorkoutPlan; lang: Language; onSave: () => void; onWorkouts: () => void; saveLabel: string; startLabel: string; saved?: boolean }) {
  const dayLabel = copy[lang].day
  return <article className="coach-plan-card"><div className="coach-plan-title"><div><span>{plan.title}</span><small>{plan.days.length} {copy[lang].planDays} · {new Date(plan.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</small></div><button onClick={onSave} aria-label={saveLabel}>{saved ? <Trash2 size={15}/> : <Check size={16}/>} {saveLabel}</button></div><div className="coach-plan-days">{plan.days.map((day,index) => <div key={`${plan.id}-${day.name}`}><span>{dayLabel} {index+1} · {day.name.split('·')[1]?.trim()}</span>{day.exercises.map((id) => { const exercise = findExercise(id); return exercise ? <p key={id}><Dumbbell size={13}/>{exercise.name}<small>{exercise.sets} × {exercise.reps} · {exercise.rest}s</small></p> : null })}</div>)}</div><button className="coach-plan-link" onClick={onWorkouts}>{startLabel}<ArrowRight size={14}/></button></article>
}

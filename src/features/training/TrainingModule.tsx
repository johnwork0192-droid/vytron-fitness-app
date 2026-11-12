import { ArrowLeft, ArrowRight, Check, Clock3, Dumbbell, Filter, Play, RotateCcw, Sparkles, Timer, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AnatomyViewer, { type ModelView } from './AnatomyViewer'
import { exercises, muscleGroups, trainingLevels, type Exercise, type MuscleGroup, type TrainingLevel, type TrainingPlace } from './exercises'

const places: Array<TrainingPlace | 'ALL'> = ['ALL', 'HOME', 'GYM']

export default function TrainingModule() {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState<TrainingPlace | 'ALL'>('ALL')
  const [level, setLevel] = useState<TrainingLevel | 'ALL'>('ALL')
  const [muscle, setMuscle] = useState<MuscleGroup | 'ALL'>('ALL')
  const [selected, setSelected] = useState<Exercise>(exercises[0])
  const [view, setView] = useState<ModelView>('Front')
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [setNumber, setSetNumber] = useState(1)
  const [restSeconds, setRestSeconds] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const navButton = target.closest('.nav-item')
      if (!navButton) return
      const label = navButton.textContent?.trim() ?? ''
      if (label.startsWith('Workouts')) setOpen(true)
      if (label.startsWith('Overview')) setOpen(false)
    }
    document.addEventListener('click', handleNavigation, true)
    return () => document.removeEventListener('click', handleNavigation, true)
  }, [])

  useEffect(() => {
    if (!restSeconds) return
    const timer = window.setTimeout(() => setRestSeconds((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [restSeconds])

  const filteredExercises = useMemo(() => exercises.filter((exercise) =>
    (place === 'ALL' || exercise.place === place) &&
    (level === 'ALL' || exercise.level === level) &&
    (muscle === 'ALL' || exercise.muscle === muscle),
  ), [level, muscle, place])

  useEffect(() => {
    if (filteredExercises.length && !filteredExercises.some((exercise) => exercise.id === selected.id)) setSelected(filteredExercises[0])
  }, [filteredExercises, selected.id])

  const chooseExercise = (exercise: Exercise) => {
    setSelected(exercise)
    setRunning(false)
    setCompleted(false)
    setSetNumber(1)
    setRestSeconds(0)
    setAnimating(false)
  }

  const finishSet = () => {
    if (setNumber >= selected.sets) {
      setCompleted(true)
      setRunning(false)
      setAnimating(false)
      setRestSeconds(0)
      return
    }
    setSetNumber((current) => current + 1)
    setRestSeconds(selected.rest)
  }

  if (!open) return null

  return (
    <div className="training-overlay" role="dialog" aria-modal="true" aria-label="VYTRON FITNESS training studio">
      <header className="training-topbar">
        <button className="training-back" onClick={() => setOpen(false)}><ArrowLeft size={17} /> <span>Dashboard</span></button>
        <div className="training-wordmark"><span>V</span> VYTRON <b>FITNESS</b> <i>TRAINING STUDIO</i></div>
        <button className="training-exit" aria-label="Close training studio" onClick={() => setOpen(false)}><X size={19} /></button>
      </header>
      <main className="training-page">
        <section className="training-intro"><div><p className="training-kicker"><span /> YOUR TRAINING STUDIO</p><h1>Train with <em>intention.</em></h1><p>Choose your workout. Know your form. Build a stronger you.</p></div><div className="training-intro-badge"><Dumbbell size={17} /><span>14 EXERCISES <i>·</i> 6 MUSCLE GROUPS</span></div></section>
        <div className="training-layout">
          <section className="anatomy-panel">
            <div className="panel-title-row"><div><span className="panel-kicker">INTERACTIVE ANATOMY</span><h2>Muscle map</h2></div><span className="model-live"><i /> LIVE MODEL</span></div>
            <div className="view-toggle" aria-label="Model orientation">{(['Front', 'Back', 'Side'] as ModelView[]).map((angle) => <button key={angle} className={view === angle ? 'view-active' : ''} onClick={() => setView(angle)}>{angle}</button>)}</div>
            <AnatomyViewer selectedMuscle={muscle === 'ALL' ? selected.muscle : muscle} view={view} onSelectMuscle={(group) => { setMuscle(group); const match = exercises.find((exercise) => exercise.muscle === group); if (match) chooseExercise(match) }} animating={animating} />
            <div className="muscle-picker"><div className="muscle-picker-head"><span>FOCUS AREA</span><button onClick={() => setMuscle('ALL')}>Clear</button></div><div className="muscle-chips">{muscleGroups.map((group) => <button key={group} className={`${(muscle === group || (muscle === 'ALL' && selected.muscle === group)) ? 'muscle-chip-active' : ''}`} onClick={() => { setMuscle(muscle === group ? 'ALL' : group); const match = exercises.find((exercise) => exercise.muscle === group && (place === 'ALL' || exercise.place === place)); if (match) chooseExercise(match) }}>{group}</button>)}</div></div>
            <div className="anatomy-legend"><i /> Target muscle <span>·</span> Tap a muscle or select a focus area</div>
          </section>

          <section className="exercise-browser">
            <div className="exercise-heading"><div><span className="panel-kicker">BUILT AROUND YOU</span><h2>Exercise library</h2></div><span className="exercise-count">{filteredExercises.length} MOVES</span></div>
            <div className="filter-row" aria-label="Training location">{places.map((option) => <button key={option} className={place === option ? 'filter-active' : ''} onClick={() => setPlace(option)}>{option === 'ALL' ? 'All' : option}</button>)}</div>
            <label className="level-select-label"><Filter size={13} /><span>LEVEL</span><select aria-label="Filter by level" value={level} onChange={(event) => setLevel(event.target.value as TrainingLevel | 'ALL')}><option value="ALL">All levels</option>{trainingLevels.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <div className="library-list">{filteredExercises.length ? filteredExercises.map((exercise) => <button key={exercise.id} className={`exercise-item ${selected.id === exercise.id ? 'exercise-item-active' : ''}`} onClick={() => chooseExercise(exercise)}><span className="exercise-symbol"><Dumbbell size={16} /></span><span className="exercise-copy"><strong>{exercise.name}</strong><small>{exercise.muscle} <i>·</i> {exercise.equipment}</small></span><span className="exercise-meta"><b>{exercise.sets} × {exercise.reps}</b><small>{exercise.level}</small></span><ArrowRight size={15} className="exercise-arrow" /></button>) : <div className="empty-library"><Sparkles size={18} /><p>No moves match these filters. Try another level or training place.</p></div>}</div>
          </section>
        </div>

        <section className="exercise-detail" aria-label={`${selected.name} exercise details`}>
          <div className="detail-title"><div><span className="panel-kicker">EXERCISE SPOTLIGHT</span><h2>{selected.name}</h2><p>{selected.place} <i>·</i> {selected.level} <i>·</i> {selected.equipment}</p></div><button className="demo-toggle" onClick={() => setAnimating(!animating)}><RotateCcw size={14} /> {animating ? 'Pause demo' : 'Preview motion'}</button></div>
          <div className="detail-grid">
            <div className="detail-demo"><AnatomyViewer selectedMuscle={selected.muscle} view={view} onSelectMuscle={setMuscle} animating={animating} /><span className="demo-label"><Play size={11} /> 3D FORM PREVIEW</span></div>
            <div className="detail-instructions"><h3>Technique & form</h3><ol>{selected.technique.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol><div className="detail-muscles"><span>MUSCLES WORKED</span><div>{selected.musclesWorked.map((group) => <b key={group}>{group}</b>)}</div></div></div>
            <div className="session-card"><span className="panel-kicker">YOUR SESSION</span><div className="session-metrics"><div><span>SETS</span><strong>{selected.sets}</strong></div><div><span>REPS</span><strong>{selected.reps}</strong></div><div><span>REST</span><strong>{selected.rest}<small>s</small></strong></div></div><div className="set-progress"><span>SET PROGRESS</span><strong>{completed ? selected.sets : setNumber} <i>/ {selected.sets}</i></strong><div>{Array.from({ length: selected.sets }, (_, index) => <i key={index} className={index + 1 < setNumber || completed ? 'set-complete' : ''} />)}</div></div>{restSeconds > 0 && <div className="rest-clock"><Timer size={15} /> Rest · {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}</div>}{completed ? <button className="session-button session-finished" onClick={() => chooseExercise(selected)}><Check size={16} /> Exercise complete</button> : running ? <button className="session-button" onClick={finishSet}><Check size={16} /> Complete set {setNumber}</button> : <button className="session-button" onClick={() => { setRunning(true); setAnimating(true); setRestSeconds(0) }}><Play size={15} fill="currentColor" /> {setNumber > 1 ? 'Start next set' : 'Start exercise'}</button>}<span className="safety-note"><Clock3 size={12} /> Move at your own pace. Stop if anything feels painful.</span></div>
          </div>
        </section>
        <footer className="training-footer"><span>© 2025 VYTRON FITNESS</span><span>TRAIN SMART. MOVE WELL. <i>✳</i></span></footer>
      </main>
    </div>
  )
}

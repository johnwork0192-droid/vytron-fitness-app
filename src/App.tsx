import { Activity, AudioLines, BarChart3, Bot, CircleUserRound, Dumbbell, LayoutDashboard, Menu, Settings, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { workouts, week } from './data/dashboard'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Workouts', icon: Dumbbell },
  { label: 'Progress', icon: BarChart3 },
  { label: 'AI Coach', icon: Bot },
]

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [selectedDay, setSelectedDay] = useState('14')
  const [menuOpen, setMenuOpen] = useState(false)
  const [workoutStarted, setWorkoutStarted] = useState(false)

  return (
    <div className="app-shell">
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#home" aria-label="VYTRON FITNESS home">
          <span className="brand-mark"><Activity size={21} strokeWidth={2.7} /></span>
          <span className="brand-name">VYTRON <b>FITNESS</b></span>
          <button className="mobile-close icon-button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        </a>
        <div className="nav-caption">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'nav-item-active' : ''}`} onClick={() => { setActiveNav(label); setMenuOpen(false) }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === 'AI Coach' && <span className="nav-new">NEW</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="coach-promo">
            <span className="promo-icon"><Sparkles size={16} /></span>
            <p>Your goals, with a little more intelligence.</p>
            <button onClick={() => setActiveNav('AI Coach')}>Meet your AI Coach <span>↗</span></button>
          </div>
          <button className="nav-item settings-link" onClick={() => setActiveNav('Settings')}><Settings size={18} strokeWidth={1.8} /><span>Settings</span></button>
          <div className="profile-row">
            <div className="avatar">JD</div>
            <div className="profile-copy"><strong>Jordan Davis</strong><span>Pro athlete</span></div>
            <CircleUserRound size={17} className="profile-more" />
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <b>{activeNav}</b></div>
          <div className="topbar-right"><span className="live-dot" /> <span className="today-label">WEDNESDAY, MAY 14</span><div className="top-avatar">JD</div></div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div><p className="eyebrow">YOUR TRAINING HQ <span className="eyebrow-line" /></p><h1>Make today <span>count.</span></h1><p className="welcome-subtitle">Small steps. Strong habits. Your next level starts here.</p></div>
            <button className="date-button"><span className="date-icon">◷</span> May 12 – 18, 2025 <span className="chevron">⌄</span></button>
          </section>

          <section className="hero-card" aria-label="Today's featured workout">
            <div className="hero-image" />
            <div className="hero-overlay" />
            <div className="hero-content">
              <div className="hero-tag"><span className="tag-dot" /> TODAY'S FOCUS</div>
              <h2>Built by<br />consistency.</h2>
              <p>A stronger you isn't built in a day.<br className="desktop-break" /> It's built every day you show up.</p>
              <button className={`primary-button ${workoutStarted ? 'button-done' : ''}`} onClick={() => setWorkoutStarted(!workoutStarted)}>
                {workoutStarted ? 'Workout started' : 'Start today’s workout'} <span>{workoutStarted ? '✓' : '→'}</span>
              </button>
            </div>
            <div className="hero-side-note"><span>01</span><i /> TRAIN WITH INTENTION</div>
            <div className="hero-stat"><span>WEEKLY GOAL</span><strong>03 <small>/ 05</small></strong><div className="mini-progress"><i /></div></div>
          </section>

          <section className="stats-grid" aria-label="Your statistics">
            <article className="stat-card"><div className="stat-top"><span>WEEKLY ACTIVITY</span><span className="stat-icon green"><Activity size={17} /></span></div><div className="stat-value">3 <small>workouts</small></div><div className="stat-foot"><span className="positive">↗ 2 sessions</span> from last week</div><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-top"><span>ACTIVE TIME</span><span className="stat-icon purple"><AudioLines size={17} /></span></div><div className="stat-value">2.8 <small>hrs</small></div><div className="stat-foot">of movement this week</div><div className="stat-track"><i style={{ width: '62%' }} /></div></article>
            <article className="stat-card"><div className="stat-top"><span>CURRENT STREAK</span><span className="stat-icon orange">✳</span></div><div className="stat-value">7 <small>days</small></div><div className="stat-foot"><span className="orange-text">You’re on fire.</span> Keep it going</div><div className="streak-dots"><i /><i /><i /><i /><i /><i /><i /></div></article>
          </section>

          <section className="lower-grid">
            <div className="section-panel week-panel">
              <div className="section-heading"><div><p className="eyebrow">STAY ON TRACK</p><h3>Your week</h3></div><button className="text-button">View calendar <span>→</span></button></div>
              <div className="week-strip">{week.map((day) => <button key={day.date} onClick={() => setSelectedDay(day.date)} className={`week-day ${selectedDay === day.date ? 'week-day-active' : ''} ${day.complete ? 'week-day-complete' : ''}`}><span>{day.day}</span><strong>{day.date}</strong><i>{day.complete ? '✓' : day.active ? '•' : ''}</i></button>)}</div>
              <div className="day-plan"><div className="plan-indicator" /><div className="plan-info"><span>WEDNESDAY · MAY {selectedDay}</span><strong>{selectedDay === '14' ? 'Upper body strength' : 'Your next session'}</strong><small>45 min <i>·</i> Strength <i>·</i> Intermediate</small></div><button className="round-arrow" aria-label="Open workout" onClick={() => setWorkoutStarted(true)}>↗</button></div>
            </div>

            <div className="section-panel coach-panel">
              <div className="coach-panel-top"><div className="coach-mark"><Sparkles size={20} /></div><span className="coach-status"><i /> ONLINE</span></div>
              <p className="eyebrow">A NOTE FROM YOUR COACH</p><h3>You’re building<br /><em>real momentum.</em></h3>
              <p className="coach-message">Three sessions down this week. Keep your recovery intentional and you’ll be ready to go again tomorrow.</p>
              <button className="coach-link" onClick={() => setActiveNav('AI Coach')}>Chat with your AI Coach <span>→</span></button>
            </div>
          </section>

          <section className="workouts-section">
            <div className="section-heading workout-heading"><div><p className="eyebrow">MADE FOR YOUR GOALS</p><h3>Pick your next move</h3></div><button className="text-button">All workouts <span>→</span></button></div>
            <div className="workout-grid">{workouts.map((workout) => <article className="workout-card" key={workout.title}><div className="workout-image" style={{ backgroundImage: `linear-gradient(180deg, transparent 38%, rgba(12,14,12,.84)), url("${workout.image}")` }}><span className={`workout-category ${workout.accent}`}>{workout.category}</span><button aria-label={`Start ${workout.title}`} className="workout-play" onClick={() => setWorkoutStarted(true)}>▶</button></div><div className="workout-details"><h4>{workout.title}</h4><div><span>{workout.duration}</span><i /> <span>{workout.level}</span></div></div></article>)}</div>
          </section>
          <footer className="page-footer"><span>© 2025 VYTRON FITNESS</span><span>BUILT FOR YOUR NEXT LEVEL <b>✳</b></span></footer>
        </div>
      </main>
    </div>
  )
}

export default App

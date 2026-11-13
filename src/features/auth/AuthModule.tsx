import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured, publishAuthState } from '../../lib/supabase'
import './auth.css'

type Language = 'en' | 'ru'
type AuthMode = 'signin' | 'signup' | 'recovery'
const text = { en: { signIn: 'Sign in', signUp: 'Create account', email: 'Email', password: 'Password', name: 'Name', forgot: 'Forgot password?', back: 'Back to sign in', signOut: 'Sign out', account: 'Account', logged: 'Signed in', offline: 'Supabase is not configured. Add project URL and public anon key to enable cloud accounts.', sent: 'Check your email for the confirmation or password reset link.', submit: 'Continue', confirm: 'Confirm your email to finish registration.', busy: 'Working…', close: 'Close', authRequired: 'Authentication is unavailable right now.' }, ru: { signIn: 'Войти', signUp: 'Создать аккаунт', email: 'Электронная почта', password: 'Пароль', name: 'Имя', forgot: 'Забыли пароль?', back: 'Назад ко входу', signOut: 'Выйти', account: 'Аккаунт', logged: 'Вы вошли', offline: 'Supabase не настроен. Добавьте URL проекта и публичный anon key для облачной авторизации.', sent: 'Проверьте почту: отправлена ссылка подтверждения или сброса пароля.', submit: 'Продолжить', confirm: 'Подтвердите адрес почты, чтобы завершить регистрацию.', busy: 'Подождите…', close: 'Закрыть', authRequired: 'Сейчас авторизация недоступна.' } } as const
export default function AuthModule() {
  const [open, setOpen] = useState(false); const [session, setSession] = useState<Session | null>(null); const [mode, setMode] = useState<AuthMode>('signin'); const [lang, setLang] = useState<Language>(() => typeof navigator !== 'undefined' && navigator.language.startsWith('ru') ? 'ru' : 'en'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const t = text[lang]
  useEffect(() => {
    const onProfile = (event: MouseEvent) => { const target = event.target; if (target instanceof Element && target.closest('.profile-row')) setOpen(true) }
    document.addEventListener('click', onProfile, true)
    if (!isSupabaseConfigured()) return () => document.removeEventListener('click', onProfile, true)
    const supabase = getSupabase()
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); publishAuthState(data.session) })
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => { setSession(newSession); publishAuthState(newSession) })
    return () => { document.removeEventListener('click', onProfile, true); data.subscription.unsubscribe() }
  }, [])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      if (!isSupabaseConfigured()) throw new Error(t.offline)
      const supabase = getSupabase()
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/` } })
        if (authError) throw authError
        if (data.session && data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, display_name: name })
          if (profileError) throw profileError
          setNotice(t.confirm)
        } else setNotice(t.sent)
      } else if (mode === 'recovery') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` })
        if (authError) throw authError
        setNotice(t.sent)
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) throw authError
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, display_name: name || String(data.user.user_metadata.display_name ?? '') })
          if (profileError) throw profileError
        }
        setOpen(false)
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : t.authRequired) } finally { setBusy(false) }
  }
  const signOut = async () => { setBusy(true); setError(''); try { const { error: authError } = await getSupabase().auth.signOut(); if (authError) throw authError; setSession(null); publishAuthState(null); setOpen(false) } catch (caught) { setError(caught instanceof Error ? caught.message : t.authRequired) } finally { setBusy(false) } }
  if (!open) return null
  return <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><section className="auth-card" role="dialog" aria-modal="true" aria-label={t.account}><button className="auth-close" onClick={() => setOpen(false)} aria-label={t.close}>×</button><div className="auth-brand">VYTRON <b>FITNESS</b></div><div className="auth-tools"><span>{session ? t.logged : t.account}</span><button onClick={() => setLang((value) => value === 'en' ? 'ru' : 'en')}>{lang === 'en' ? 'RU' : 'EN'}</button></div>{session ? <><h1>{t.logged}</h1><p className="auth-user">{session.user.email}</p><button className="auth-primary" disabled={busy} onClick={() => void signOut()}>{busy ? t.busy : t.signOut}</button></> : <><h1>{mode === 'signup' ? t.signUp : mode === 'recovery' ? t.forgot : t.signIn}</h1><form onSubmit={(event) => void submit(event)}>{mode === 'signup' && <label>{t.name}<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>}<label>{t.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>{mode !== 'recovery' && <label>{t.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required /></label>}{error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}<button className="auth-primary" disabled={busy}>{busy ? t.busy : t.submit}</button></form><div className="auth-links">{mode === 'signin' && <button onClick={() => { setMode('recovery'); setError(''); setNotice('') }}>{t.forgot}</button>}{mode !== 'signin' && <button onClick={() => { setMode('signin'); setError(''); setNotice('') }}>{t.back}</button>}<button onClick={() => { setMode((value) => value === 'signup' ? 'signin' : 'signup'); setError(''); setNotice('') }}>{mode === 'signup' ? t.signIn : t.signUp}</button></div>{!isSupabaseConfigured() && <p className="auth-note">{t.offline}</p>}</>}</section></div>
}

import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../stores/authStore'
import { authErrorMessage, signIn, supabase } from '../lib/supabase'
import './AuthPages.css'

function PasswordField({ name, label, autoComplete, error, hint, signup }) {
  const [visible, setVisible] = useState(false)
  return <div className="auth-field">
    <label htmlFor={name}>{label}</label>
    <div className="password-control"><input id={name} name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} required minLength={signup ? 8 : undefined} maxLength={signup ? 72 : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined} />
      <button type="button" aria-label={`${label} ${visible ? '숨기기' : '보기'}`} aria-pressed={visible} onClick={() => setVisible(!visible)}><iconify-icon icon={visible ? 'solar:eye-closed-linear' : 'solar:eye-linear'} /></button></div>
    {hint && <span id={`${name}-hint`} className="auth-hint">{hint}</span>}
    {error && <span className="auth-error" id={`${name}-error`}>{error}</span>}
  </div>
}

function AuthPage({ signup = false }) {
  const auth = useAuthStore(useShallow(state => ({ user: state.user, ready: state.ready, profileError: state.profileError, retryProfile: state.retryProfile, signOut: state.signOut })))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const submitting = useRef(false)

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    const returnToMyPage = new URLSearchParams(window.location.hash.split('?')[1] || '').get('next') === 'mypage'
    const values = new FormData(form)
    const next = {}
    if (signup && (!String(values.get('name') || '').trim() || String(values.get('name')).trim().length > 60)) next.name = '이름을 1~60자로 입력해 주세요.'
    const email = String(values.get('email') || '').trim()
    if (!email) next.email = '이메일을 입력해 주세요.'
    else if (form.elements.namedItem('email').validity.typeMismatch || /\s/.test(email)) next.email = '올바른 이메일 형식으로 입력해 주세요.'
    const password = String(values.get('password') || '')
    if (!password) next.password = '비밀번호를 입력해 주세요.'
    else if (signup && (password.length < 8 || password.length > 72 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))) next.password = '영문과 숫자를 포함한 8~72자로 입력해 주세요.'
    if (signup) {
      if (!values.get('confirmPassword')) next.confirmPassword = '비밀번호를 다시 입력해 주세요.'
      else if (values.get('confirmPassword') !== password) next.confirmPassword = '비밀번호가 일치하지 않습니다.'
      if (!values.get('acknowledge')) next.acknowledge = '이용 안내를 확인해 주세요.'
    }
    setErrors(next)
    setFailed(false)
    if (Object.keys(next).length) {
      setMessage('입력 내용을 확인해 주세요.')
      form.elements.namedItem(Object.keys(next)[0]).focus()
      return
    }
    if (!supabase) {
      setFailed(true)
      setMessage('인증 연결 설정이 없습니다. 관리자에게 문의해 주세요.')
      return
    }
    submitting.current = true
    const passwordInput = form.elements.namedItem('password')
    const confirmationInput = form.elements.namedItem('confirmPassword')
    setPending(true)
    setMessage('요청을 처리하고 있습니다.')
    try {
      const { data, error } = signup
        ? await supabase.auth.signUp({ email, password, options: {
          data: { name: String(values.get('name')).trim() },
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        } })
        : { data: await signIn(email, password), error: null }
      if (error) throw error
      if (data.session) {
        setMessage('로그인되었습니다.')
        if (!signup) window.location.hash = returnToMyPage ? '#/mypage' : '#/'
      }
      else if (signup) setMessage('가입 요청을 처리했습니다. 이메일 인증이 필요한 경우 받은 편지함을 확인한 뒤 로그인해 주세요. 이미 가입한 이메일이라면 로그인해 주세요.')
      else throw new Error('session_missing')
    } catch (error) {
      setFailed(true)
      setMessage(authErrorMessage(error))
    } finally {
      passwordInput.value = ''
      if (confirmationInput) confirmationInput.value = ''
      submitting.current = false
      setPending(false)
    }
  }

  if (auth.user) return <section className="shell auth-page"><div className="auth-card"><h1>로그인되었습니다.</h1><p className="auth-description">{auth.user.email}</p>{auth.profileError && <><p className="auth-error" role="alert">{auth.profileError}</p><button className="btn" onClick={auth.retryProfile}>프로필 저장 다시 시도</button></>}<p><a className="btn" href="#/mypage">마이페이지에서 정보 수정</a></p><p><a className="text-link" href="#discover">동네 둘러보기 →</a></p><button className="btn" onClick={auth.signOut}>로그아웃</button></div></section>

  return <div className="shell auth-page">
    <aside className="auth-story"><span className="eyebrow">HELLO, NEIGHBOR</span><div className="auth-story-icon" aria-hidden="true"><iconify-icon icon="solar:map-point-wave-linear" /></div><h2>반가운 일상이,<br />가까운 곳에서.</h2><p>늘 지나던 골목의 작은 카페부터<br />마음에 남는 산책길까지.<br />나의이웃에서 새로운 발견을 시작해 보세요.</p><a className="text-link" href="#discover">가입 없이 동네 둘러보기 →</a><span className="auth-story-note">A LITTLE CLOSER, EVERY DAY</span></aside>
    <section className="auth-card" aria-labelledby="auth-title"><div className="eyebrow">{signup ? 'JOIN OUR NEIGHBORHOOD' : 'WELCOME BACK'}</div><h1 id="auth-title">{signup ? '회원가입' : '로그인'}</h1><p className="auth-description">{signup ? '새로운 동네 발견을 위한 첫걸음.' : '다시 만나 반가워요. 오늘은 어디를 걸어볼까요?'}</p>
      <form noValidate onSubmit={submit} aria-busy={pending} onChange={event => {
        const name = event.target.name
        setErrors(current => { const next = { ...current }; delete next[name]; if (name === 'password') delete next.confirmPassword; return next })
        setMessage('')
        setFailed(false)
      }}>
        {signup && <div className="auth-field"><label htmlFor="name">이름</label><input id="name" name="name" autoComplete="name" required maxLength={60} placeholder="이름을 입력해 주세요" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <span id="name-error" className="auth-error">{errors.name}</span>}</div>}
        <div className="auth-field"><label htmlFor="email">이메일</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="example@email.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{errors.email && <span id="email-error" className="auth-error">{errors.email}</span>}</div>
        <PasswordField name="password" label="비밀번호" autoComplete={signup ? 'new-password' : 'current-password'} error={errors.password} hint={signup ? '영문과 숫자를 포함한 8~72자' : undefined} signup={signup} />
        {signup && <PasswordField name="confirmPassword" label="비밀번호 확인" autoComplete="new-password" error={errors.confirmPassword} signup />}
        {signup && <div className="auth-agreement"><details><summary>이용 및 개인정보 처리 안내</summary><p>가입 시 이메일·비밀번호는 Supabase 인증 서버로 전송되며, 이름은 회원 프로필로 저장됩니다. 비밀번호 확인값은 전송하지 않으며 비밀번호를 브라우저 저장소에 보관하지 않습니다. 유효한 세션이 있으면 새로고침해도 로그인이 유지됩니다. 공용 기기에서는 이용 후 로그아웃해 주세요.</p></details><label className="auth-checkbox"><input name="acknowledge" type="checkbox" required aria-invalid={Boolean(errors.acknowledge)} aria-describedby={errors.acknowledge ? 'acknowledge-error' : undefined} />회원가입 및 개인정보 처리 안내를 확인했습니다.</label>{errors.acknowledge && <span id="acknowledge-error" className="auth-error">{errors.acknowledge}</span>}</div>}
        <button className="btn auth-submit" type="submit" disabled={pending || !auth.ready || !supabase}>{pending ? '처리 중…' : signup ? '회원가입' : '로그인'}<iconify-icon icon="solar:arrow-right-linear" /></button>
        <p className={`auth-feedback${failed || Object.keys(errors).length ? ' has-error' : ''}`} role="status" aria-live="polite">{message}</p>
      </form>
      <p className="auth-switch">{signup ? '이미 계정이 있으신가요?' : '나의이웃이 처음이신가요?'} <a href={signup ? '#/login' : '#/signup'}>{signup ? '로그인' : '회원가입'}</a></p>
      <div className="auth-demo-note"><iconify-icon icon="solar:info-circle-linear" /><p>{supabase ? '이메일과 비밀번호로 이용할 수 있습니다. 가입 후 이메일 인증이 필요할 수 있으며, 유효한 세션이 있으면 로그인 상태가 유지됩니다.' : '인증 연결 설정이 없습니다. 관리자에게 문의해 주세요.'}</p></div>
    </section>
  </div>
}

export function LoginPage() { return <AuthPage /> }
export function SignupPage() { return <AuthPage signup /> }

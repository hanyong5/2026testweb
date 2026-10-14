import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../stores/authStore'
import Avatar from '../components/Avatar'
import { generateAvatarSeed } from '../lib/avatar'
import './MyPage.css'

function ProfileEditor({ auth }) {
  const { profile, user } = auth
  const [name, setName] = useState(profile.name)
  const [seed, setSeed] = useState(profile.avatar_seed)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const nameInput = useRef(null)
  const submitting = useRef(false)
  const changed = name !== profile.name || seed !== profile.avatar_seed

  async function save(event) {
    event.preventDefault()
    if (submitting.current) return
    if (!name.trim() || name.trim().length > 60) {
      setError('이름을 1~60자로 입력해 주세요.')
      setMessage('')
      nameInput.current.focus()
      return
    }
    submitting.current = true
    setPending(true)
    setError('')
    setMessage('변경사항을 저장하고 있습니다.')
    try {
      const saved = await auth.saveProfile({ name, avatar_seed: seed })
      setName(saved.name)
      setSeed(saved.avatar_seed)
      setMessage('회원 정보와 아바타를 저장했습니다.')
    } catch {
      setMessage('')
      setError('저장하지 못했습니다. 입력 내용은 유지됩니다. 연결 상태를 확인하고 다시 시도해 주세요.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  function reset() {
    setName(profile.name)
    setSeed(profile.avatar_seed)
    setError('')
    setMessage('저장된 회원 정보로 되돌렸습니다.')
  }

  return <div className="profile-layout">
    <aside className="profile-preview" aria-label="아바타 미리보기">
      <span className="eyebrow">A FACE FOR YOUR NEIGHBORHOOD</span>
      <Avatar seed={seed} label="내 아바타 미리보기" />
      <h2>나를 닮은 작은 얼굴</h2>
      <p>새로운 얼굴을 골라보세요.<br />마음에 들면 변경사항을 저장해 주세요.</p>
      <button className="btn" type="button" disabled={pending} onClick={() => {
        setSeed(generateAvatarSeed(seed))
        setMessage('새 아바타를 만들었습니다. 저장하면 프로필에 반영됩니다.')
        setError('')
      }}><iconify-icon icon="solar:refresh-linear" />새 아바타 생성</button>
      <span className="profile-preview-note">사진 업로드 없이 바로 만들 수 있어요.</span>
    </aside>
    <section className="profile-form-card" aria-labelledby="profile-info-title">
      <div className="profile-card-heading"><h2 id="profile-info-title">기본 정보</h2><span>{changed ? '저장하지 않은 변경사항' : '저장된 정보'}</span></div>
      <form onSubmit={save} noValidate aria-busy={pending}>
        <fieldset disabled={pending}>
          <div className="auth-field"><label htmlFor="profile-name">이름</label><input ref={nameInput} id="profile-name" name="name" value={name} maxLength={60} required autoComplete="name" aria-invalid={Boolean(error && (!name.trim() || name.trim().length > 60))} aria-describedby="profile-name-hint profile-feedback" onChange={event => { setName(event.target.value); setError(''); setMessage('') }} /><span className="auth-hint" id="profile-name-hint">동네에서 사용할 이름을 1~60자로 입력해 주세요.</span></div>
          <div className="auth-field"><label htmlFor="profile-email">이메일</label><input id="profile-email" type="email" value={user.email || ''} readOnly autoComplete="email" aria-describedby="profile-email-hint" /><span className="auth-hint" id="profile-email-hint">로그인에 사용하는 이메일입니다. 이 화면에서는 변경할 수 없습니다.</span></div>
          <div className="auth-field"><label htmlFor="profile-role">회원 권한</label><input id="profile-role" value={auth.role === 'admin' ? '관리자 (admin)' : '일반 회원 (user)'} readOnly aria-describedby="profile-role-hint" /><span className="auth-hint" id="profile-role-hint">회원 권한은 관리자가 지정하며 직접 변경할 수 없습니다.</span></div>
          <div className="profile-actions"><button className="btn" type="submit" disabled={pending || !changed}>{pending ? '저장 중…' : '변경사항 저장'}</button><button className="profile-reset" type="button" disabled={pending || !changed} onClick={reset}>되돌리기</button></div>
        </fieldset>
        <p id="profile-feedback" className={`auth-feedback${error ? ' has-error' : ''}`} role="status" aria-live="polite">{error || message}</p>
      </form>
      <div className="profile-security-note"><iconify-icon icon="solar:shield-check-linear" /><p>회원 정보는 내 계정에서만 조회하고 수정할 수 있습니다. 비밀번호는 이 화면에서 저장하거나 표시하지 않습니다.</p></div>
    </section>
  </div>
}

export default function MyPage() {
  const auth = useAuthStore(useShallow(state => ({ user: state.user, ready: state.ready, role: state.role, profile: state.profile, profileError: state.profileError, saveProfile: state.saveProfile, retryProfile: state.retryProfile })))
  return <div className="shell mypage"><header className="mypage-intro"><span className="eyebrow">MY NEIGHBORHOOD</span><h1>마이페이지</h1><p>이름과 아바타에 나만의 분위기를 담아보세요.</p></header>
    {!auth.ready ? <p role="status">로그인 상태를 확인하고 있습니다.</p>
      : !auth.user ? <section className="profile-empty"><h2>로그인하고 내 정보를 만나보세요.</h2><p>회원 정보 수정과 아바타 저장은 로그인 후 이용할 수 있습니다.</p><a className="btn" href="#/login?next=mypage">로그인하기</a></section>
        : auth.profile ? <ProfileEditor key={auth.user.id} auth={auth} />
          : <section className="profile-empty"><p role="status">{auth.profileError || '회원 정보를 불러오고 있습니다.'}</p>{auth.profileError && <button className="btn" type="button" onClick={auth.retryProfile}>다시 불러오기</button>}</section>}
  </div>
}

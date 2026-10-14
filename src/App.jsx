import { lazy, Suspense, useEffect, useSyncExternalStore } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Nearby from './components/Nearby'
import { AboutPage, ProductsPage, ContactPage, CommunityPage } from './pages/SitePages'
import { LoginPage, SignupPage } from './pages/AuthPages'
import { useAuth } from './lib/useAuth'
import { useAuthStore } from './stores/authStore'
import { useUiStore } from './stores/uiStore'
import MyPage from './pages/MyPage'
import Avatar from './components/Avatar'
import './components/Nearby.css'
import './pages/SitePages.css'

const NoticesPage = lazy(() => import('./pages/NoticesPage'))

const navigation = [['/', '홈'], ['/about', '회사소개'], ['/products', '제품소개'], ['/contact', '온라인문의'], ['/notices', '공지사항'], ['/community', '커뮤니티']]
const accountNavigation = [['/login', '로그인'], ['/signup', '회원가입']]
const pages = { '/about': AboutPage, '/products': ProductsPage, '/contact': ContactPage, '/community': CommunityPage, '/login': LoginPage, '/signup': SignupPage, '/mypage': MyPage, '/notices': NoticesPage }
function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}
const getHash = () => window.location.hash

export default function App() {
  useAuth()
  const auth = useAuthStore(useShallow(state => ({ user: state.user, error: state.error, profileError: state.profileError, signOut: state.signOut, signingOut: state.signingOut })))
  const avatarSeed = useAuthStore(state => state.profile?.avatar_seed ?? 0)
  const hash = useSyncExternalStore(subscribe, getHash)
  const path = hash.startsWith('#/') ? hash.slice(1).split('?')[0] : '/'
  const menuOpen = useUiStore(state => state.menuOpen)
  const setMenuOpen = useUiStore(state => state.setMenuOpen)
  const Page = pages[path]

  useEffect(() => {
    document.title = `${[...navigation, ...accountNavigation, ['/mypage', '마이페이지']].find(([url]) => url === path)?.[1] || '페이지를 찾을 수 없습니다'} | 나의이웃`
    const anchor = hash && !hash.startsWith('#/') ? document.getElementById(hash.slice(1)) : null
    if (anchor) anchor.scrollIntoView()
    else {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('page-content')?.focus({ preventScroll: true })
    }
  }, [hash, path])

  return <>
    <a className="sr-only" href="#page-content" onClick={event => {
      event.preventDefault()
      const content = document.getElementById('page-content')
      content.focus({ preventScroll: true })
      content.scrollIntoView()
    }}>본문으로 이동</a>
    <header className="nav site-header"><div className="shell nav-inner">
      <a className="brand site-brand" href="#/" onClick={() => setMenuOpen(false)}><iconify-icon className="brand-mark" icon="solar:map-point-wave-linear" />나의이웃</a>
      <button className="menu-toggle" aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}><iconify-icon icon={menuOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'} /></button>
      <nav id="site-navigation" className={`site-links${menuOpen ? ' is-open' : ''}`} aria-label="주 메뉴">{navigation.map(([url, label]) => <a key={url} href={`#${url}`} aria-current={path === url ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <nav className="account-links" aria-label="회원 메뉴">{auth.user ? <><a className="mypage-link" href="#/mypage" aria-current={path === '/mypage' ? 'page' : undefined} onClick={() => setMenuOpen(false)}><Avatar seed={avatarSeed} className="account-avatar" label="" />마이페이지</a><button type="button" disabled={auth.signingOut} onClick={auth.signOut}>로그아웃</button></> : accountNavigation.map(([url, label]) => <a key={url} href={`#${url}`} aria-current={path === url ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
    </div></header>
    <main id="page-content" tabIndex={-1}>
      {auth.error && <p className="shell auth-error" role="alert">{auth.error}</p>}
      {auth.profileError && !['/login', '/signup', '/mypage'].includes(path) && <p className="shell auth-error" role="alert">{auth.profileError} <a href="#/mypage">마이페이지에서 다시 시도</a></p>}
      {path === '/' ? <Nearby /> : Page ? <Suspense fallback={<p className="shell" role="status">화면을 불러오고 있습니다.</p>}><Page /></Suspense> : <div className="shell page-intro"><span className="eyebrow">404</span><h1>페이지를 찾을 수 없어요.</h1><p>메뉴에서 원하는 페이지를 선택해 주세요.</p><a className="btn" href="#/">홈으로 이동</a></div>}
    </main>
    <footer className="shell site-footer"><div><a className="brand site-brand" href="#/">나의이웃</a><p>가까운 곳에서 시작하는 새로운 발견.</p></div><nav aria-label="하단 메뉴">{navigation.map(([url, label]) => <a key={url} href={`#${url}`}>{label}</a>)}</nav><p className="footer-note">© 2026 나의이웃. 서비스 소개 및 체험용 웹사이트.<br />장소·사진·커뮤니티 게시물은 예시입니다.</p></footer>
  </>
}

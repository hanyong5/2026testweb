import { useRef } from 'react'
import { useUiStore } from '../stores/uiStore'
import './HeroSlider.css'

const slides = [
  { label: '동네 발견', eyebrow: 'EVERYDAY, A LITTLE CLOSER', title: '좋은 하루는,', subtitle: '생각보다 ', emphasis: '가까이.', copy: '매일 지나치던 골목에도 새로운 취향이 있어요. 작은 카페부터 느긋한 산책길까지, 지금 당신의 곁에 있는 장소를 발견해 보세요.', seed: 'gyeot-garden', alt: '동네 탐색을 떠올리게 하는 자연 풍경', caption: '멀리 가지 않아도 괜찮아요.', note: '익숙한 동네에서 시작하는 작은 여행', icon: 'map-point', floating: '어디부터 걸어볼까요?', detail: '당신의 동네를 골라보세요' },
  { label: '카페의 여유', eyebrow: 'A COFFEE, A LITTLE PAUSE', title: '잠깐의 여유도,', subtitle: '우리 동네 ', emphasis: '어딘가에.', copy: '햇살이 머무는 창가와 따뜻한 커피 한 잔. 바쁜 하루의 속도를 잠시 낮추고, 마음에 드는 동네 카페를 찾아보세요.', seed: 'gyeot-coffee', alt: '동네 카페의 여유를 표현하는 예시 사진', caption: '오늘은 조금 쉬어가요.', note: '커피 한 잔으로 채우는 느긋한 오후', icon: 'cup-hot', floating: '오늘의 쉼표를 찾아요', detail: '작은 카페에서 만나는 여유' },
  { label: '골목 산책', eyebrow: 'SLOW STEPS, NEW DISCOVERIES', title: '늘 걷던 길도,', subtitle: '오늘은 ', emphasis: '새롭게.', copy: '익숙한 길에서 한 골목만 달리 걸어보세요. 초록빛 산책길과 작은 문화 공간에서 다음으로 좋아하게 될 취향을 만나보세요.', seed: 'gyeot-local-walk', alt: '가벼운 동네 산책을 떠올리게 하는 예시 풍경', caption: '발걸음이 닿는 곳마다.', note: '가까운 골목에서 발견하는 새로운 취향', icon: 'leaf', floating: '가볍게 한 바퀴 걸어요', detail: '산책길에서 만나는 작은 발견' },
]

export default function HeroSlider({ locate, locating, status }) {
  const active = useUiStore(state => state.activeSlide)
  const setActive = useUiStore(state => state.setActiveSlide)
  const touchStart = useRef(null)
  const move = useUiStore(state => state.moveSlide)

  function finishSwipe(event) {
    const start = touchStart.current
    touchStart.current = null
    if (!start || !event.changedTouches[0]) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1)
  }

  return (
    <section className="shell hero-carousel" aria-label="동네 발견 소개" aria-roledescription="캐러셀">
      <div className="hero-viewport" tabIndex={0} aria-label="좌우 방향키로 소개 슬라이드 이동"
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            move(event.key === 'ArrowRight' ? 1 : -1)
          }
        }}
        onTouchStart={event => {
          const touch = event.touches[0]
          touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
        }}
        onTouchEnd={finishSwipe} onTouchCancel={() => { touchStart.current = null }}>
        <div className="hero-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {slides.map((slide, index) => (
            <div key={slide.seed} id={`hero-slide-${index}`} className="hero hero-slide" role="group" aria-roledescription="슬라이드" aria-label={`${index + 1} / ${slides.length}: ${slide.label}`} aria-hidden={active !== index} inert={active !== index}>
              <div>
                <div className="eyebrow"><span className="dot" />{slide.eyebrow}</div>
                {index === 0 ? <h1>{slide.title}<br />{slide.subtitle}<em>{slide.emphasis}</em></h1> : <h2 className="hero-title">{slide.title}<br />{slide.subtitle}<em>{slide.emphasis}</em></h2>}
                <p className="hero-copy">{slide.copy}</p>
                <div className="hero-actions">
                  <button className="btn" onClick={locate} disabled={locating}><iconify-icon icon="solar:gps-linear" /><span>{locating ? '위치 확인 중' : '내 주변 발견하기'}</span><iconify-icon icon="solar:arrow-right-linear" /></button>
                  <a href="#discover" className="text-link">동네 먼저 둘러보기</a>
                </div>
                <div className="privacy"><iconify-icon icon="solar:shield-check-linear" />위치는 탐색할 때만 사용하고 저장하지 않아요.</div>
              </div>
              <div className="hero-visual">
                <div className="photo"><img src={`https://picsum.photos/seed/${slide.seed}/900/1100`} alt={slide.alt} decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} draggable={false} /><div className="photo-caption"><small>YOUR NEXT LITTLE DISCOVERY</small><h2>{slide.caption}</h2><p>{slide.note}</p></div></div>
                <div className="floating float-top"><span className="round-icon"><iconify-icon icon={`solar:${slide.icon}-linear`} /></span><div><strong>{slide.floating}</strong><small>{slide.detail}</small></div></div>
                <div className="floating float-bottom"><span className="round-icon"><iconify-icon icon="solar:leaf-linear" /></span><div><strong>오늘은, 조금 느리게</strong><small>커피 한 잔과 골목 한 바퀴</small></div></div>
                <div className="hero-stamp"><iconify-icon icon="solar:sun-2-linear" />STAY LOCAL<br />FEEL MORE</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-controls">
        <div className="hero-pagination" aria-label="소개 슬라이드 선택">{slides.map((slide, index) => <button key={slide.seed} className={`hero-page${active === index ? ' active' : ''}`} aria-label={`${index + 1}번 ${slide.label} 슬라이드`} aria-current={active === index ? 'true' : undefined} aria-controls={`hero-slide-${index}`} onClick={() => setActive(index)}><span /></button>)}</div>
        <span className="hero-counter" aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, '0')} / 03</span>
        <div className="hero-arrows"><button aria-label="이전 슬라이드" onClick={() => move(-1)}><iconify-icon icon="solar:arrow-left-linear" /></button><button aria-label="다음 슬라이드" onClick={() => move(1)}><iconify-icon icon="solar:arrow-right-linear" /></button></div>
      </div>
      <p id="location-status" className="status" role="status" aria-live="polite">{status}</p>
    </section>
  )
}

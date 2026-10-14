import { lazy, Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useNearbyStore } from '../stores/nearbyStore'
import { areas, data } from './nearbyData'
import './Nearby.css'
import HeroSlider from './HeroSlider'

const RecentNotices = lazy(() => import('./RecentNotices'))
const KakaoMap = lazy(() => import('./KakaoMap'))

const filters = [['all','모두'],['cafe','카페'],['walk','산책'],['culture','문화 공간'],['saved','저장한 곳']]
function distance(place, center) {
  const rad = Math.PI / 180
  const a = Math.sin((place.lat-center.lat)*rad/2)**2 + Math.cos(center.lat*rad)*Math.cos(place.lat*rad)*Math.sin((place.lng-center.lng)*rad/2)**2
  return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}
function formattedDistance(place, center) {
  const meters = distance(place, center)
  return meters < 1000 ? Math.round(meters)+'m' : (meters/1000).toFixed(1)+'km'
}
function PlaceCard({place, selected, saved, distance, onOpen, onSave}) {
  return <article className={'place'+(selected ? ' selected' : '')}>
    <button className="place-open" onClick={onOpen} aria-label={place.name+' 상세 정보'}>
      <img src={'https://picsum.photos/seed/'+place.seed+'/260/260'} loading="lazy" decoding="async" alt={place.label+" 분위기 예시 이미지"} />
      <span><small>{place.label} · {areas[place.area].name}</small><h3>{place.name}</h3><span className="place-description">{place.short}</span><span className="distance"><iconify-icon icon="solar:map-point-linear" />{distance} <span style={{color:"var(--muted)"}}>· 직선거리</span></span></span>
    </button>
    <button type="button" className={'save'+(saved ? ' saved' : '')} aria-label={place.name+(saved ? " 저장 해제" : " 저장")} aria-pressed={saved} onClick={onSave}><iconify-icon icon={'solar:bookmark-'+(saved ? 'bold' : 'linear')} /></button>
  </article>
}

export default function Nearby() {

  const { region, currentCenter, filter, query, selected, saved, status, locating, setRegion, setFilter, setQuery, setSelected, toggleSave, locate: locateNearby } = useNearbyStore(useShallow(state => ({
    region: state.region, currentCenter: state.currentCenter, filter: state.filter, query: state.query, selected: state.selected, saved: state.saved, status: state.status, locating: state.locating,
    setRegion: state.setRegion, setFilter: state.setFilter, setQuery: state.setQuery, setSelected: state.setSelected, toggleSave: state.toggleSave, locate: state.locate,
  })))
  const dialogRef = useRef(null)
  useEffect(() => () => setSelected(null), [setSelected])
  const center = region === 'current' ? currentCenter : areas[region]
  const places = useMemo(() => data.filter(place => (region === 'current' || place.area === region) && (filter === 'all' || (filter === 'saved' ? saved.has(place.id) : place.category === filter)) && (!query.trim() || (place.name+place.label+place.short).includes(query.trim()))).sort((a,b) => distance(a,center)-distance(b,center)), [region, filter, query, saved, center])
  const openDetail = useCallback(place => {
    setSelected(place)
    dialogRef.current.showModal()
  }, [setSelected])
  function closeBackdrop(event) {
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close()
  }
  function scrollToDiscover() {
    document.getElementById('discover')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})
  }
  const locate = () => locateNearby(scrollToDiscover)

return (<>

<HeroSlider locate={locate} locating={locating} status={status} />
<div className="shell strip"><span className="strip-title">일상 가까이, 곁의 약속</span><span className="strip-item"><iconify-icon icon="solar:walking-linear"></iconify-icon>거리순으로 가볍게 탐색</span><span className="strip-item"><iconify-icon icon="solar:bookmark-linear"></iconify-icon>마음에 드는 장소 저장</span><span className="strip-item"><iconify-icon icon="solar:shield-check-linear"></iconify-icon>가입 없이 시작하는 발견</span></div>
<section className="shell section" id="discover"><div className="section-head"><div><div className="eyebrow">DISCOVER YOUR NEIGHBORHOOD</div><h2>지금, 이 동네의 발견</h2><p className="subcopy">어떤 하루를 보내고 싶으세요? 취향에 맞는 곳부터 둘러보세요.</p></div><label><span className="sr-only">탐색 지역</span><select id="area" value={region} onChange={event => { setRegion(event.target.value); setSelected(null) }} className="location-select"><option value="seongsu">서울 · 성수동</option><option value="yeonnam">서울 · 연남동</option><option value="busan">부산 · 전포동</option><option value="current" disabled={!currentCenter}>현재 위치</option></select></label></div><div className="toolbar"><div className="filters" role="group" aria-label="장소 유형">{filters.map(([value,label]) => <button key={value} className={`filter${filter === value ? " active" : ""}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="search"><iconify-icon icon="solar:magnifer-linear"></iconify-icon><input id="search" value={query} onChange={event => setQuery(event.target.value)} type="search" aria-label="장소 검색" placeholder="어떤 곳을 찾으세요?" /></label></div><div className="explore-grid"><Suspense fallback={<div className="empty" role="status">지도를 준비하고 있습니다.</div>}><KakaoMap region={region} center={center} currentCenter={currentCenter} places={places} selected={selected} onOpen={openDetail} locate={locate} locating={locating} /></Suspense><div id="places" className="place-list" aria-live="polite">{places.length ? places.map(place => <PlaceCard key={place.id} place={place} selected={selected?.id === place.id} saved={saved.has(place.id)} distance={formattedDistance(place,center)} onOpen={() => openDetail(place)} onSave={() => toggleSave(place.id)} />) : <div className="empty">{filter === "saved" ? "아직 저장한 장소가 없어요. 장소 옆 북마크를 눌러보세요." : "검색 결과가 없어요. 다른 검색어나 카테고리를 선택해 보세요."}</div>}</div></div><p className="sample-note">체험용 페이지입니다. 장소명·사진·설명은 예시이며, 거리는 좌표 기준 직선거리로 실제 도보 거리와 다릅니다.</p></section>
<section className="feature-section" id="how"><div className="shell"><div className="eyebrow">LESS SEARCHING, MORE DISCOVERING</div><h2 style={{"fontSize":"34px","letterSpacing":"-1.7px","margin":"14px 0"}}>복잡한 계획 대신,<br />가벼운 발걸음 하나.</h2><div className="feature-grid"><article className="feature-main"><iconify-icon icon="solar:compass-linear" style={{"fontSize":"32px"}}></iconify-icon><div><h3>지금 서 있는 곳이<br />여행의 시작점이 돼요.</h3><p>현재 위치를 허용하거나 동네를 직접 골라보세요. 가까운 순서로 장소를 살펴볼 수 있어요.</p></div><div className="orbit" aria-hidden="true"><iconify-icon icon="solar:map-point-wave-linear"></iconify-icon></div></article><div className="feature-side"><article className="feature-small"><iconify-icon icon="solar:cup-hot-linear"></iconify-icon><div><h3>오늘의 기분에 맞게</h3><p>커피가 필요한 오후, 걷고 싶은 저녁.<br />카테고리와 검색으로 원하는 장소를 찾아보세요.</p></div></article><article className="feature-small"><iconify-icon icon="solar:bookmark-linear"></iconify-icon><div><h3>다음에 가고 싶은 곳은, 꾹</h3><p>마음에 드는 장소를 저장해 두세요.<br />이 브라우저에서 다시 꺼내볼 수 있어요.</p></div></article></div></div></div></section>
<section className="shell section editorial" id="story"><div className="editorial-image"><img src="https://picsum.photos/seed/gyeot-local-walk/900/700" loading="lazy" decoding="async" alt="가벼운 동네 산책을 떠올리게 하는 풍경 이미지" /><span className="image-tag">동네를 즐기는 작은 제안</span></div><div><div className="eyebrow">A NOTE FROM GYEOT</div><blockquote>늘 가던 길에서<br />한 골목만 달리 걸어보세요.</blockquote><p>새로운 하루에 꼭 먼 여행이 필요한 건 아니니까요.<br />눈여겨보던 작은 공간에 들르고, 좋아하는 길을 걸어보세요.<br />곁은 그런 작고 느린 발견에서 시작합니다.</p><a href="#discover" className="text-link" style={{"display":"inline-flex","gap":"16px","marginTop":"15px"}}>나만의 동네 산책 시작하기 <iconify-icon icon="solar:arrow-right-linear"></iconify-icon></a></div></section>
<Suspense fallback={<section className="shell section" aria-busy="true" />}><RecentNotices /></Suspense>
<section className="shell cta"><div><h2>오늘의 발견은, 당신의 곁에.</h2><p>일상의 반경을 조금만 넓혀보세요.<br />다음으로 좋아하게 될 장소가 기다리고 있어요.</p></div><a href="#discover" className="btn">우리 동네 둘러보기 <iconify-icon icon="solar:arrow-right-linear"></iconify-icon></a></section>
<dialog id="detail" ref={dialogRef} onClose={() => setSelected(null)} onClick={closeBackdrop} aria-labelledby="detail-title"><div className="dialog-body"><button id="close-detail" onClick={() => dialogRef.current.close()} className="dialog-close" aria-label="상세 정보 닫기"><iconify-icon icon="solar:close-circle-linear"></iconify-icon></button><div className="eyebrow">동네 발견 · 예시 장소</div><h2 id="detail-title">{selected?.name}</h2><p id="detail-description">{selected?.description}</p><p id="detail-distance">{selected && `${areas[selected.area].name} · 탐색 중심에서 ${formattedDistance(selected,center)} (직선거리)`}</p><p style={{"fontSize":"11px"}}>이 장소는 체험용 예시입니다. 지도에서는 예시 좌표의 주변 지역을 확인할 수 있어요.</p><a id="detail-map" href={selected ? `https://map.kakao.com/link/map/${selected.lat},${selected.lng}` : undefined} className="btn" target="_blank" rel="noopener noreferrer">주변 지역 지도 보기 <iconify-icon icon="solar:arrow-right-up-linear"></iconify-icon></a></div></dialog>

</>)
}

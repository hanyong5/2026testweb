import { useEffect, useMemo, useRef, useState } from 'react'
import { loadKakaoMaps } from '../lib/kakaoMaps'
import { areas } from './nearbyData'
import './KakaoMap.css'

export default function KakaoMap({ region, center, currentCenter, places, selected, onOpen, locate, locating }) {
  const canvas = useRef(null)
  const mapRef = useRef(null)
  const markerRefs = useRef([])
  const [mapsApi, setMapsApi] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const mapPlaces = useMemo(() => region === 'current' ? places.slice(0, 3) : places, [region, places])

  useEffect(() => {
    let active = true
    loadKakaoMaps().then(maps => { if (active) setMapsApi(maps) }).catch(() => {
      if (active) setError('지도를 불러오지 못했어요. 장소 목록은 계속 이용할 수 있습니다.')
    })
    return () => { active = false }
  }, [retry])

  useEffect(() => {
    if (!mapsApi || !canvas.current) return
    const map = new mapsApi.Map(canvas.current, { center: new mapsApi.LatLng(areas.seongsu.lat, areas.seongsu.lng), level: 4, keyboardShortcuts: true })
    mapRef.current = map
    const zoom = new mapsApi.ZoomControl()
    map.addControl(zoom, mapsApi.ControlPosition.RIGHT)
    // Page scrolling stays available; native controls still allow zooming.
    map.setZoomable(false)
    const observer = new ResizeObserver(() => {
      const previousCenter = map.getCenter()
      map.relayout()
      map.setCenter(previousCenter)
    })
    observer.observe(canvas.current)
    return () => {
      observer.disconnect()
      map.setKeyboardShortcuts(false)
      map.removeControl(zoom)
      mapRef.current = null
    }
  }, [mapsApi])

  useEffect(() => {
    const map = mapRef.current
    if (!mapsApi || !map) return
    const base = import.meta.env.BASE_URL
    const normal = new mapsApi.MarkerImage(`${base}map-place.svg`, new mapsApi.Size(36, 44), { offset: new mapsApi.Point(18, 43) })
    const active = new mapsApi.MarkerImage(`${base}map-selected.svg`, new mapsApi.Size(36, 44), { offset: new mapsApi.Point(18, 43) })
    const markers = mapPlaces.map(place => {
      const marker = new mapsApi.Marker({ map, position: new mapsApi.LatLng(place.lat, place.lng), title: `${place.name} · 예시 장소`, image: normal })
      const click = () => onOpen(place)
      mapsApi.event.addListener(marker, 'click', click)
      return { place, marker, click, normal, active }
    })
    markerRefs.current = markers
    return () => {
      markers.forEach(({ marker, click }) => { mapsApi.event.removeListener(marker, 'click', click); marker.setMap(null) })
      markerRefs.current = []
    }
  }, [mapsApi, mapPlaces, onOpen])

  useEffect(() => {
    const map = mapRef.current
    if (!mapsApi || !map || !currentCenter) return
    const position = new mapsApi.LatLng(currentCenter.lat, currentCenter.lng)
    const image = new mapsApi.MarkerImage(`${import.meta.env.BASE_URL}map-location.svg`, new mapsApi.Size(32, 32), { offset: new mapsApi.Point(16, 16) })
    const marker = new mapsApi.Marker({ map, position, image, title: '현재 위치', zIndex: 5 })
    const accuracy = currentCenter.accuracy > 0 ? new mapsApi.Circle({ map, center: position, radius: currentCenter.accuracy, strokeWeight: 1, strokeColor: '#2c78be', strokeOpacity: .5, fillColor: '#2c78be', fillOpacity: .1 }) : null
    return () => { marker.setMap(null); accuracy?.setMap(null) }
  }, [mapsApi, currentCenter])

  useEffect(() => {
    const map = mapRef.current
    if (!mapsApi || !map) return
    map.relayout()
    if (region === 'current' || !mapPlaces.length) {
      map.setLevel(4)
      map.setCenter(new mapsApi.LatLng(center.lat, center.lng))
    } else {
      const bounds = new mapsApi.LatLngBounds()
      bounds.extend(new mapsApi.LatLng(center.lat, center.lng))
      mapPlaces.forEach(place => bounds.extend(new mapsApi.LatLng(place.lat, place.lng)))
      map.setBounds(bounds, 50, 50, 50, 50)
    }
  }, [mapsApi, center, region, mapPlaces])

  useEffect(() => {
    markerRefs.current.forEach(({ place, marker, normal, active }) => {
      const isSelected = place.id === selected?.id
      marker.setImage(isSelected ? active : normal)
      marker.setZIndex(isSelected ? 3 : 1)
    })
    if (mapsApi && mapRef.current && selected) mapRef.current.panTo(new mapsApi.LatLng(selected.lat, selected.lng))
  }, [mapsApi, selected, mapPlaces])

  return <section className="kakao-map-panel" aria-label="카카오 지도 · 예시 장소와 현재 위치"><header className="kakao-map-toolbar"><span id="map-title"><iconify-icon icon="solar:map-point-linear" />{region === 'current' ? '현재 위치 기준' : `${areas[region].name} 둘러보기`}</span><button className="map-locate" type="button" onClick={locate} disabled={locating}><iconify-icon icon="solar:gps-linear" />{locating ? '확인 중…' : '현재 위치'}</button></header>
    <div className="kakao-map-stage"><div ref={canvas} className="kakao-map-canvas" tabIndex={0} aria-label="카카오 지도. 장소 목록에서도 선택할 수 있습니다." />{!mapsApi && <div className="kakao-map-status"><iconify-icon icon="solar:map-linear" /><p role={error ? 'alert' : 'status'}>{error || '카카오 지도를 불러오고 있습니다.'}</p>{error && <button type="button" onClick={() => { setError(''); setRetry(value => value + 1) }}>다시 불러오기</button>}{error && currentCenter && <a href={`https://map.kakao.com/link/map/${currentCenter.lat},${currentCenter.lng}`} target="_blank" rel="noopener noreferrer">카카오에서 현재 위치 보기 ↗</a>}</div>}</div>
    <footer className="kakao-map-legend"><span><i className="place-dot" />예시 장소</span><span><i className="location-dot" />{currentCenter ? '현재 위치' : '위치 버튼으로 확인'}{currentCenter?.accuracy > 0 && ` · 오차 약 ${Math.round(currentCenter.accuracy)}m`}</span><p>지도는 카카오 제공 · 장소는 체험용 예시입니다.</p></footer>
  </section>
}

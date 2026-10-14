let sdkPromise = null

export function loadKakaoMaps() {
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao.maps)
  if (sdkPromise) return sdkPromise
  const key = (import.meta.env.VITE_KAKAOMAP_KEY || import.meta.env.VITE_KAKAO_MAP_KEY || '').trim()
  if (!key) return Promise.reject(new Error('kakao_key_missing'))

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'kakao-maps-sdk'
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`
    const timer = setTimeout(fail, 15000)
    function cleanup() {
      clearTimeout(timer)
      script.onload = null
      script.onerror = null
    }
    function fail() {
      cleanup()
      script.remove()
      reject(new Error('kakao_sdk_unavailable'))
    }
    script.onerror = fail
    script.onload = () => {
      if (!window.kakao?.maps?.load) { fail(); return }
      window.kakao.maps.load(() => {
        if (!window.kakao.maps.Map) { fail(); return }
        cleanup()
        resolve(window.kakao.maps)
      })
    }
    document.head.appendChild(script)
  }).catch(error => { sdkPromise = null; throw error })
  return sdkPromise
}

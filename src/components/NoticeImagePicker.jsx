import { useEffect, useRef, useState } from 'react'
import { validateNoticeFiles } from '../lib/noticeImages'

export default function NoticeImagePicker({ images, onChange, disabled }) {
  const input = useRef(null)
  const previews = useRef(new Set())
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const urls = previews.current
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear() }
  }, [])

  function add(files) {
    if (disabled || !files.length) return
    const invalid = validateNoticeFiles(files, images.length)
    if (invalid) { setError(invalid); return }
    const next = files.map(file => {
      const preview = URL.createObjectURL(file)
      previews.current.add(preview)
      return { key: crypto.randomUUID(), file, preview }
    })
    onChange([...images, ...next])
    setError('')
  }

  function remove(index) {
    const image = images[index]
    if (previews.current.has(image.preview)) {
      URL.revokeObjectURL(image.preview)
      previews.current.delete(image.preview)
    }
    onChange(images.filter((_, item) => item !== index))
    setError('')
  }

  function move(index, destination) {
    const next = [...images]
    const [image] = next.splice(index, 1)
    next.splice(destination, 0, image)
    onChange(next)
  }

  return <section className="notice-image-picker" aria-labelledby="notice-images-heading"><div className="notice-images-heading"><h3 id="notice-images-heading">이미지 첨부</h3><span>{images.length} / 3장</span></div>
    <div className={`notice-dropzone${dragging ? ' is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true) }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }} onDrop={event => { event.preventDefault(); setDragging(false); add(Array.from(event.dataTransfer.files)) }}>
      <iconify-icon icon="solar:gallery-add-linear" /><p>이미지를 여기에 드래그하거나 선택해 주세요.</p><button type="button" className="notice-secondary notice-choose-images" disabled={disabled || images.length >= 3} onClick={() => input.current.click()}>이미지 선택</button><input ref={input} id="notice-images-input" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={disabled} onChange={event => { const files = Array.from(event.target.files); event.target.value = ''; add(files) }} />
      <span>JPG · PNG · WebP / 장당 5MB / 최대 3장</span>
    </div>
    <p className="auth-hint">첫 번째 이미지가 목록 썸네일입니다. 이미지는 공지 저장 시 업로드됩니다.</p>
    {error && <p className="auth-error notice-image-error" role="alert">{error}</p>}
    <ol className="notice-image-previews">{images.map((image, index) => <li key={image.key}><div className="notice-preview-frame"><img src={image.preview} alt={`첨부 이미지 ${index + 1} 미리보기`} /><span>{index === 0 ? '대표 이미지' : `${index + 1}번째 이미지`}</span></div><div className="notice-image-controls"><button type="button" disabled={disabled || index === 0} onClick={() => move(index, 0)} aria-label={`${index + 1}번째 이미지를 대표로 설정`}>대표로</button><button type="button" disabled={disabled || index === 0} onClick={() => move(index, index - 1)} aria-label={`${index + 1}번째 이미지를 앞으로 이동`}>←</button><button type="button" disabled={disabled || index === images.length - 1} onClick={() => move(index, index + 1)} aria-label={`${index + 1}번째 이미지를 뒤로 이동`}>→</button><button type="button" disabled={disabled} onClick={() => remove(index)} aria-label={`${index + 1}번째 이미지 삭제`}>삭제</button></div></li>)}</ol>
  </section>
}

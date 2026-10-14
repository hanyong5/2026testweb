import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../stores/authStore'
import { useNoticeStore } from '../stores/noticeStore'
import { NOTICE_PAGE_SIZE, noticeErrorMessage } from '../lib/notices'
import { noticeImageUrl } from '../lib/noticeImages'
import NoticeImagePicker from '../components/NoticeImagePicker'
import './NoticesPage.css'

const formatDate = value => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
const getHash = () => window.location.hash
function subscribeHash(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function closeBackdrop(event, pending = false) {
  if (pending || event.target !== event.currentTarget) return
  const rect = event.currentTarget.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close()
}

function NoticeEditor({ draft, onClose, onSaved }) {
  const save = useNoticeStore(state => state.save)
  const [title, setTitle] = useState(draft.title || '')
  const [body, setBody] = useState(draft.body || '')
  const [images, setImages] = useState(() => (draft.image_paths || []).map(path => ({ key: path, path, preview: noticeImageUrl(path) })))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)
  const dialog = useRef(null)
  const titleInput = useRef(null)
  const bodyInput = useRef(null)
  useEffect(() => { if (!dialog.current.open) dialog.current.showModal() }, [])

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const next = {}
    if (!title.trim() || title.trim().length > 120) next.title = '제목을 1~120자로 입력해 주세요.'
    if (!body.trim() || body.trim().length > 10000) next.body = '내용을 1~10,000자로 입력해 주세요.'
    setErrors(next)
    if (Object.keys(next).length) {
      setMessage('입력 내용을 확인해 주세요.')
      ;(next.title ? titleInput : bodyInput).current.focus()
      return
    }
    submitting.current = true
    setPending(true)
    setMessage('공지사항과 이미지를 저장하고 있습니다.')
    try {
      const result = await save(draft.id ?? null, title, body, images, draft.image_paths || [])
      onSaved(`${draft.id ? '공지사항을 수정했습니다.' : '공지사항을 등록했습니다.'}${result.cleanupWarning ? ` ${result.cleanupWarning}` : ''}`)
    } catch (error) {
      setMessage(noticeErrorMessage(error))
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return <dialog ref={dialog} className="notice-editor" aria-labelledby="notice-editor-title" onClose={onClose} onCancel={event => { if (pending) event.preventDefault() }} onClick={event => closeBackdrop(event, pending)}>
    <div className="dialog-body"><button type="button" className="dialog-close" aria-label="공지 편집 닫기" disabled={pending} onClick={() => dialog.current.close()}><iconify-icon icon="solar:close-circle-linear" /></button><span className="eyebrow">FOR OUR NEIGHBORS</span><h2 id="notice-editor-title">{draft.id ? '공지사항 수정' : '새 공지사항'}</h2>
      <form onSubmit={submit} noValidate aria-busy={pending}><fieldset disabled={pending}>
        <label htmlFor="notice-title">제목</label><input ref={titleInput} id="notice-title" name="title" value={title} required maxLength={120} autoFocus aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'notice-title-error' : undefined} onChange={event => { setTitle(event.target.value); setErrors(current => ({ ...current, title: '' })); setMessage('') }} />{errors.title && <span className="auth-error" id="notice-title-error">{errors.title}</span>}
        <label htmlFor="notice-body">내용</label><textarea ref={bodyInput} id="notice-body" name="body" rows={10} value={body} required maxLength={10000} aria-invalid={Boolean(errors.body)} aria-describedby={errors.body ? 'notice-body-error' : 'notice-body-hint'} onChange={event => { setBody(event.target.value); setErrors(current => ({ ...current, body: '' })); setMessage('') }} />{errors.body && <span className="auth-error" id="notice-body-error">{errors.body}</span>}<span className="auth-hint" id="notice-body-hint">일반 텍스트로 작성됩니다. 최대 10,000자.</span>
        <NoticeImagePicker images={images} onChange={setImages} disabled={pending} />
        <div className="notice-actions"><button className="btn notice-submit" type="submit" disabled={pending}>{pending ? '저장 중…' : '공지사항 저장'}</button><button className="notice-secondary" type="button" onClick={() => dialog.current.close()}>취소</button></div>
      </fieldset><p className="notice-feedback" role="status" aria-live="polite">{message}</p></form>
    </div>
  </dialog>
}

function NoticeBoard({ isAdmin, noticeId }) {
  const board = useNoticeStore(useShallow(state => ({ items: state.items, total: state.total, page: state.page, query: state.query, loading: state.loading, error: state.error, selected: state.selected, detailLoading: state.detailLoading, detailError: state.detailError, load: state.load, open: state.open, close: state.close, remove: state.remove })))
  const [search, setSearch] = useState(board.query)
  const [draft, setDraft] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const detail = useRef(null)
  const selectedId = useRef(null)
  const deletingRef = useRef(false)
  const pages = Math.max(1, Math.ceil(board.total / NOTICE_PAGE_SIZE))
  const { load, close, open: loadDetail } = board
  useEffect(() => {
    void load()
    return close
  }, [load, close])
  useEffect(() => {
    if (!noticeId) return
    selectedId.current = noticeId
    void loadDetail(noticeId)
    if (!detail.current.open) detail.current.showModal()
  }, [noticeId, loadDetail])

  function open(id) {
    selectedId.current = id
    setDeleteConfirm(false)
    setDeleteError('')
    void board.open(id)
    detail.current.showModal()
  }

  async function remove() {
    if (deletingRef.current || !board.selected) return
    const id = board.selected.id
    deletingRef.current = true
    setDeleting(true)
    try {
      const result = await board.remove(id)
      detail.current.close()
      setFeedback(`공지사항을 삭제했습니다.${result.cleanupWarning ? ` ${result.cleanupWarning}` : ''}`)
      void board.load()
    } catch (error) {
      setDeleteError(noticeErrorMessage(error))
    } finally {
      deletingRef.current = false
      setDeleting(false)
    }
  }

  return <div className="shell subpage notices-page">
    <header className="page-intro"><div className="breadcrumb"><a href="#/">홈</a><span aria-hidden="true">/</span><span>공지사항</span></div><span className="eyebrow">NEIGHBORHOOD UPDATES</span><h1>공지사항</h1><p>나의이웃의 새로운 소식과 이용 안내를 전합니다.</p></header>
    <div className="notice-toolbar"><form role="search" onSubmit={event => { event.preventDefault(); setFeedback(''); void board.load(1, search) }}><label className="search"><iconify-icon icon="solar:magnifer-linear" /><input type="search" aria-label="공지사항 제목 검색" placeholder="공지 제목을 검색해 보세요" value={search} onChange={event => setSearch(event.target.value)} /></label><button className="notice-secondary" type="submit" disabled={board.loading}>검색</button></form>{isAdmin && <button className="btn notice-write" type="button" onClick={() => setDraft({})}><iconify-icon icon="solar:pen-new-square-linear" />공지 작성</button>}</div>
    <p className="notice-feedback" role="status" aria-live="polite">{feedback}</p>
    <div className="notice-list" aria-busy={board.loading}>
      {board.loading ? <p className="empty" role="status">공지사항을 불러오고 있습니다.</p> : board.error ? <div className="empty"><p role="alert">{board.error}</p><button className="notice-secondary" onClick={() => void board.load()}>다시 불러오기</button></div> : <><p className="notice-count">총 {board.total}개의 공지사항</p>{board.items.length ? board.items.map(notice => <button className="post-row notice-row" key={notice.id} onClick={() => open(notice.id)}><span className="notice-thumbnail">{notice.image_paths?.[0] ? <img src={noticeImageUrl(notice.image_paths[0])} alt="" loading="lazy" /> : <iconify-icon icon="solar:document-text-linear" />}</span><span className="post-category">공지</span><span className="post-title">{notice.title}</span><time className="post-meta" dateTime={notice.created_at}>{formatDate(notice.created_at)}</time><iconify-icon icon="solar:arrow-right-up-linear" /></button>) : <p className="empty">{board.query ? '검색 결과가 없습니다. 다른 제목으로 검색해 주세요.' : '아직 등록된 공지사항이 없습니다.'}</p>}</>}
    </div>
    <nav className="notice-pagination" aria-label="공지사항 페이지"><button className="notice-secondary" disabled={board.loading || board.page <= 1} onClick={() => void board.load(board.page - 1)}>이전</button><span aria-live="polite">{board.page} / {pages}</span><button className="notice-secondary" disabled={board.loading || board.page >= pages} onClick={() => void board.load(board.page + 1)}>다음</button></nav>
    <dialog ref={detail} className="community-dialog notice-detail" aria-labelledby="notice-detail-title" onClose={() => { board.close(); setDeleteConfirm(false); if (noticeId && window.location.hash.startsWith('#/notices?') && new URLSearchParams(window.location.hash.split('?')[1]).get('notice') === noticeId) window.location.hash = '#/notices' }} onCancel={event => { if (deleting) event.preventDefault() }} onClick={event => closeBackdrop(event, deleting)}><div className="dialog-body"><button className="dialog-close" aria-label="공지사항 닫기" disabled={deleting} onClick={() => detail.current.close()}><iconify-icon icon="solar:close-circle-linear" /></button><span className="eyebrow">NOTICE</span><h2 id="notice-detail-title">{board.selected?.title || '공지사항'}</h2>
      {board.detailLoading ? <p role="status">내용을 불러오고 있습니다.</p> : board.detailError ? <><p role="alert">{board.detailError}</p><button className="notice-secondary" onClick={() => void board.open(selectedId.current)}>다시 불러오기</button></> : board.selected && <><p className="notice-date">등록 {formatDate(board.selected.created_at)}{board.selected.updated_at !== board.selected.created_at && ` · 수정 ${formatDate(board.selected.updated_at)}`}</p><p className="notice-body">{board.selected.body}</p><div className="notice-image-gallery">{(board.selected.image_paths || []).map((path, index) => <img key={path} src={noticeImageUrl(path)} alt={`${board.selected.title} - ${index + 1}`} loading="lazy" />)}</div>{isAdmin && <div className="notice-management">{deleteConfirm === board.selected.id ? <><p>이 공지사항을 삭제할까요? 삭제한 글은 복원할 수 없습니다.</p><div className="notice-actions"><button className="notice-danger notice-confirm-delete" disabled={deleting} onClick={remove}>{deleting ? '삭제 중…' : '삭제 확인'}</button><button className="notice-secondary" disabled={deleting} onClick={() => { setDeleteConfirm(false); setDeleteError('') }}>취소</button></div></> : <div className="notice-actions"><button className="notice-secondary notice-edit" onClick={() => { const current = board.selected; detail.current.close(); setDraft(current) }}>수정</button><button className="notice-danger notice-delete" onClick={() => setDeleteConfirm(board.selected.id)}>삭제</button></div>}{deleteError && <p className="auth-error" role="alert">{deleteError}</p>}</div>}</>}
    </div></dialog>
    {draft && isAdmin && <NoticeEditor draft={draft} onClose={() => setDraft(null)} onSaved={message => { setDraft(null); setFeedback(message); setSearch(''); void board.load(1, '') }} />}
  </div>
}

export default function NoticesPage() {
  const hash = useSyncExternalStore(subscribeHash, getHash)
  const requestedId = new URLSearchParams(hash.split('?')[1] || '').get('notice')
  const noticeId = requestedId && /^[1-9]\d{0,18}$/.test(requestedId) ? requestedId : null
  const userId = useAuthStore(state => state.user?.id ?? 'guest')
  const isAdmin = useAuthStore(state => state.role === 'admin')
  return <NoticeBoard key={userId} isAdmin={isAdmin} noticeId={noticeId} />
}

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useRecentNoticeStore } from '../stores/recentNoticeStore'
import { noticeImageUrl } from '../lib/noticeImages'
import './RecentNotices.css'

const formatDate = value => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))

export default function RecentNotices() {
  const { items, loading, error, load } = useRecentNoticeStore(useShallow(state => ({ items: state.items, loading: state.loading, error: state.error, load: state.load })))
  useEffect(() => { void load() }, [load])

  return <section className="shell section recent-notices" id="recent-notices" aria-labelledby="recent-notices-title"><div className="section-head"><div><span className="eyebrow">NEWS FROM YOUR NEIGHBORHOOD</span><h2 id="recent-notices-title">나의이웃의 새로운 소식</h2><p className="subcopy">가까운 일상에 더해지는 소식과 이용 안내를 만나보세요.</p></div><a className="text-link recent-notices-all" href="#/notices">공지사항 전체 보기 <iconify-icon icon="solar:arrow-right-linear" /></a></div>
    <div aria-busy={loading}>
      {loading ? <><p className="sr-only" role="status">최근 공지사항을 불러오고 있습니다.</p><div className="recent-notice-grid" aria-hidden="true">{[0, 1, 2].map(item => <div className="recent-notice-skeleton" key={item}><div /><span /><span /></div>)}</div></>
        : error ? <div className="empty"><p role="alert">{error}</p><button className="btn btn-outline recent-notice-retry" type="button" onClick={() => void load()}>다시 불러오기</button></div>
          : !items.length ? <p className="empty">아직 등록된 공지사항이 없습니다.</p>
            : <div className="recent-notice-grid">{items.map(notice => <article className="recent-notice-card" key={notice.id}><a href={`#/notices?notice=${encodeURIComponent(notice.id)}`} aria-label={`${notice.title} 공지사항 읽기`}><div className="recent-notice-image">{notice.image_paths?.[0] ? <img src={noticeImageUrl(notice.image_paths[0])} alt="" loading="lazy" decoding="async" /> : <div className="recent-notice-placeholder"><iconify-icon icon="solar:document-text-linear" /><span>나의이웃 소식</span></div>}<span className="recent-notice-label">공지사항</span></div><div className="recent-notice-copy"><h3>{notice.title}</h3><div><time dateTime={notice.created_at}>{formatDate(notice.created_at)}</time><span className="recent-notice-arrow" aria-hidden="true"><iconify-icon icon="solar:arrow-right-linear" /></span></div></div></a></article>)}</div>}
    </div>
  </section>
}

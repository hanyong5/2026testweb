import { useRef, useState } from 'react'

function PageIntro({ eyebrow, title, children }) {
  return <div className="page-intro"><div className="breadcrumb"><a href="#/">홈</a><span aria-hidden="true">/</span><span>{title}</span></div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{children}</p></div>
}

const features = [
  { icon: 'map-point', title: '가까운 곳부터 발견', text: '성수동, 연남동, 전포동을 골라 살펴보거나 현재 위치를 기준으로 예시 장소를 가까운 순서로 만나보세요.' },
  { icon: 'magnifer', title: '오늘의 취향으로 검색', text: '카페, 산책, 문화 공간을 선택하고 이름이나 키워드로 원하는 장소를 좁혀보세요.' },
  { icon: 'bookmark', title: '마음에 든 장소 저장', text: '다음에 가고 싶은 장소에 북마크를 남기세요. 같은 브라우저에서 다시 꺼내볼 수 있어요.' },
]

export function AboutPage() {
  return <div className="shell subpage">
    <PageIntro eyebrow="ABOUT US" title="회사소개">익숙한 동네에 새로운 가능성을 더하는 서비스, 나의이웃을 소개합니다.</PageIntro>
    <section className="about-story" aria-labelledby="about-title"><div className="about-photo"><img src="https://picsum.photos/seed/gyeot-local-walk/1000/850" alt="동네 산책의 분위기를 보여주는 예시 풍경" /><span>OUR NEIGHBORHOOD, OUR EVERYDAY</span></div><div><span className="eyebrow">OUR VISION</span><h2 id="about-title">더 멀리보다,<br />더 가까이 들여다봅니다.</h2><p>새로운 경험은 꼭 먼 곳에만 있지 않습니다. 매일 지나던 골목의 작은 카페, 잠깐 쉬어갈 수 있는 산책길, 취향을 나눌 수 있는 문화 공간에도 발견의 기회가 있습니다.</p><p>나의이웃은 동네를 둘러보는 과정을 가볍게 만들고, 일상 가까운 공간에 관심을 갖는 경험을 제안합니다.</p><a className="text-link" href="#/products">서비스 자세히 보기 →</a></div></section>
    <section className="page-section" aria-labelledby="values-title"><div className="eyebrow">WHAT WE VALUE</div><h2 id="values-title">우리가 중요하게 생각하는 것</h2><div className="value-grid">{[['01','가까움','지금 있는 곳과 익숙한 생활 반경에서 새로운 경험의 출발점을 찾습니다.'],['02','발견','검색 조건과 간결한 정보로 나에게 맞는 공간을 스스로 고르도록 돕습니다.'],['03','배려','가입 없이 둘러보고, 위치는 필요할 때만 사용하며, 저장 여부는 사용자가 결정합니다.']].map(([n,title,text]) => <article className="value-card" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <aside className="page-callout"><div><h2>동네의 다음 이야기를 함께 만들어요.</h2><p>서비스 의견이나 협업 아이디어를 문의서에 담아주세요.</p></div><a className="btn" href="#/contact">온라인문의 →</a></aside>
  </div>
}

export function ProductsPage() {
  return <div className="shell subpage">
    <PageIntro eyebrow="OUR PRODUCT" title="제품소개">동네를 고르고, 취향을 찾고, 마음에 드는 곳을 저장하는 작은 탐색 도구입니다.</PageIntro>
    <section className="product-showcase" aria-labelledby="product-title"><div><span className="eyebrow">LOCAL DISCOVERY</span><h2 id="product-title">내 일상에 맞는<br />동네 발견 서비스</h2><p>복잡한 계획 없이 가까운 곳부터 살펴보세요. 나의이웃의 장소 탐색 데모에서 세 지역의 카페, 산책길, 문화 공간을 만나볼 수 있습니다.</p><a className="btn" href="#discover">지금 체험하기 <iconify-icon icon="solar:arrow-right-linear" /></a></div><div className="product-preview"><span className="product-preview-label">이렇게 둘러보세요</span>{features.map((feature,index) => <div className="preview-row" key={feature.title}><span className="round-icon"><iconify-icon icon={`solar:${feature.icon}-linear`} /></span><div><small>STEP 0{index+1}</small><strong>{feature.title}</strong></div><span aria-hidden="true">↗</span></div>)}</div></section>
    <section className="page-section" aria-labelledby="features-title"><div className="eyebrow">SIMPLE BY DESIGN</div><h2 id="features-title">탐색에 필요한 것만, 간결하게.</h2><div className="value-grid">{features.map(feature => <article className="value-card" key={feature.title}><iconify-icon icon={`solar:${feature.icon}-linear`} /><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>
    <section className="product-scope" aria-labelledby="scope-title"><h2 id="scope-title">체험 전에 확인해 주세요</h2><dl><div><dt>탐색 지역</dt><dd>서울 성수동 · 서울 연남동 · 부산 전포동</dd></div><div><dt>장소 구성</dt><dd>각 지역 카페·산책·문화 공간 3개, 전체 9개 예시</dd></div><div><dt>거리와 지도</dt><dd>좌표 기반 직선거리와 개념도이며 실제 도보 경로가 아닙니다.</dd></div><div><dt>저장 방식</dt><dd>북마크는 현재 브라우저에 저장됩니다. 위치 좌표는 영구 저장하지 않습니다.</dd></div></dl><p className="subcopy">실시간 매장 정보, 영업 여부, 계정 간 동기화는 제공하지 않는 체험용 서비스입니다.</p></section>
  </div>
}

export function ContactPage() {
  const [result, setResult] = useState('')
  const [inquiry, setInquiry] = useState(null)
  function prepare(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const values = Object.fromEntries(['type','name','email','subject','message'].map(key => [key,String(fields.get(key) || '').trim()]))
    if (Object.values(values).some(value => !value)) {
      setResult('공백만 입력할 수 없습니다. 모든 필수 항목을 확인해 주세요.')
      setInquiry(null)
      return
    }
    const content = `나의이웃 문의서\n\n문의 유형: ${values.type}\n이름: ${values.name}\n이메일: ${values.email}\n제목: ${values.subject}\n\n${values.message}\n\n이 문서는 다운로드용 문의서이며 서버로 접수되지 않았습니다.\n`
    setInquiry('data:text/plain;charset=utf-8,' + encodeURIComponent('\uFEFF' + content))
    setResult('문의서가 준비되었습니다. 아래 버튼으로 내려받으세요. 온라인 접수는 아직 제공하지 않습니다.')
  }
  return <div className="shell subpage">
    <PageIntro eyebrow="CONTACT US" title="온라인문의">서비스에 대한 궁금한 점과 함께 만들고 싶은 아이디어를 들려주세요.</PageIntro>
    <div className="contact-layout"><aside className="contact-aside"><span className="eyebrow">LET’S TALK</span><h2>작은 의견도<br />소중하게 담아요.</h2><p>서비스 이용 의견, 공간 소개, 협업 제안 등 문의 목적에 맞춰 내용을 작성해 주세요.</p><div className="contact-notice"><iconify-icon icon="solar:document-text-linear" /><h3>문의서 작성 안내</h3><p>현재는 문의서를 파일로 만드는 체험 화면입니다. 작성 내용은 서버에 전송하거나 브라우저 저장소에 보관하지 않습니다. 페이지를 떠나면 입력 내용은 초기화됩니다.</p></div></aside>
      <form className="inquiry-form" onSubmit={prepare} onChange={() => { setInquiry(null); setResult('') }}>
        <div className="form-heading"><h2>문의 내용 작성</h2><span>모든 항목은 필수입니다.</span></div>
        <label>문의 유형<select name="type" required defaultValue=""><option value="" disabled>문의 유형을 선택해 주세요</option><option>서비스 이용</option><option>공간 소개</option><option>제휴·협업</option><option>기타</option></select></label>
        <div className="form-row"><label>이름<input name="name" autoComplete="name" required maxLength={60} placeholder="이름을 입력해 주세요" /></label><label>이메일<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="example@email.com" /></label></div>
        <label>제목<input name="subject" required maxLength={120} placeholder="문의 제목을 입력해 주세요" /></label>
        <label>문의 내용<textarea name="message" required rows={7} maxLength={5000} placeholder="문의하실 내용을 자세히 작성해 주세요. (최대 5,000자)" /></label>
        <label className="consent"><input name="acknowledge" type="checkbox" required />문의 내용이 서버에 접수되지 않고 다운로드용 파일로 만들어지는 점을 확인했습니다.</label>
        <button className="btn" type="submit">문의서 만들기 <iconify-icon icon="solar:arrow-right-linear" /></button>
        <p className="status" role="status" aria-live="polite">{result}</p>
        {inquiry && <a className="btn btn-outline" href={inquiry} download="나의이웃-문의서.txt">문의서 다운로드</a>}
      </form></div>
  </div>
}

const posts = [
  { id: 1, category: '공지사항', title: '나의이웃 체험 페이지를 소개합니다', date: '서비스 안내', body: '나의이웃은 일상 가까운 공간을 발견하는 서비스 데모입니다. 홈 화면에서 지역을 고르고, 유형이나 키워드로 예시 장소를 살펴보세요. 장소와 사진은 예시이며 실제 매장 정보가 아닙니다.' },
  { id: 2, category: '이용가이드', title: '마음에 드는 장소를 북마크로 모아보세요', date: '저장 가이드', body: '장소 카드 오른쪽의 북마크 버튼을 누르면 저장할 수 있습니다. 저장한 곳 필터로 모아보고, 다시 버튼을 누르면 해제됩니다. 같은 브라우저에서 유지되며 브라우저 데이터를 삭제하면 초기화됩니다. 지역 필터도 함께 적용되니 다른 지역에 저장한 장소는 지역을 바꿔 확인해 주세요.' },
  { id: 3, category: '동네이야기', title: '늘 걷던 길을 새롭게 바라보는 세 가지 방법', date: '산책 노트', body: '첫째, 평소와 다른 골목으로 한 블록만 돌아보세요. 둘째, 잠시 멈춰 주변의 작은 공간을 관찰해 보세요. 셋째, 마음에 드는 곳을 기록해 두세요. 멀리 떠나지 않아도 일상에서 새로운 장면을 만날 수 있습니다.' },
  { id: 4, category: '이용가이드', title: '현재 위치와 거리 표시는 어떻게 사용하나요?', date: '위치 가이드', body: '홈 화면의 내 주변 발견하기 버튼을 누르면 브라우저가 위치 권한을 요청합니다. 허용하면 전체 예시 장소를 현재 위치에서 가까운 순서로 표시합니다. 거리는 직선거리이며 실제 도보 거리나 실시간 주변 매장 검색 결과가 아닙니다. 권한을 허용하지 않아도 지역을 직접 골라 사용할 수 있습니다.' },
]

export function CommunityPage() {
  const [category,setCategory] = useState('전체')
  const [query,setQuery] = useState('')
  const [selected,setSelected] = useState(null)
  const dialogRef = useRef(null)
  const visible = posts.filter(post => (category === '전체' || post.category === category) && (post.title + post.body).includes(query.trim()))
  return <div className="shell subpage">
    <PageIntro eyebrow="COMMUNITY" title="커뮤니티">서비스 소식과 이용 방법, 동네를 즐기는 작은 이야기를 모았습니다.</PageIntro>
    <p className="subcopy">운영 공지는 <a className="text-link" href="#/notices">공지사항 게시판 →</a>에서 확인할 수 있습니다.</p>
    <div className="community-toolbar"><div className="filters" role="group" aria-label="게시물 분류">{['전체','공지사항','이용가이드','동네이야기'].map(label => <button className={`filter${category === label ? ' active' : ''}`} key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}</div><label className="search"><iconify-icon icon="solar:magnifer-linear" /><input type="search" aria-label="커뮤니티 게시물 검색" value={query} onChange={event => setQuery(event.target.value)} placeholder="이야기를 검색해 보세요" /></label></div>
    <p className="subcopy">총 {visible.length}개의 이야기 · 아래 게시물은 체험용 예시 콘텐츠입니다.</p>
    <div className="post-list" aria-live="polite">{visible.length ? visible.map(post => <button className="post-row" key={post.id} onClick={() => { setSelected(post); dialogRef.current.showModal() }}><span className="post-category">{post.category}</span><span className="post-title">{post.title}</span><span className="post-meta">{post.date}</span><iconify-icon icon="solar:arrow-right-up-linear" /></button>) : <div className="empty">검색 결과가 없습니다. 다른 검색어나 분류를 선택해 주세요.</div>}</div>
    <aside className="page-callout"><div><h2>나누고 싶은 동네 이야기가 있나요?</h2><p>온라인문의에서 공간 소개와 서비스 의견을 작성할 수 있습니다.</p></div><a className="btn" href="#/contact">의견 작성하기 →</a></aside>
    <dialog className="community-dialog" ref={dialogRef} aria-labelledby="post-title" onClick={event => {
      if (event.target !== event.currentTarget) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close()
    }}><div className="dialog-body"><button className="dialog-close" aria-label="게시물 닫기" onClick={() => dialogRef.current.close()}><iconify-icon icon="solar:close-circle-linear" /></button><span className="eyebrow">{selected?.category}</span><h2 id="post-title">{selected?.title}</h2><p>{selected?.body}</p><span className="subcopy">나의이웃 · 체험용 예시 콘텐츠</span></div></dialog>
  </div>
}

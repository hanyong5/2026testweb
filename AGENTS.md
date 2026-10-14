# 프로젝트 작업 지침

## 프로젝트와 문서

이 프로젝트는 동네의 카페, 산책길, 문화 공간을 탐색하는 한국어 웹 데모 **나의이웃** 이다. React와 Vite를 사용한다.

- 기능 범위와 인수 기준: [REQUIREMENTS.md](./REQUIREMENTS.md)
- 화면 구성과 시각 규칙: [DESIGN.md](./DESIGN.md)
- 이 지침은 저장소 전체에 적용한다. 사용자의 명시적 요청을 우선한다.

## 구현 구조

- `src/main.jsx`: React 진입점, StrictMode 적용.
- `src/App.jsx`: 해시 기반 페이지 전환과 공통 헤더·푸터. 홈에서는 `Nearby`를 렌더링한다.
- `src/pages/SitePages.jsx`, `SitePages.css`: 회사소개·제품소개·온라인문의·커뮤니티 페이지와 스타일.
- `src/pages/AuthPages.jsx`, `AuthPages.css`: 로그인·회원가입 화면, 입력 검증, 회원 메뉴 스타일.
- `src/pages/MyPage.jsx`, `MyPage.css`: 본인 회원 정보 수정, 아바타 생성·미리보기·저장.
- `src/pages/NoticesPage.jsx`, `NoticesPage.css`: 공개 공지 목록·검색·페이지 이동·상세 및 관리자 작성·수정·삭제. `src/lib/notices.js`, `src/stores/noticeStore.js`: 서버 요청과 Zustand 공지 상태.
- `src/components/NoticeImagePicker.jsx`, `src/lib/noticeImages.js`: 공지 이미지 최대 3장 선택·드래그·미리보기·순서 및 Storage 업로드·정리. 첫 이미지가 목록 썸네일이다.
- `src/lib/supabase.js`, `useAuth.js`: Supabase Auth와 회원 프로필 조회·수정. `src/components/Avatar.jsx`, `src/lib/avatar.js`: SVG 아바타 표시와 설정 생성.
- `src/stores/authStore.js`, `nearbyStore.js`, `uiStore.js`: Zustand 기반 인증·회원 정보, 탐색·위치·북마크, 메뉴·슬라이드 공통 상태. `useAuth`는 Auth 구독 수명만 관리한다. 화면 전용 입력·검증 상태는 React로 관리한다.
- `src/components/Nearby.jsx`: 탐색 화면, 장소 카드, 검색·필터·저장·위치·상세창 동작.
- `src/components/Nearby.css`: 화면 스타일, 반응형 규칙, 모션.
- `src/components/KakaoMap.jsx`, `KakaoMap.css`, `src/lib/kakaoMaps.js`: 카카오 지도 SDK 로딩·지역/장소 마커·현재 위치와 정확도·실패 안내. 전용 지도 컨테이너 내부는 SDK가 관리한다.
- `src/components/HeroSlider.jsx`, `HeroSlider.css`: 히어로 슬라이더와 전용 스타일. React 상태로 전환하고 모바일 스와이프를 지원한다.
- `src/components/RecentNotices.jsx`, `RecentNotices.css`: 홈의 최근 공지 최대 3개 카드와 상세 링크. `src/stores/recentNoticeStore.js`는 게시판 검색 상태와 별도로 최신 공지를 관리한다.
- `src/components/nearbyData.js`: 지역과 예시 장소 데이터.
- `index.html`: 문서 메타데이터, Pretendard 및 Iconify 외부 리소스.
- `public/nearby.html`: 전환 전 정적 원본이다. 현재 앱의 화면 진입점으로 사용하지 않는다.
- `Webview.jsx`, `SubCom01.jsx`는 현재 화면에 연결되지 않은 기존 컴포넌트다.

## 작업 원칙

- 화면은 React 컴포넌트로 구현한다. iframe으로 페이지를 감싸는 구조를 다시 도입하지 않는다.
- 상태와 이벤트는 React로 관리한다. 화면 생성에 `innerHTML`이나 수동 DOM 조립을 사용하지 않는다. 포커스, 스크롤, 네이티브 dialog 제어에는 DOM API를 사용할 수 있다.
- 공통 상태는 Zustand 스토어와 선택자로 관리한다. 인증·프로필·현재 위치에 Zustand persist를 적용하지 않는다. 로그인 유지용 세션 저장·복원·갱신은 Supabase SDK가 담당한다. 현재 위치는 브라우저 저장소에 저장하지 않으며 북마크는 기존 저장 규칙을 따른다.
- 회원 역할은 `profiles.role`의 `admin`·`user`로 구분한다. 보호된 서버 값을 기준으로 하며 이메일·사용자 메타데이터·클라이언트 상태만으로 권한을 부여하지 않는다. 일반 회원이 역할을 등록·수정하지 못하도록 컬럼 권한을 유지한다.
- 공지사항은 공개 읽기를 허용하고 작성·수정·삭제는 DB의 관리자 RLS로 제한한다. 본문은 일반 텍스트로 렌더링하며 서버 성공 이후에만 완료를 표시한다.
- 공지 이미지는 JPG·PNG·WebP 최대 3장·장당 5MB로 제한한다. 파일 작업은 Storage API만 사용하며 참조 중인 파일을 삭제하지 않는다. 저장 실패 시 신규 업로드 정리를 시도하고 미리보기를 유지한다. blob URL은 삭제·취소·종료 시 해제한다.
- 기존 한국어 문구와 UTF-8 인코딩을 유지한다.
- 기존 CSS 변수와 반응형 규칙을 우선 활용한다. 현재 앱은 Tailwind 런타임을 사용하지 않는다.
- 지도는 카카오 제공 지형이며 장소는 예시 데이터다. 실시간 매장 정보나 실제 도보 거리로 표현하지 않는다. React 화면을 HTML 문자열이나 수동 DOM으로 생성하지 않으며 SDK 지도만 전용 컨테이너에서 관리한다.
- 현재 위치 좌표·정확도는 메모리에만 유지한다. 카카오 지도 표시를 위한 SDK 통신 외에 별도 앱 서버 전송·영구 저장을 추가하지 않는다. 위치 버튼을 누를 때만 권한을 요청한다.
- 북마크는 `gyeot-saved` 키에 장소 ID 배열로 저장하며, 저장소 오류에도 탐색이 가능해야 한다.
- 페이지 주소는 `#/`, `#/about`, `#/products`, `#/contact`, `#/community`, `#/notices`다. 홈 섹션 링크(`#discover` 등)와의 호환을 유지한다.
- 온라인문의는 파일 생성·다운로드 방식이다. 실제 서버 접수나 메일 발송 없이 접수 완료로 표시하지 않는다. 문의 입력은 영구 저장하지 않는다.
- 회원 화면 주소는 `#/login`, `#/signup`, `#/mypage`다. Supabase Auth로 가입·로그인하며 SDK의 세션 영구 저장·자동 갱신으로 로그인을 유지한다. 로그아웃 시 저장 세션과 Zustand 회원 상태를 제거한다. 비밀번호를 브라우저 저장소나 코드·로그에 저장하지 않는다. 프로필은 본인 행만 접근하는 RLS를 유지하고 이름·아바타 설정만 수정한다.
- 사용자의 기존 변경을 보존한다. 요청과 관계없는 코드 정리, 의존성 추가, 파일 삭제를 피한다.
- 기능이나 디자인을 변경하면 관련 문서를 함께 갱신한다. 계획과 구현 완료 상태를 구분한다.

## 실행과 검증

```sh
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

PowerShell에서 `npm.ps1` 실행 정책 오류가 발생하면 `npm.cmd` 또는 `npx.cmd`를 사용한다.

- 코드 변경 후 빌드와 변경 범위의 ESLint 검사를 실행한다.
- 전체 린트 실패 시 기존 오류와 이번 변경의 오류를 구분해 보고한다. 기존 미사용 `React` import 오류가 `Webview.jsx`, `SubCom01.jsx`에 알려져 있으므로 현재 상태를 재확인한다.
- UI 변경 시 데스크톱과 모바일 레이아웃, 키보드 조작, 필터·검색·저장·상세창을 확인한다. 위치 기능 변경 시 권한 거부와 실패 상태도 확인한다.
- 문서만 변경했다면 링크, 파일 경로, 실제 구현과의 일치 여부를 확인한다. 불필요한 빌드나 테스트는 실행하지 않는다.
- 완료 보고에는 변경 내용, 수행한 검증, 남은 제한을 간결하게 기록한다.

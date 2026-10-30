# 홈페이지 디자인 시스템

기존 섹션 순서, 앵커, 문구, 프로젝트 수를 유지한다. 새로운 프로젝트 콘텐츠는 추가하지 않는다.

## 소스
- style.css: 디자인 토큰, 기본 요소, Hero, 목차, 경력, 프로젝트 목록·상세, 위치 내비게이션, 반응형, reduced-motion 순서.
- index.html: 중첩 nav/grid 제거, 목차 제목을 h2로 정리, script.js 중복 로딩 제거.
- script.js / hero-motion.js: 기존 코드 유지.

## 토큰
- 색상: --color-background #FFFFFF / --color-text #111827 / --color-text-secondary #667085 / --color-primary #17243A / --color-border #EAECF0 / --color-section #F8FAFC.
- 글꼴: 한국어 Sans-serif 로컬 폰트 스택. 외부 폰트 다운로드 없음.
- 크기: Hero 데스크톱 56–72px, 섹션 제목 32–44px, 본문 16–18px. clamp와 rem 사용.
- 간격: --space-xs 8px, sm 16px, md 24px, lg 32px, xl 48px, 2xl 64px, 3xl 96px, 4xl 128px.
- 콘텐츠: --container-width 1280px, 중앙 정렬.
- 섹션 내부 상하 여백: 데스크톱 120–160px, 태블릿 96px, 모바일 72–96px.
- 모서리: 버튼과 위치 내비게이션에만 6px. 카드형 배경, 그림자, 그라데이션 없음.

## 반응형
- 1024px 이상: Hero 58:42, 목차 2열, 프로젝트·상세 정보 2열.
- 768–1023px: Hero 2열, 목차와 미리보기 세로 배치, 하단 위치 내비게이션.
- 767px 이하: Hero 이미지 하단, 목차·프로젝트·상세 1열.
- 359px 이하: 미리보기 타일도 1열.

## 인터랙션과 접근성
- 목차 hover/focus 미리보기와 섹션 앵커 이동 유지.
- Hero floating 7초/8px, mouse parallax 최대 약 10px, scroll parallax 최대 18px 유지.
- reduced-motion에서 Hero 효과, 커서 점멸, CSS transition, CSS smooth scroll 제거.
- 키보드 focus-visible, 링크 밑줄 활성 상태, 최소 44px 내비게이션 클릭 영역.

## 검증
- 1440 / 768 / 390 / 320px 브라우저 확인.
- 가로 스크롤, 제목·본문·타일 넘침, 프로젝트 겹침 없음.
- 이미지 프레임 6:5 비율 유지, 실제 이미지 스타일 object-fit: cover.
- 기존 텍스트, ID, 섹션 순서, JavaScript 파일 내용 보존 검사 통과.

## 2026-10-29 Typography & Spacing Final Polish (현재 멀티페이지 기준)

이 절은 위 초기 단일 페이지/이미지 Hero 설명보다 우선한다. 현재 파일 구조와 Night Sky Hero는 MULTIPAGE.md, STAR_JOURNEY.md 및 실제 HTML/CSS를 따른다.

### Type hierarchy
- Display: 기존 홈 Hero의 반응형 크기·500 weight·문장 단위 줄바꿈 유지.
- Page title: --font-page-title, clamp(2rem, 4.2vw, 3.75rem). 공통 detail-intro h1에만 적용.
- Case introduction title: --font-case-title, clamp(2rem, 3.1vw, 2.75rem). NEON/UNDECEMBER/TALES RUNNER/DME 내부 프로젝트명. Slime은 2줄 편집형 구성과 40–64px 차등 크기 유지.
- Section: 기존 --font-section (32–44px) 및 프로젝트별 섹션 역할 유지. 모든 h2/h4를 같은 크기로 만들지 않는다.
- Subsection: 기존 --font-subheading 및 프로젝트별 18–28px 보조 제목 유지.
- Body large: --font-body-large, 18–20px. About 소개에 사용.
- Body: 기존 --font-body 16–18px, --line-body 1.85. 로컬 폰트 스택 유지, 외부 폰트 설치 없음.
- Caption: --font-caption 14px. 목차/NEON 캡션/DME 도표 헤더 등 보조 읽기 요소.
- Label: --font-label 14px, 기본 weight 600, tracking .02em. 제품명과 실제 용어의 표기는 바꾸지 않는다.
- 기본 heading weight 700, --line-heading 1.35. Hero의 명시된 500 weight는 유지.

### Spatial rhythm
- 공통 상세 상단: main 120px, intro 상단 40px/하단 48px, breadcrumbs 다음 32px. 모바일 기존 상단 예외 유지.
- --space-connected 56px: NEON/UNDECEMBER의 연속된 내용 구간. 기존 모바일 48px 예외 유지.
- --space-transition 64px: Tales Runner의 운영 사례에서 21주년 기획으로 전환.
- NEON figure-caption 간격 16px. Caption 이후 큰 내용 전환은 기존 섹션 여백 유지.
- --measure-reading 46rem: 공통 페이지 소개 문장. 본문·타임라인·도표는 각 역할의 기존 폭을 유지.
- Closing 제목을 --font-section 크기로 낮춰 두 번째 Hero처럼 보이지 않도록 함.
- Career의 밝은 문서 배경에서는 보조 역할 설명에 --color-text-secondary 사용.

### 검증 범위
12페이지를 1440 / 1280 / 768 / 390에서 렌더링. 결과·마무리 구간과 TOC/최상단 이동, 별·Header·CTA·프로젝트 Hub·모바일 메뉴·Contact 링크 검증. Reduced Motion은 CSS/matchMedia를 강제한 검수 fixture에서 확인했으며 OS 설정을 바꾼 테스트는 아니다.

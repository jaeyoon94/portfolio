# 포트폴리오 사이트 작업 안내

PM 박재윤의 정적 멀티페이지 포트폴리오. Vercel이 커밋된 정적 파일을 그대로 서빙한다.

## 구조와 빌드

- 페이지 내용의 원본은 `content/portfolio-source.html`이다. 경력은 `content/career-history.json`, 프로젝트 커버는 `content/project-covers.json`, 상세 소개는 `content/project-introductions.json`에 있다.
- 루트의 `*.html`은 생성 결과물이다. 내용을 바꿀 때는 원본을 고친 뒤 빌드하고 검증한다.
  - `node scripts/build-pages.cjs`
  - `node scripts/verify-pages.cjs`
- 자세한 내용은 `MULTIPAGE.md`, 디자인 규칙은 `DESIGN_SYSTEM.md`를 본다.

## 스킬 사용 규칙

사용자가 `/명령어`를 입력하지 않아도, 요청 내용에 맞는 스킬을 스스로 골라 먼저 불러 쓴다. 여러 개가 맞으면 함께 쓴다. 어떤 스킬을 썼는지는 답변에 한 줄로 밝힌다.

| 요청 내용 | 스킬 |
| --- | --- |
| 페이지 다듬기·고도화·디자인 개선, "AI 같아/촌스러워" | `polish-page` |
| 화면·디자인 피드백, "어때 보여?" | `design:design-critique` |
| 접근성·대비·키보드 점검 | `design:accessibility-review` |
| 버튼·안내 문구·에러 문구 작성이나 검토 | `design:ux-copy` |
| 색·간격·컴포넌트 규칙의 일관성 점검 | `design:design-system` |
| 차트·그래프·대시보드·KPI (예: `the-k.html`, `dashboard.html`) | `dataviz` |
| 사이트를 띄워서 확인, 스크린샷 | `run` |
| 코드 변경 마무리, 커밋 전 점검 | `code-review` (low) |
| 중복·불필요한 코드 정리 | `simplify` |
| PDF·PPTX 포트폴리오 파일 읽기나 수정 | `anthropic-skills:pdf`, `anthropic-skills:pptx` |

- 문구 한두 개만 바꾸는 작은 수정에는 무거운 스킬(`polish-page`)을 쓰지 않는다.
- 페이지를 바꾼 뒤에는 브라우저로 직접 열어 데스크톱과 모바일 너비에서 확인한다.

# Project Cover 이미지 연결

현재 홈과 Projects 페이지는 이미지 없는 Placeholder 상태입니다. 실제 이미지 파일은 추가하지 않았으며, 기존 이미지 폴더에서 자동 선택하지 않습니다.

## 수정할 데이터

`content/project-covers.json`의 `items.<project>.image.src`에 **사용자가 제공한 실제 로컬 파일 경로**를 입력합니다. 현재 값은 모두 `null`입니다. `plannedPath`는 향후 파일 위치를 안내하는 값이며 이미지 요청에 사용하지 않습니다.

회사·역할·참여 기간·상세 링크는 `content/career-history.json`을 읽습니다. Cover 설정에 이 정보를 중복 입력하지 않습니다.

## 예정 경로와 Selector

| Project key | 향후 실제 파일 | 미디어 위치 |
|---|---|---|
| neon | assets/images/projects/project-neon-cover.webp | [data-cover-project="neon"] .project-cover__media |
| undecember | assets/images/projects/undecember-cover.webp | [data-cover-project="undecember"] .project-cover__media |
| slime | assets/images/projects/legend-of-slime-cover.webp | [data-cover-project="slime"] .project-cover__media |
| talesrunner | assets/images/projects/tales-runner-cover.webp | [data-cover-project="talesrunner"] .project-cover__media |
| dme | assets/images/projects/project-dme-cover.webp | [data-cover-project="dme"] .project-cover__media |

현재 이 경로에 빈 파일을 만들지 않았습니다. 실제 파일을 전달받았을 때 폴더와 파일을 추가합니다. 필요하면 AVIF 등 실제 전달된 형식의 파일 경로를 사용해도 됩니다. 외부 URL은 허용하지 않습니다.

## 연결 예시

실제 NEON 파일을 위 경로에 넣은 뒤 해당 항목을 다음처럼 설정합니다.

```json
"image": {
  "src": "assets/images/projects/project-neon-cover.webp",
  "plannedPath": "assets/images/projects/project-neon-cover.webp",
  "alt": "",
  "positionDesktop": "50% 50%",
  "positionTablet": "50% 50%",
  "positionMobile": "50% 50%"
}
```

저장소에서 `node scripts/build-pages.cjs`를 실행합니다. 기존 미디어 슬롯에 `<img>`가 생성되고 Placeholder Label은 자동으로 제외됩니다. 커버 HTML을 수동으로 다시 작성하거나 런타임 이미지 관리 스크립트를 추가할 필요가 없습니다. 홈과 Projects에 함께 반영됩니다.

`src`가 없는 동안 `<img>`를 출력하지 않으므로 빈 src·잘못된 파일 요청·깨진 이미지가 없습니다. `src`를 설정했는데 실제 로컬 파일이 없으면 생성 단계에서 오류를 냅니다.

## Crop / Overlay

- `positionDesktop`: 1024px 이상.
- `positionTablet`: 601–1023px.
- `positionMobile`: 600px 이하.
- 이미지 스타일: `.project-cover__image`의 `width:100%; height:100%; object-fit:cover`.
- 해당 설정은 커버의 `--cover-position-desktop/tablet/mobile`에 연결됩니다.
- `gradientMiddle`, `gradientBottom`: 각 이미지의 명도에 따라 0–1 범위에서 조정할 Overlay 알파 값. 현재 기본값은 0.12 / 0.94.

## 이미지별 텍스트 구도

같은 항목의 `textAlignment.desktop`, `textAlignment.tablet`, `textAlignment.mobile`에서 `left`, `center`, `right`를 선택합니다. 현재 다섯 Cover 모두 `left`입니다. 모든 위치는 하단을 기준으로 합니다. 오른쪽 Subject라면 왼쪽 텍스트를 유지하고, 왼쪽 Subject와 겹친다면 해당 화면만 `right`로 조정할 수 있습니다.

설정은 `--cover-text-align-desktop/tablet/mobile`과 `--cover-content-align-desktop/tablet/mobile` CSS 변수로 연결됩니다. 별도 인터랙션이나 이미지 관리 JavaScript를 추가하지 않습니다.

## 권장 원본과 프레임 비율

- TALES RUNNER / Wide: 원본은 3:2 권장. 1440px 화면의 실제 프레임은 약 1.56:1입니다.
- PROJECT DME / Medium: 4:3 또는 1:1 원본 권장. 실제 프레임은 약 1.10:1입니다.
- UNDECEMBER / PROJECT NEON / LEGEND OF SLIME: 4:3 또는 1:1 원본 권장. 실제 프레임은 약 1.07:1입니다.
- 390px Mobile: 모두 4:5 프레임입니다. 같은 원본을 `object-fit:cover`로 자르므로 Subject와 로고·문자가 가장자리에 몰리지 않은 이미지를 우선 검토합니다.

이는 이미지 선택을 위한 권장값이며 실제 제공될 이미지의 규격이나 내용에 대한 확인 결과는 아닙니다. 실제 게임 리소스가 전달되면 원본을 유지하고 화면별 object-position으로 구도를 검수합니다.

이미지 의미가 제목·설명과 중복되는 장식이라면 `alt`를 빈 문자열로 유지합니다. 추가 정보를 전달하는 자료라면 실제 이미지 내용을 확인한 뒤 짧은 대체 텍스트를 입력합니다. 미래 이미지를 보지 않은 상태에서 대체 텍스트를 만들어 넣지 않았습니다.

실제 이미지 적용 후에는 1440 / 1280 / 768 / 390px에서 인물·텍스트 잘림, Overlay 대비와 Crop을 다시 확인해야 합니다. 이번 단계는 Placeholder Layout 검증까지만 완료했습니다.

## 순서 정책

- 홈: TALES RUNNER → PROJECT DME → UNDECEMBER → PROJECT NEON → LEGEND OF SLIME. 참여 종료 시점 기준 최신순입니다.
- Projects의 Featured도 홈과 동일한 최신순입니다. 참여 종료 시점이 같으면 시작 시점으로 비교합니다.
- 첫 항목 Wide, 둘째 Medium, 나머지 세 항목 Secondary는 화면 구성 역할입니다. 성과나 프로젝트 우열의 표시가 아닙니다.
- 최신순 Project History는 별도 목록이며 변경하지 않았습니다.

생성 코드는 `scripts/project-covers.cjs`, 스타일은 `site.css`의 Project covers 블록입니다. 브라우저용 JavaScript는 추가하지 않았습니다.

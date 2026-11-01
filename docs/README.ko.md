# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 10](https://img.shields.io/badge/pnpm-%3E%3D10-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

[Astro](https://astro.build)로 만든 개인 정적 블로그입니다.
[Fuwari](https://github.com/saicaca/fuwari) 템플릿을 포크하여 더 새로운 도구
체인을 따르도록 업데이트했습니다.

🌏 다른 언어:
[**English**](README.en.md) /
[**中文**](../README.md) /
[**日本語**](README.ja.md) /
[**Español**](README.es.md) /
[**ไทย**](README.th.md) /
[**Tiếng Việt**](README.vi.md) /
[**Bahasa Indonesia**](README.id.md)

## 소개

이 저장소는 Fuwari의 복사본에서 시작했으며, 현재는 상위 템플릿보다 새로운 스택으로
동작합니다.

| 항목 | 상위 템플릿 | 이 저장소 |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x (`@astrojs/tailwind` 사용) | **4.x (`@tailwindcss/vite` 사용)** |
| 콘텐츠 컬렉션 | 레거시 `src/content/config.ts` | **Content Layer API** (`src/content.config.ts`) |
| Svelte | 5.39 | **5.57** |

`@astrojs/tailwind`는 Astro 6 이상을 지원하지 않았기 때문에 Tailwind CSS 4 마이그
레이션은 선택이 아니라 필수였습니다. 스타일 설정은 이제 `tailwind.config.js` 대신
[src/styles/app.css](../src/styles/app.css)에서 CSS 우선 방식으로 작성합니다.

블로그 본문과 사이트 설정은 아직 템플릿 기본값입니다.
[src/config.ts](../src/config.ts)를 편집해 자신의 사이트로 만드세요.

## 기능

- Astro와 Tailwind CSS로 구축하고, 상호작용이 필요한 부분은 Svelte 사용
- [Swup](https://swup.js.org/)을 통한 부드러운 페이지 전환
- [Pagefind](https://pagefind.app/)를 통한 클라이언트 측 전문 검색
- 라이트 / 다크 모드. 강조 색상은 변경 가능하며 `localStorage`에 저장
- 반응형 레이아웃. 넓은 화면에서는 목차 표시
- [Expressive Code](https://expressive-code.com/)를 통한 코드 구문 강조
  (언어 배지, 복사 버튼, 접이식 블록 지원)
- [KaTeX](https://katex.org/)를 통한 수식 렌더링
- 확장 Markdown: Admonition, GitHub 저장소 카드
- [PhotoSwipe](https://photoswipe.com/) 라이트박스. 이미지는 Sharp로 최적화
- 빌드 시 RSS 피드, 사이트맵, `robots.txt` 생성
- UI 문구는 10개 언어로 번역됨

## 요구 사항

- **Node.js 22.12.0 이상**
- **pnpm 10 이상**

pnpm의 정확한 버전은 `packageManager` 필드로 고정되어 있어 호환 버전이 자동으로
선택됩니다. `preinstall` 스크립트는 npm과 Yarn을 거부합니다.

## 시작하기

```sh
pnpm install     # 의존성 설치
pnpm dev         # http://localhost:4321 에서 개발 서버 실행
```

`pnpm dev`는 로컬 런처도 함께 띄웁니다. 먼저 이 저장소에 `launcher/server.mjs`가
있는지 보고, 없으면 환경 변수 `LAUNCHER_HOME`, 그다음 형제 디렉터리
`../fuwari-launcher`를 확인해 찾은 것을 사용합니다. 어디에도 없으면 오류 없이
사이트만 시작합니다. 사이트만 띄우려면 `pnpm dev:astro` 또는
`pnpm dev --no-launcher`(또는 `LAUNCHER=0`)를 사용하세요.

그다음:

1. [src/config.ts](../src/config.ts) 편집 —— 사이트 제목, 부제, 언어, 테마 색상,
   배너, 목차, 파비콘.
2. `pnpm new-post <filename>`을 실행해 `src/content/posts/`에 글 초안 생성.
3. 배포 전에 [astro.config.mjs](../astro.config.mjs)의 `site`와 `base` 설정.

## 프로젝트 구조

```
src/
├── assets/         컴포넌트가 불러오는 이미지
├── components/     Astro 및 Svelte 컴포넌트 (control/, misc/, widget/)
├── constants/      레이아웃 상수, 아이콘 기본값, 내비게이션 프리셋
├── content/        블로그 글과 독립 페이지 컬렉션
├── i18n/           UI 문구 (언어별 모듈 1개)
├── layouts/        Layout.astro, MainGridLayout.astro
├── pages/          라우트: 홈, 아카이브, About, 글, RSS, robots.txt
├── plugins/        remark / rehype 및 Expressive Code 플러그인
├── styles/         app.css (Tailwind 진입점)와 기능별 스타일시트
├── types/          공용 TypeScript 타입
└── utils/          콘텐츠 조회, URL, 테마 헬퍼
src/content.config.ts   컬렉션 정의 (Content Layer API)
scripts/                개발 스크립트: dev.mjs (사이트 + 런처 실행), sync-branch.mjs (브랜치 스냅숏 동기화)
launcher/               로컬 런처 (설정과 콘텐츠 편집, 미리보기, 배포용 Web UI)
start-launcher.cmd      Windows에서 더블클릭으로 런처 실행
```

## 브랜치

| 브랜치 | 내용 | 용도 |
|:--|:--|:--|
| `main` | 사이트 본체 + 런처 (`launcher/`, `start-launcher.cmd`) | 일상 개발: `pnpm dev`가 사이트와 런처를 함께 띄움 |
| `site` | 사이트 본체만, 런처 없음 | 깨끗한 사본: 블로그만 필요하거나 `clone`을 깔끔하게 유지하고 싶을 때 |
| `launcher` | 런처만, 사이트 본체 없음 | 런처만 따로 수정; `LAUNCHER_ROOT`로 사이트 checkout을 가리킴 |

세 브랜치는 **공통 조상이 없습니다**(각자 독립적인 orphan 히스토리). 이는 의도된 것으로,
git은 세 브랜치의 병합을 곧바로 거부하며(`fatal: refusing to merge unrelated histories`),
공유 히스토리처럼 상대편 파일을 조용히 지우지 않습니다. 따라서:

- 이 세 브랜치를 `git merge`로 동기화하지 마세요. 동기화하려면 디렉터리를 가져오거나 아래 스크립트를 쓰세요.
- 콘텐츠의 진원지는 항상 `main`입니다. `site`는 "`main`에서 `launcher/`, `start-launcher.cmd`를 뺀 것"이고,
  `launcher`는 "브랜치 자체의 `README.md`/`package.json`/`start-launcher.cmd` + `main`의 `launcher/`"입니다.
- 분리 이전의 옛 히스토리는 태그로 남아 있습니다: `site-pre-split`(= 기존 `fa47b3d`), `launcher-pre-split`(= 기존 `b157a80`).

동기화 스크립트(`main`의 checkout에서 실행하며, git 저수준 명령으로 트리를 재구성하고 작업 영역은 건드리지 않습니다):

```bash
node scripts/sync-branch.mjs site --dry-run      # 어떤 파일이 바뀔지 먼저 확인
node scripts/sync-branch.mjs site --push         # site 업데이트 후 푸시
node scripts/sync-branch.mjs launcher --push     # launcher의 launcher/ 디렉터리 업데이트 후 푸시
```

`launcher` 브랜치가 `E:\fuwari-launcher`에 checkout되어 있으면 스크립트가 그 디렉터리에서 `git reset --hard <sha>`를 실행하라고 안내합니다.

### 세 개의 디렉터리(worktree)

세 브랜치가 각각 하나의 디렉터리에 checkout되고 **하나의 `.git`을 공유합니다**(저장소 사본 세 개가 아닙니다). 그래서 세 곳의 커밋, 푸시, 브랜치 목록은 모두 같은 것입니다:

```
E:\fuwari\             → main      일상 개발: 사이트 + 런처
E:\fuwari-site\        → site      깨끗한 사이트 (launcher/ 없음)
E:\fuwari-launcher\    → launcher  런처만 따로 수정할 때 사용
```

`git worktree list`로 모든 checkout을 볼 수 있습니다. 새 디렉터리를 만들거나 다시 만들 때:

```bash
git worktree add ../fuwari-site site
git worktree add ../fuwari-launcher launcher

# 의존성은 메인 디렉터리를 공유하며, 복사 대신 junction 링크를 씁니다:
cmd //c mklink /J ..\fuwari-site\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\private ..\fuwari\private
```

같은 브랜치를 두 디렉터리에 동시에 checkout할 수 없으므로(git이 거부), 세 곳의 수동 수정은 자연히 서로를 덮어쓰지 않습니다.

디렉터리를 삭제할 때는 **junction을 먼저 떼고 나서 작업 영역을 삭제**하세요. 그렇지 않으면 삭제가 대상 디렉터리까지 따라갑니다:

```bash
cmd //c rmdir ..\fuwari-site\node_modules
git worktree remove ../fuwari-site
```

디렉터리별 주의점:

| 디렉터리 | 주의 |
|:--|:--|
| `E:\fuwari` | `pnpm dev`가 사이트(localhost:4321)와 런처(127.0.0.1:5199)를 동시에 띄움 |
| `E:\fuwari-site` | 사이트만 있는 이 디렉터리에서 미리보려면 `pnpm dev:astro`를 쓰세요. `pnpm dev`는 `..\fuwari-launcher`까지 가서 런처를 찾습니다 |
| `E:\fuwari-launcher` | **`pnpm`을 실행하지 마세요** (`node_modules`가 junction이라 pnpm이 설치를 거부하고 삭제를 시도할 수 있습니다). `node launcher/server.mjs`를 쓰거나 `start-launcher.cmd`를 더블클릭하고, 사이트 디렉터리를 가리키게 하세요(`LAUNCHER_ROOT` 또는 기본값인 형제 `fuwari`) |

`site` / `launcher` 디렉터리에서의 수동 수정은 그 브랜치에 속하며 동기화 스크립트가 `main`으로 합쳐 주지 않습니다. 반대로 `sync-branch.mjs`를 실행하면 `main`의 내용으로 `site`의 트리 전체와 `launcher`의 `launcher/` 디렉터리를 덮어씁니다. 오래 유지할 변경은 `main`에서 하세요.

## 글 Frontmatter

글은 `src/content/posts/`에 있으며 `src/content.config.ts`의 스키마로 검증됩니다.

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # 글 파일 기준 상대 경로 또는 public 절대 경로
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # 글 언어가 사이트 언어와 다를 때만
---
```

필수 항목은 `title`과 `published`뿐입니다. `draft: true`로 두면 프로덕션 빌드에서
제외되지만 개발 중에는 계속 보입니다.

글과 이미지를 함께 두려면 `index.md`를 쓰는 폴더 형식을 사용하세요:

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## Markdown 확장 문법

[GitHub Flavored Markdown](https://github.github.com/gfm/)에 더해 빌드 파이프라인이
다음을 제공합니다:

- **Admonition** —— `note`, `tip`, `important`, `caution`, `warning` 다섯 종류.
- **GitHub 저장소 카드** —— 스타 수와 라이선스를 포함한 요약을 삽입합니다.
- **확장 코드 블록** —— 접이식 블록, 줄 번호, 언어 배지 등 Expressive Code 기능.
- **수식** —— 인라인 및 블록 수식을 KaTeX로 렌더링.

각 기능의 실행 예시는 `src/content/posts/`의 예제 글에서 볼 수 있습니다.

## 명령어

모두 저장소 루트에서 실행합니다:

| 명령어 | 동작 |
|:--|:--|
| `pnpm install` | 의존성 설치 |
| `pnpm dev` | `localhost:4321`에서 개발 서버 실행 |
| `pnpm build` | `./dist/`로 빌드한 뒤 Pagefind로 인덱스 생성 |
| `pnpm preview` | 프로덕션 빌드를 로컬에서 미리보기 |
| `pnpm check` | `astro check`로 타입 및 템플릿 오류 검사 |
| `pnpm format` | Biome로 `src/` 포맷 |
| `pnpm lint` | Biome로 `src/` 검사 및 자동 수정 |
| `pnpm new-post <filename>` | 새 글 생성 |
| `pnpm astro ...` | `astro add` 등 Astro CLI 명령 실행 |

`pnpm build`는 `astro build` 후 `pagefind --site dist`를 실행합니다. 검색은 프로덕션
빌드에서만 동작하므로 `pnpm build && pnpm preview`로 확인하세요.

## 배포

`dist/`의 결과물은 완전한 정적 파일이라 어디에나 호스팅할 수 있습니다. Vercel,
Netlify, Cloudflare Pages 모두 별도 설정 없이 빌드됩니다 —— 빌드 명령을
`pnpm build`, 출력 디렉터리를 `dist`로 지정하고 사용하는 호스트의
[Astro 배포 가이드](https://docs.astro.build/ko/guides/deploy/)를 참고하세요.

먼저 `astro.config.mjs`의 `site`를 갱신하세요. 사이트맵, RSS 피드, 표준 URL이
여기에 의존합니다.

푸시와 풀 리퀘스트마다
[.github/workflows/build.yml](../.github/workflows/build.yml)과
[.github/workflows/biome.yml](../.github/workflows/biome.yml)에서 CI가 실행됩니다.

## 크레딧

[saicaca](https://github.com/saicaca)의
[Fuwari](https://github.com/saicaca/fuwari)를 기반으로 합니다. 원래 디자인과 구현은
해당 템플릿에서 비롯되었습니다. 상위 저장소는 git의 `upstream` 리모트로 추적합니다.

포함된 글꼴은 [Roboto](https://fonts.google.com/specimen/Roboto)와
[JetBrains Mono](https://www.jetbrains.com/lp/mono/), 아이콘은
[Iconify](https://iconify.design/)입니다.

## 라이선스

[MIT](../LICENSE) —— 원래 저작권 표시를 유지합니다.

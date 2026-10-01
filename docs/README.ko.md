# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

[Astro](https://astro.build)로 만든 개인 정적 블로그입니다.
[Fuwari](https://github.com/saicaca/fuwari) 템플릿을 포크하여 더 새로운 도구
체인을 따르도록 업데이트했습니다.

🌏 다른 언어:
[**English**](../README.md) /
[**中文**](README.zh-CN.md) /
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
- **pnpm 9 이상**

pnpm의 정확한 버전은 `packageManager` 필드로 고정되어 있어 호환 버전이 자동으로
선택됩니다. `preinstall` 스크립트는 npm과 Yarn을 거부합니다.

## 시작하기

```sh
pnpm install     # 의존성 설치
pnpm dev         # http://localhost:4321 에서 개발 서버 실행
```

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
```

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

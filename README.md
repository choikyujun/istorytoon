# 🌸 iStoryToon

> 가족의 소중한 이야기를 AI 만화로 만들어드립니다

---

## 📁 프로젝트 구조

```
istorytoon/
├── index.html                    # 앱 진입점 (단일 HTML)
├── style.css                     # 전체 스타일 (기능별 섹션 분리)
├── main.js                       # 앱 초기화 + 화면 라우터
├── config.js                     # Supabase URL/Key 설정
├── manifest.json                 # PWA 매니페스트
│
├── store/
│   └── state.js                  # 전역 상태 관리 (AppState)
│
├── api/
│   ├── claude.js                 # Claude API 연동 (Edge Function 경유)
│   └── dalle.js                  # DALL-E 3 이미지 생성 (Edge Function 경유)
│
├── components/
│   ├── main-screen.js            # 메인 화면 (입력 + 생성)
│   ├── viewer-screen.js          # 만화 뷰어
│   └── library-screen.js        # 내 만화 목록
│
├── utils/
│   ├── ui.js                     # UI 유틸 (토스트, 로딩, 날짜 등)
│   └── share.js                  # 공유 기능 (Web Share API)
│
├── supabase/
│   └── functions/
│       ├── story-analyze/        # Claude API Edge Function
│       │   └── index.ts
│       └── image-generate/       # DALL-E 3 Edge Function
│           └── index.ts
│
└── assets/
    └── icons/                    # PWA 아이콘 (192, 512px)
```

---

## 🚀 배포 흐름

### Web (PWA)
1. Vercel / GitHub Pages에 정적 파일 배포
2. Supabase Edge Functions 배포 (API 키 서버에서 관리)

### iOS / Android (Capacitor)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init iStoryToon com.istorytoon.app
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios    # Xcode
npx cap open android  # Android Studio
```

---

## 🔑 환경변수 (Supabase Edge Functions)

Supabase 대시보드 → Settings → Edge Functions Secrets에 설정:

| Key | 설명 |
|-----|------|
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `OPENAI_API_KEY` | OpenAI (DALL-E 3) API 키 |

---

## 🛠 Edge Functions 배포

```bash
supabase functions deploy story-analyze
supabase functions deploy image-generate
```

---

## 🌏 다국어 지원 (로드맵)
- v1.0: 한국어
- v1.1: 영어, 일본어
- v1.2: 중국어, 스페인어

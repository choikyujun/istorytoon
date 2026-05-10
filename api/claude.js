/**
 * iStoryToon - Claude API 연동 (Supabase Edge Function 경유)
 * API 키는 서버(Edge Function)에서만 관리
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

const ANALYZE_URL = `${SUPABASE_URL}/functions/v1/story-analyze`;

// ── 시스템 프롬프트 ──────────────────────────────
const SYSTEM_PROMPT = `당신은 가족의 소중한 이야기를 따뜻하고 감동적인 만화로 만드는 전문 스토리텔러입니다.

당신의 역할:
1. 지금은 한국어 버전을 출시하지만, 추후 고도화할 때 다국어 버전을 출시합니다.
2. 사용자가 입력한 가족 스토리를 4컷 이상의 만화로 구성합니다.
3. 각 컷의 장면, 감정, 대사, 이미지 프롬프트를 생성합니다.
4. 드라마틱하고 감동적인 연출을 합니다.
5. 한국 가족 문화와 감성을 반영합니다.

출력 규칙:
- 반드시 JSON 형식으로만 응답합니다
- 마크다운(\`\`\`) 없이 순수 JSON만 출력합니다
- imagePrompt는 반드시 영어로 작성합니다
- 대사는 자연스러운 한국어로 작성합니다`;

// ── 유저 프롬프트 생성 ───────────────────────────
function buildUserPrompt(story, cuts, style, characters = {}) {
  // 등장인물 이름 정보 추가
  const charInfo = Object.values(characters)
    .filter(c => c?.name)
    .map(c => `- ${c.name}`)
    .join('\n');
  const charSection = charInfo ? `\n\n[등장인물]\n${charInfo}` : '';

  return `다음 가족 스토리를 감동적인 ${cuts}컷 만화로 분석해주세요.

스토리: "${story}"${charSection}

아래 JSON 형식으로 정확히 ${cuts}개의 panel을 만들어 응답해주세요:
{
  "title": "만화 제목 (20자 이내, 감성적으로)",
  "genre": "로맨스|가족|성장|감동|코믹 중 하나",
  "mood": "따뜻한|설레는|감동적인|유쾌한|뭉클한 중 하나",
  "panels": [
    {
      "id": 1,
      "scene": "장면 제목 (10자 이내)",
      "description": "장면 상황 설명 (한국어, 2~3문장)",
      "emotion": "등장인물들의 주요 감정",
      "dialogue": [
        {
          "speaker": "화자 이름",
          "text": "대사 내용",
          "side": "left 또는 right",
          "type": "speech 또는 thought 또는 narration"
        }
      ],
      "sfx": "효과음 (두근두근, 반짝반짝 등, 없으면 빈 문자열)",
      "narration": "나레이션 박스 텍스트 (없으면 null)",
      "imagePrompt": {
        "shoujo": "shoujo anime manga style prompt in English",
        "webtoon": "Korean webtoon style prompt in English",
        "disney": "Disney Pixar animation style prompt in English",
        "watercolor": "soft watercolor painting style prompt in English"
      }
    }
  ],
  "epilogue": "만화의 마지막 나레이션 또는 교훈 (한 문장)"
}`;
}

// ── 스토리 분석 API 호출 ─────────────────────────
export async function analyzeStory({ story, cuts = 6, style = 'shoujo', characters = {} }) {
  const res = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(story, cuts, style, characters),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`스토리 분석 실패: ${res.status} ${err}`);
  }

  const data = await res.json();

  // Edge Function이 { content: "..." } 형태로 반환
  const raw = typeof data.content === 'string' ? data.content : JSON.stringify(data);

  // 마크다운 코드블록 제거 (```json ... ``` 또는 ``` ... ```)
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    // JSON 블록 추출 재시도
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('응답 파싱 실패: ' + stripped.slice(0, 100));
  }
}

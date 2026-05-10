/**
 * iStoryToon - 이미지 생성 API
 * Edge Function 경유 (CORS 해결)
 * 6개 완전 병렬 동시 호출
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

const IMAGE_EDGE_URL = `${SUPABASE_URL}/functions/v1/image-generate`;

const STYLE_SUFFIX = {
  shoujo:  'shoujo anime manga style, soft pastel colors, sparkle effects, clean linework, no text, no watermark',
  webtoon: 'Korean webtoon style, bold clean lines, vibrant colors, expressive characters, no text, no watermark',
  disney:  'Disney Pixar 3D animation style, cinematic warm lighting, vibrant colors, no text, no watermark',
};

// ── 워밍업 ─────────────────────────────────────
export async function warmupModel() {
  try {
    fetch(IMAGE_EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ prompt: 'warmup, anime style' }),
    });
  } catch (e) { /* 무시 */ }
}

// ── 전체 패널 생성 (10초 간격 순차) ─────────────
// Replicate rate limit: burst=1, 분당 6개 → 10초 간격이 안전
export async function generateAllImages({ panels, style = 'shoujo', onProgress }) {
  onProgress?.(0, panels.length);
  const urls = [];

  for (let i = 0; i < panels.length; i++) {
    try {
      const url = await callWithRetry(buildPrompt(panels[i], style), 0);
      urls.push(url);
    } catch (err) {
      console.warn(`패널 ${i+1} 실패:`, err.message);
      urls.push(null);
    }
    onProgress?.(i + 1, panels.length);

    // 다음 패널 전 10초 대기 (rate limit 방지)
    if (i < panels.length - 1) {
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  return urls;
}

// ── 재시도 포함 단일 호출 ────────────────────────
async function callWithRetry(prompt, panelIdx = 0, maxRetry = 3) {
  // 패널마다 약간 시차 (0~2초) — 동시 폭주 방지
  await new Promise(r => setTimeout(r, panelIdx * 300));

  for (let attempt = 0; attempt < maxRetry; attempt++) {
    try {
      const res = await fetch(IMAGE_EDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(58000), // 58초
      });

      if (res.status === 503) {
        // 모델 로딩 → 대기 후 재시도
        await new Promise(r => setTimeout(r, 8000 * (attempt + 1)));
        continue;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.url || null;

    } catch (err) {
      if (attempt < maxRetry - 1) {
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      throw err;
    }
  }
  return null;
}

function buildPrompt(panel, style) {
  const base = panel.imagePrompt?.[style]
    || `${panel.scene || ''} ${panel.description || ''}`.trim().slice(0, 300);
  return `${base}, ${STYLE_SUFFIX[style] || STYLE_SUFFIX.shoujo}`;
}

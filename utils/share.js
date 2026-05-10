/**
 * iStoryToon - 공유 유틸리티
 * Web Share API + 캔버스 기반 이미지 합성 (추후)
 */

import { showToast } from './ui.js';

// ── 기본 공유 ────────────────────────────────────
export async function shareToon(toon) {
  const text = `🌸 iStoryToon\n\n"${toon.title}"\n\n${toon.epilogue}\n\n우리 가족 이야기를 만화로! istorytoon.app`;

  // Web Share API 지원 시 (모바일)
  if (navigator.share) {
    try {
      await navigator.share({ title: toon.title, text });
      return;
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('Share API 실패:', e);
    }
  }

  // 폴백: 클립보드 복사
  try {
    await navigator.clipboard.writeText(text);
    showToast('📋 클립보드에 복사했어요!');
  } catch {
    showToast('공유 기능을 사용할 수 없습니다.');
  }
}

// ── 이미지 다운로드 ──────────────────────────────
export function downloadImage(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'istorytoon.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

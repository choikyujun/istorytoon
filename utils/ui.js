/**
 * iStoryToon - UI 유틸리티
 * 토스트, 로딩 스텝, 공통 DOM 헬퍼
 */

// ── 토스트 메시지 ────────────────────────────────
let toastTimer = null;

export function showToast(message, duration = 2500) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = message;
  el.classList.remove('hidden');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), duration);
}

// ── 로딩 스텝 상태 업데이트 ─────────────────────
// stepId: 'step-story' | 'step-panels' | 'step-images'
// status: 'active' | 'done' | 'error'
export function setLoadingStep(stepId, status) {
  const el = document.getElementById(stepId);
  if (!el) return;

  el.classList.remove('active', 'done');
  if (status === 'active') el.classList.add('active');
  if (status === 'done') el.classList.add('done');

  const icon = el.querySelector('.step-icon');
  if (!icon) return;
  if (status === 'active') icon.textContent = '⏳';
  if (status === 'done') icon.textContent = '✅';
  if (status === 'error') icon.textContent = '❌';
}

export function resetLoadingSteps() {
  ['step-story', 'step-panels', 'step-images'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active', 'done');
    const icon = el.querySelector('.step-icon');
    if (icon) icon.textContent = '⏳';
  });
}

// ── 날짜 포맷 ────────────────────────────────────
export function formatDate(iso) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd} ${hh}:${min}`;
}

// ── 스타일 한글명 ────────────────────────────────
export function styleLabel(style) {
  const map = { shoujo: '💜 애니메이션', webtoon: '🟦 웹툰', disney: '🏰 디즈니' };
  return map[style] || style;
}

// ── el 쉽게 잡기 ─────────────────────────────────
export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

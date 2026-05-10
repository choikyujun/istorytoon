/**
 * iStoryToon - 라이브러리 화면 컴포넌트
 * 저장된 만화 목록 / 삭제
 */

import { AppState } from '../store/state.js';
import { showScreen } from '../main.js';
import { showToast, formatDate, styleLabel } from '../utils/ui.js';

// ── 초기화 ───────────────────────────────────────
export function initLibraryScreen() {
  document.getElementById('btn-back-library')?.addEventListener('click', () => {
    showScreen('main');
  });

  AppState.on('toonsChanged', renderLibrary);
}

// ── 라이브러리 렌더링 ────────────────────────────
function renderLibrary(toons) {
  // 라이브러리 화면이 아니면 건너뜀 (렌더는 화면 전환 시 트리거)
  const screen = document.getElementById('library-screen');
  if (!screen || screen.classList.contains('hidden')) return;
  _render(toons || AppState.toons);
}

export function openLibrary() {
  showScreen('library');
  _render(AppState.toons);
}

function _render(toons) {
  const list = document.getElementById('library-list');
  if (!list) return;

  if (!toons || toons.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-emoji">📚</div>
        <div class="empty-state-text">아직 저장된 만화가 없어요.<br>첫 번째 만화를 만들어 보세요!</div>
      </div>
    `;
    return;
  }

  list.innerHTML = toons.map(toon => `
    <div class="library-card" data-id="${toon.id}">
      ${toon.panels?.[0]?.imageUrl
        ? `<img class="library-thumb" src="${toon.panels[0].imageUrl}" alt="${escapeHtml(toon.title)}" loading="lazy">`
        : `<div class="library-thumb">🌸</div>`
      }
      <div class="library-info">
        <div class="library-title">${escapeHtml(toon.title)}</div>
        <div class="library-meta">${styleLabel(toon.style)} · ${toon.cuts}컷 · ${formatDate(toon.createdAt)}</div>
        <div class="library-meta" style="margin-top:6px; color:var(--text-secondary); font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(toon.story?.slice(0, 40) || '')}...</div>
      </div>
    </div>
  `).join('');

  // 클릭 이벤트
  list.querySelectorAll('.library-card').forEach(card => {
    // 카드 탭 → 뷰어 열기
    card.addEventListener('click', () => {
      const toon = AppState.toons.find(t => t.id === card.dataset.id);
      if (!toon) return;
      AppState.currentToon = toon;
      showScreen('viewer');
      window.dispatchEvent(new CustomEvent('toonReady', { detail: toon }));
    });

    // 길게 누르기 → 삭제
    let pressTimer;
    card.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => confirmDelete(card.dataset.id), 700);
    });
    card.addEventListener('touchend', () => clearTimeout(pressTimer));
    card.addEventListener('touchmove', () => clearTimeout(pressTimer));
  });
}

// ── 삭제 확인 ────────────────────────────────────
function confirmDelete(id) {
  if (!confirm('이 만화를 삭제할까요?')) return;
  AppState.deleteToon(id);
  showToast('🗑️ 만화를 삭제했어요.');
  _render(AppState.toons);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

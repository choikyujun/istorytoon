/**
 * iStoryToon - 뷰어 화면 컴포넌트
 * 만화 패널 렌더링 / 저장 / 공유
 */

import { AppState } from '../store/state.js';
import { showScreen } from '../main.js';
import { showToast } from '../utils/ui.js';
import { shareToon } from '../utils/share.js';

// ── 초기화 ───────────────────────────────────────
export function initViewerScreen() {
  // 만화 준비 이벤트 수신
  window.addEventListener('toonReady', (e) => renderToon(e.detail));

  document.getElementById('btn-back')?.addEventListener('click', () => {
    showScreen('main');
  });

  document.getElementById('btn-share')?.addEventListener('click', () => {
    if (AppState.currentToon) shareToon(AppState.currentToon);
  });

  document.getElementById('btn-save')?.addEventListener('click', handleSave);
  document.getElementById('btn-regenerate')?.addEventListener('click', handleRegenerate);
}

// ── 만화 렌더링 ──────────────────────────────────
function renderToon(toon) {
  if (!toon) return;

  // 타이틀
  const titleEl = document.getElementById('viewer-title');
  if (titleEl) titleEl.textContent = toon.title || '우리의 이야기';

  // 패널 컨테이너
  const viewer = document.getElementById('toon-viewer');
  if (!viewer) return;

  viewer.innerHTML = '';

  // 패널 렌더
  toon.panels?.forEach((panel, idx) => {
    viewer.appendChild(renderPanel(panel, idx));
  });

  // 에필로그
  if (toon.epilogue) {
    const epilogue = document.createElement('div');
    epilogue.className = 'toon-epilogue';
    epilogue.innerHTML = `<span class="epilogue-icon">🌸</span>${escapeHtml(toon.epilogue)}`;
    viewer.appendChild(epilogue);
  }

  // 스크롤 맨 위로
  viewer.scrollTop = 0;

  // 저장 버튼 상태
  const isAlreadySaved = AppState.toons.some(t => t.id === toon.id);
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    saveBtn.textContent = isAlreadySaved ? '✅ 저장됨' : '💾 저장하기';
    saveBtn.disabled = isAlreadySaved;
  }
}

// ── 단일 패널 렌더링 ─────────────────────────────
function renderPanel(panel, idx) {
  const wrap = document.createElement('div');
  wrap.className = 'toon-panel';

  // 이미지 영역
  const imgWrap = document.createElement('div');
  imgWrap.className = 'panel-image-wrap';

  if (panel.imageUrl) {
    const img = document.createElement('img');
    img.src = panel.imageUrl;
    img.alt = panel.scene;
    img.loading = 'lazy';
    imgWrap.appendChild(img);
  } else {
    // 플레이스홀더 (이미지 생성 실패 시)
    const placeholder = document.createElement('div');
    placeholder.className = 'panel-image-placeholder';
    placeholder.textContent = ['🌸', '💕', '✨', '🌟', '💫', '🎨', '🌈', '💜'][idx % 8];
    imgWrap.appendChild(placeholder);
  }

  // 효과음
  if (panel.sfx) {
    const sfx = document.createElement('div');
    sfx.className = 'panel-sfx';
    sfx.textContent = panel.sfx;
    imgWrap.appendChild(sfx);
  }

  wrap.appendChild(imgWrap);

  // 대화 영역
  const dialogueWrap = document.createElement('div');
  dialogueWrap.className = 'panel-dialogue';

  // 나레이션
  if (panel.narration) {
    const narr = document.createElement('div');
    narr.className = 'panel-narration';
    narr.textContent = panel.narration;
    dialogueWrap.appendChild(narr);
  }

  // 대사
  panel.dialogue?.forEach(d => {
    if (!d.text) return;
    const bubble = document.createElement('div');
    bubble.className = `speech-bubble ${d.side === 'right' ? 'right' : 'left'} ${d.type === 'thought' ? 'bubble-thought' : ''}`;

    const speaker = document.createElement('div');
    speaker.className = 'bubble-speaker';
    speaker.textContent = d.speaker || '';

    const text = document.createElement('div');
    text.className = 'bubble-text';
    text.textContent = d.text;

    bubble.appendChild(speaker);
    bubble.appendChild(text);
    dialogueWrap.appendChild(bubble);
  });

  if (dialogueWrap.children.length > 0) {
    wrap.appendChild(dialogueWrap);
  }

  return wrap;
}

// ── 저장 처리 ────────────────────────────────────
function handleSave() {
  const toon = AppState.currentToon;
  if (!toon) return;

  // 이미 저장된 경우 건너뜀
  if (AppState.toons.some(t => t.id === toon.id)) {
    showToast('이미 저장된 만화예요!');
    return;
  }

  AppState.saveToon(toon);
  showToast('💾 만화를 저장했어요!');

  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    saveBtn.textContent = '✅ 저장됨';
    saveBtn.disabled = true;
  }
}

// ── 다시 만들기 ──────────────────────────────────
function handleRegenerate() {
  AppState.currentToon = null;
  showScreen('main');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

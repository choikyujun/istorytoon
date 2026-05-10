/**
 * iStoryToon - 메인 진입점
 * 앱 초기화 및 라우터 역할
 */

import { AppState } from './store/state.js';
import { initMainScreen } from './components/main-screen.js';
import { initViewerScreen } from './components/viewer-screen.js';
import { initLibraryScreen } from './components/library-screen.js';
import { showToast } from './utils/ui.js';

// ── 앱 초기화 ──────────────────────────────────────
async function initApp() {
  // 스플래시 1.5초 후 메인 진입
  await new Promise(r => setTimeout(r, 1500));
  showScreen('main');

  // 각 화면 컴포넌트 초기화
  initMainScreen();
  initViewerScreen();
  initLibraryScreen();

  // 저장된 만화 로드
  await AppState.loadToons();
}

// ── 화면 전환 (글로벌 라우터) ────────────────────────
export function showScreen(name) {
  const screens = ['splash', 'main', 'loading', 'viewer', 'library'];
  screens.forEach(s => {
    const el = document.getElementById(`${s}-screen`);
    if (el) el.classList.toggle('hidden', s !== name);
  });
}

// ── 글로벌 에러 핸들러 ─────────────────────────────
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled:', e.reason);
  showToast('오류가 발생했습니다. 다시 시도해주세요.');
});

// ── 시작 ──────────────────────────────────────────
initApp();

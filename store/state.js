/**
 * iStoryToon - 앱 전역 상태 관리
 * LocalStorage 기반 (추후 Supabase 동기화 예정)
 */

const STORAGE_KEY = 'istorytoon_toons';

export const AppState = {
  // ── 현재 세션 상태 ─────────────────────────────
  currentStory: '',
  currentStyle: 'shoujo',
  currentCuts: 6,
  currentToon: null,      // 생성된 만화 데이터
  currentCharacters: {},  // { 1: { dataUrl, name, cartoonUrl }, 2: ... }

  // ── 저장된 만화 목록 ────────────────────────────
  toons: [],

  // ── 상태 변경 리스너 ────────────────────────────
  _listeners: {},

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  },

  emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  },

  // ── 만화 저장 ───────────────────────────────────
  saveToon(toon) {
    const item = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      style: this.currentStyle,
      cuts: this.currentCuts,
      story: this.currentStory,
      ...toon,
    };
    this.toons.unshift(item);
    // 최대 30개 보관
    if (this.toons.length > 30) this.toons = this.toons.slice(0, 30);
    this._persist();
    this.emit('toonsChanged', this.toons);
    return item;
  },

  // ── 만화 삭제 ───────────────────────────────────
  deleteToon(id) {
    this.toons = this.toons.filter(t => t.id !== id);
    this._persist();
    this.emit('toonsChanged', this.toons);
  },

  // ── 로컬 저장 ───────────────────────────────────
  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toons));
    } catch (e) {
      console.warn('Storage full:', e);
    }
  },

  // ── 불러오기 ────────────────────────────────────
  async loadToons() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.toons = raw ? JSON.parse(raw) : [];
    } catch {
      this.toons = [];
    }
    this.emit('toonsChanged', this.toons);
  },
};

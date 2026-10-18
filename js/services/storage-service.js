/**
 * VIRGIL - LOCAL STORAGE & PREFERENCES SERVICE
 */

export class StorageService {
  constructor() {
    this.STORAGE_KEYS = {
      HISTORY: 'virgil_search_history',
      THEME: 'virgil_theme',
      SOUND: 'virgil_sound_fx',
      SCANLINES: 'virgil_crt_scanlines',
      SOURCES: 'virgil_selected_sources'
    };
  }

  getSearchHistory() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addSearchHistory(term) {
    if (!term || typeof term !== 'string') return;
    const clean = term.trim();
    if (!clean) return;
    try {
      const history = this.getSearchHistory().filter(item => item.toLowerCase() !== clean.toLowerCase());
      history.unshift(clean);
      localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 10)));
    } catch {}
  }

  getPreference(key, defaultValue) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setPreference(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

export const storage = new StorageService();

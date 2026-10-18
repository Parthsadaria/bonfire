/**
 * VIRGIL - ENGINE SWITCHER
 */

import { CONFIG } from '../config.js';

export class EngineSwitcherComponent {
  constructor({ containerSelector, onEngineChange }) {
    this.buttons = document.querySelectorAll(`${containerSelector} .engine-tab`);
    this.onEngineChange = onEngineChange;
    this.activeEngine = CONFIG.defaultEngine;
    this.bindEvents();
  }

  bindEvents() {
    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const engineId = btn.getAttribute('data-engine');
        if (engineId && engineId !== this.activeEngine) {
          this.setEngine(engineId, true);
        }
      });
    });
  }

  setEngine(engineId, triggerCallback = false) {
    const config = CONFIG.engines[engineId];
    if (!config) return;

    this.activeEngine = engineId;

    this.buttons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-engine') === engineId);
    });

    const url = new URL(window.location.href);
    url.searchParams.set('engine', engineId);
    window.history.replaceState({}, '', url.toString());

    document.title = `${config.name} — Virgil Search`;

    if (triggerCallback && typeof this.onEngineChange === 'function') {
      this.onEngineChange(engineId, config);
    }
  }

  getActiveEngine() {
    return this.activeEngine;
  }
}

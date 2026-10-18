/**
 * VIRGIL - SOURCES & FILTERS DRAWER
 */

import { CONFIG } from '../config.js';

export class FilterDrawerComponent {
  constructor({ sourcesBtnId, sourcesPanelId, onFilterChange }) {
    this.sourcesBtn = document.getElementById(sourcesBtnId);
    this.sourcesPanel = document.getElementById(sourcesPanelId);
    this.onFilterChange = onFilterChange;
    this.selectedSources = new Set();

    this.initGrid();
    this.bindEvents();
  }

  initGrid() {
    const grid = document.getElementById('sources-grid');
    if (!grid) return;

    grid.innerHTML = '';
    CONFIG.indexedSources.forEach(src => {
      const label = document.createElement('label');
      label.className = 'source-item';
      label.innerHTML = `
        <input type="checkbox" value="${src.domain}" class="source-check" />
        <span>${src.name}</span>
      `;

      const input = label.querySelector('input');
      input.addEventListener('change', () => {
        if (input.checked) {
          this.selectedSources.add(input.value);
        } else {
          this.selectedSources.delete(input.value);
        }
        this.triggerChange();
      });

      grid.appendChild(label);
    });
  }

  bindEvents() {
    this.sourcesBtn?.addEventListener('click', () => {
      const isOpen = this.sourcesPanel?.classList.toggle('open');
      this.sourcesBtn?.classList.toggle('active', isOpen);
    });
  }

  triggerChange() {
    this.onFilterChange?.({
      sources: Array.from(this.selectedSources)
    });
  }
}

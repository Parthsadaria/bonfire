/**
 * VIRGIL - SEARCH BAR COMPONENT
 */

export class SearchBarComponent {
  constructor({ formId, inputId, clearBtnId, onSearch }) {
    this.form = document.getElementById(formId);
    this.input = document.getElementById(inputId);
    this.clearBtn = document.getElementById(clearBtnId);
    this.onSearch = onSearch;

    this.bindEvents();
  }

  bindEvents() {
    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitSearch();
    });

    this.input?.addEventListener('input', () => {
      this.updateClearBtnVisibility();
    });

    this.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clear();
      }
    });

    this.clearBtn?.addEventListener('click', () => {
      this.clear();
      this.input?.focus();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.input && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        this.input?.focus();
        this.input?.select();
      }
    });
  }

  submitSearch() {
    const query = this.getValue();
    if (!query) return;
    this.onSearch?.(query);
  }

  getValue() {
    return this.input ? this.input.value.trim() : '';
  }

  setValue(val) {
    if (this.input) {
      this.input.value = val;
      this.updateClearBtnVisibility();
    }
  }

  clear() {
    if (this.input) {
      this.input.value = '';
      this.updateClearBtnVisibility();
    }
  }

  updateClearBtnVisibility() {
    if (this.clearBtn && this.input) {
      this.clearBtn.style.display = this.input.value ? 'block' : 'none';
    }
  }

  setPlaceholder(text) {
    if (this.input) {
      this.input.placeholder = text;
    }
  }
}

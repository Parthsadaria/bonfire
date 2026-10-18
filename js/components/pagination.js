/**
 * VIRGIL - PAGINATION
 */

export class PaginationComponent {
  constructor({ containerId, onPageChange }) {
    this.container = document.getElementById(containerId);
    this.onPageChange = onPageChange;
  }

  render(cursor) {
    if (!this.container) return;

    if (!cursor || !cursor.pages || cursor.pages.length <= 1) {
      this.container.style.display = 'none';
      this.container.innerHTML = '';
      return;
    }

    this.container.style.display = 'flex';
    this.container.innerHTML = '';

    const current = cursor.currentPageIndex || 0;
    (cursor.pages || []).forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.className = `page-btn ${idx === current ? 'active' : ''}`;
      btn.textContent = p.label;
      btn.onclick = () => this.onPageChange?.(idx);
      this.container.appendChild(btn);
    });
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.container.innerHTML = '';
    }
  }
}

/**
 * VIRGIL - MODAL MANAGER
 */

export class ModalManagerComponent {
  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const targetId = trigger.getAttribute('data-modal-target');
        const modal = document.getElementById(targetId);
        if (modal) modal.classList.add('open');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.modal-close')) {
          this.closeAll();
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  }

  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  openLightbox(src, alt) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
      img.src = src;
      img.alt = alt || '';
      modal.classList.add('open');
    }
  }
}

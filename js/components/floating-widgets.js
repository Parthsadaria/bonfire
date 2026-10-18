/**
 * VIRGIL - FLOATING WIDGETS COMPONENT
 * Controls bottom-left helper notification and bottom-right controls
 */

export class FloatingWidgetsComponent {
  constructor({ toastId, toastCloseId, onSteamClick }) {
    this.toast = document.getElementById(toastId);
    this.toastClose = document.getElementById(toastCloseId);
    this.onSteamClick = onSteamClick;

    this.bindEvents();
  }

  bindEvents() {
    if (this.toastClose && this.toast) {
      this.toastClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toast.style.display = 'none';
      });
    }

    if (this.toast) {
      this.toast.addEventListener('click', () => {
        if (typeof this.onSteamClick === 'function') {
          this.onSteamClick();
        }
      });
    }
  }

  hideToast() {
    if (this.toast) {
      this.toast.style.display = 'none';
    }
  }
}

/**
 * DuskMoon Dialog Element
 *
 * A modal dialog built on the native HTML <dialog> element.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 * HTML Invoker Commands (`command` / `commandfor`) are forwarded to the
 * inner native dialog so built-in show-modal / close / request-close work.
 *
 * @element el-dm-dialog
 *
 * @attr {boolean} open - Whether the dialog is open
 * @attr {string} size - Dialog size: sm, md, lg, xl, full
 * @attr {boolean} dismissible - Whether clicking backdrop closes dialog
 * @attr {boolean} no-dismiss - Prevents closing via backdrop click or Escape key
 * @attr {boolean} no-backdrop - Open as a non-modal dialog (no ::backdrop)
 *
 * @slot - Default slot for dialog content
 * @slot header - Dialog header/title
 * @slot footer - Dialog footer/actions
 *
 * @csspart dialog - The native dialog element
 * @csspart box - The inner dialog-box container
 * @csspart header - The header section
 * @csspart title - The title wrapper
 * @csspart body - The body section
 * @csspart footer - The footer section
 * @csspart close - The close button
 *
 * @fires open - Fired when dialog opens
 * @fires close - Fired when dialog closes
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as dialogCSS } from '@duskmoon-dev/core/components/dialog';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'dialog-sm',
  md: '',
  lg: 'dialog-lg',
  xl: 'dialog-xl',
  full: 'dialog-fullscreen',
};

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const coreStyles = dialogCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  dialog.dialog {
    font-family: inherit;
  }
`;

export class ElDmDialog extends BaseElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true, default: true },
    noDismiss: { type: Boolean, reflect: true, attribute: 'no-dismiss' },
    noBackdrop: { type: Boolean, reflect: true, attribute: 'no-backdrop' },
  };

  declare open: boolean;
  declare size: DialogSize;
  declare dismissible: boolean;
  declare noDismiss: boolean;
  declare noBackdrop: boolean;

  /** Ignore native close events fired while shadow DOM is being rebuilt. */
  private _syncing = false;

  /** Structural template key — open changes must not rebuild the dialog. */
  private _structureKey = '';

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('command', this._handleCommand);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this.removeEventListener('command', this._handleCommand);
  }

  private _canDismiss(): boolean {
    return this.dismissible && !this.noDismiss;
  }

  private _getDialog(): HTMLDialogElement | null {
    return this.query<HTMLDialogElement>('dialog');
  }

  private _getStructureKey(): string {
    return [this.size ?? '', this.dismissible ? '1' : '0', this.noDismiss ? '1' : '0'].join('|');
  }

  private _getDialogClasses(): string {
    const classes = ['dialog'];
    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }
    return classes.join(' ');
  }

  private _handleCancel = (event: Event): void => {
    if (!this._canDismiss()) {
      event.preventDefault();
    }
  };

  private _handleNativeClose = (): void => {
    if (this._syncing) return;
    if (!this.open) return;
    this.open = false;
    this.emit('close');
  };

  private _handleBackdropClick = (event: Event): void => {
    if (this._canDismiss() && event.target === event.currentTarget) {
      this.close();
    }
  };

  private _handleCloseClick = (): void => {
    this.close();
  };

  /**
   * Forward Invoker Commands to the native <dialog>.
   * commandfor points at this host; built-in dialog commands must run on the
   * inner HTMLDialogElement, not via a full show()/close() re-render cycle.
   */
  private _handleCommand = (event: Event): void => {
    const dialog = this._getDialog();
    if (!dialog) return;

    const command = 'command' in event ? String((event as { command: string }).command) : '';

    switch (command) {
      case 'show-modal':
        this._openNativeDialog(dialog, true);
        break;
      case 'show':
        this._openNativeDialog(dialog, false);
        break;
      case 'close':
        if (dialog.open) {
          dialog.close();
        }
        break;
      case 'request-close':
        this._requestNativeClose(dialog);
        break;
      case 'toggle':
        if (dialog.open) {
          dialog.close();
        } else {
          this._openNativeDialog(dialog, !this.noBackdrop);
        }
        break;
      default:
        break;
    }
  };

  private _openNativeDialog(dialog: HTMLDialogElement, modal: boolean): void {
    if (!dialog.open) {
      if (modal) {
        dialog.showModal();
      } else {
        dialog.show();
      }
    }

    if (!this.open) {
      this.open = true;
      this.emit('open');
    }
  }

  private _requestNativeClose(dialog: HTMLDialogElement): void {
    if (!dialog.open) return;

    const requestClose = (dialog as HTMLDialogElement & { requestClose?: () => void }).requestClose;

    if (typeof requestClose === 'function') {
      requestClose.call(dialog);
      return;
    }

    const cancel = new Event('cancel', { cancelable: true });
    const allowed = dialog.dispatchEvent(cancel);
    if (allowed && !cancel.defaultPrevented) {
      dialog.close();
    }
  }

  private _bindDialog(): void {
    const dialog = this._getDialog();
    if (!dialog) return;

    dialog.addEventListener('cancel', this._handleCancel);
    dialog.addEventListener('close', this._handleNativeClose);
    dialog.addEventListener('click', this._handleBackdropClick);
    this.query('.dialog-close')?.addEventListener('click', this._handleCloseClick);
  }

  private _syncNativeDialog(): void {
    const dialog = this._getDialog();
    if (!dialog) return;

    if (this.open && !dialog.open) {
      if (this.noBackdrop) {
        dialog.show();
      } else {
        dialog.showModal();
      }
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  show(): void {
    this.open = true;
    this.emit('open');
  }

  showModal(): void {
    this.show();
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.emit('close');
  }

  toggle(): void {
    if (this.open) {
      this.close();
    } else {
      this.show();
    }
  }

  render(): string {
    const dialogClasses = this._getDialogClasses();

    return `
      <dialog class="${dialogClasses}" part="dialog">
        <div class="dialog-box" part="box">
          <div class="dialog-header" part="header">
            <div class="dialog-title" part="title">
              <slot name="header"></slot>
            </div>
            ${
              this._canDismiss()
                ? '<button type="button" class="dialog-close" part="close" aria-label="Close">&times;</button>'
                : ''
            }
          </div>
          <div class="dialog-body" part="body">
            <slot></slot>
          </div>
          <div class="dialog-footer" part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </dialog>
    `;
  }

  update(): void {
    const key = this._getStructureKey();
    const dialog = this._getDialog();
    const needsRender = !dialog || key !== this._structureKey;

    this._syncing = true;
    try {
      if (needsRender) {
        super.update();
        this._structureKey = key;
        this._bindDialog();
      }
      this._syncNativeDialog();
    } finally {
      this._syncing = false;
    }
  }
}

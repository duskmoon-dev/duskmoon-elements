import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmTabs, register } from './index';

register();

// Helper to create keyboard events in happy-dom
function createKeyboardEvent(key: string, target: HTMLElement): KeyboardEvent {
  const event = new Event('keydown', { bubbles: true }) as KeyboardEvent;
  Object.defineProperty(event, 'key', { value: key, writable: false });
  Object.defineProperty(event, 'target', { value: target, writable: false });
  Object.defineProperty(event, 'preventDefault', {
    value: () => {},
    writable: false,
  });
  return event;
}

describe('ElDmTabs', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-tabs')).toBe(ElDmTabs);
  });

  test('creates a shadow root with tablist', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    container.appendChild(el);

    const tablist = el.shadowRoot?.querySelector('[role="tablist"]');
    expect(tablist).toBeDefined();
  });

  test('has tab and default slots', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    container.appendChild(el);

    const tabSlot = el.shadowRoot?.querySelector('slot[name="tab"]');
    const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(tabSlot).toBeDefined();
    expect(defaultSlot).toBeDefined();
  });

  test('reflects value attribute', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab-1';
    container.appendChild(el);

    expect(el.getAttribute('value')).toBe('tab-1');
  });

  test('reflects variant attribute', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.variant = 'pills';
    container.appendChild(el);

    expect(el.getAttribute('variant')).toBe('pills');
  });

  test('reflects orientation attribute', () => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.orientation = 'vertical';
    container.appendChild(el);

    expect(el.getAttribute('orientation')).toBe('vertical');
  });

  // ============ Tab Selection ============

  test('initializes with first tab selected when no value set', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');
    tab1.textContent = 'Tab 1';

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');
    tab2.textContent = 'Tab 2';

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    // Wait for requestAnimationFrame
    setTimeout(() => {
      expect(el.value).toBe('tab1');
      done();
    }, 50);
  });

  test('respects initial value attribute', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab2';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      expect(el.value).toBe('tab2');
      expect(tab2.hasAttribute('active')).toBe(true);
      expect(tab1.hasAttribute('active')).toBe(false);
      done();
    }, 50);
  });

  test('changes tab on click', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      // Simulate tab click by dispatching custom event
      const clickEvent = new CustomEvent('tab-click', {
        detail: { tabId: 'tab2' },
        bubbles: true,
      });
      tab2.dispatchEvent(clickEvent);

      setTimeout(() => {
        expect(el.value).toBe('tab2');
        done();
      }, 10);
    }, 50);
  });

  test('emits change event when tab changes', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    let changeDetail: any = null;
    el.addEventListener('change', ((e: CustomEvent) => {
      changeDetail = e.detail;
    }) as EventListener);

    setTimeout(() => {
      const clickEvent = new CustomEvent('tab-click', {
        detail: { tabId: 'tab2' },
        bubbles: true,
      });
      tab2.dispatchEvent(clickEvent);

      setTimeout(() => {
        expect(changeDetail).toBeDefined();
        expect(changeDetail.value).toBe('tab2');
        expect(changeDetail.oldValue).toBe('tab1');
        done();
      }, 10);
    }, 50);
  });

  test('does not emit change when clicking same tab', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    el.appendChild(tab1);
    container.appendChild(el);

    let changeCount = 0;
    el.addEventListener('change', () => {
      changeCount++;
    });

    setTimeout(() => {
      const clickEvent = new CustomEvent('tab-click', {
        detail: { tabId: 'tab1' },
        bubbles: true,
      });
      tab1.dispatchEvent(clickEvent);

      setTimeout(() => {
        expect(changeCount).toBe(0);
        done();
      }, 10);
    }, 50);
  });

  // ============ Panel Visibility ============

  test('shows active panel and hides others', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    const panel1 = document.createElement('el-dm-tab-panel');
    panel1.setAttribute('panel-for', 'tab1');
    panel1.textContent = 'Panel 1';

    const panel2 = document.createElement('el-dm-tab-panel');
    panel2.setAttribute('panel-for', 'tab2');
    panel2.textContent = 'Panel 2';

    el.appendChild(tab1);
    el.appendChild(tab2);
    el.appendChild(panel1);
    el.appendChild(panel2);
    container.appendChild(el);

    setTimeout(() => {
      expect(panel1.hasAttribute('active')).toBe(true);
      expect(panel1.hasAttribute('hidden')).toBe(false);
      expect(panel2.hasAttribute('active')).toBe(false);
      expect(panel2.hasAttribute('hidden')).toBe(true);
      done();
    }, 50);
  });

  // ============ Keyboard Navigation ============

  test('navigates to next tab with ArrowRight in horizontal mode', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.orientation = 'horizontal';
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');
    tab1.tabIndex = 0;

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');
    tab2.tabIndex = -1;

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      const keyEvent = createKeyboardEvent('ArrowRight', tab1);
      el.dispatchEvent(keyEvent);

      setTimeout(() => {
        expect(el.value).toBe('tab2');
        done();
      }, 10);
    }, 50);
  });

  test('navigates to previous tab with ArrowLeft in horizontal mode', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.orientation = 'horizontal';
    el.value = 'tab2';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      const keyEvent = createKeyboardEvent('ArrowLeft', tab2);
      el.dispatchEvent(keyEvent);

      setTimeout(() => {
        expect(el.value).toBe('tab1');
        done();
      }, 10);
    }, 50);
  });

  test('wraps around with ArrowRight at last tab', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.orientation = 'horizontal';
    el.value = 'tab2';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      const keyEvent = createKeyboardEvent('ArrowRight', tab2);
      el.dispatchEvent(keyEvent);

      setTimeout(() => {
        expect(el.value).toBe('tab1');
        done();
      }, 10);
    }, 50);
  });

  test('navigates with Home key', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab3';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    const tab3 = document.createElement('el-dm-tab');
    tab3.setAttribute('tab-id', 'tab3');

    el.appendChild(tab1);
    el.appendChild(tab2);
    el.appendChild(tab3);
    container.appendChild(el);

    setTimeout(() => {
      const keyEvent = createKeyboardEvent('Home', tab3);
      el.dispatchEvent(keyEvent);

      setTimeout(() => {
        expect(el.value).toBe('tab1');
        done();
      }, 10);
    }, 50);
  });

  test('navigates with End key', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    const tab3 = document.createElement('el-dm-tab');
    tab3.setAttribute('tab-id', 'tab3');

    el.appendChild(tab1);
    el.appendChild(tab2);
    el.appendChild(tab3);
    container.appendChild(el);

    setTimeout(() => {
      const keyEvent = createKeyboardEvent('End', tab1);
      el.dispatchEvent(keyEvent);

      setTimeout(() => {
        expect(el.value).toBe('tab3');
        done();
      }, 10);
    }, 50);
  });

  // ============ Vertical Orientation ============

  test('uses ArrowDown/ArrowUp in vertical mode', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.orientation = 'vertical';
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      const keyEvent = createKeyboardEvent('ArrowDown', tab1);
      el.dispatchEvent(keyEvent);

      setTimeout(() => {
        expect(el.value).toBe('tab2');
        done();
      }, 10);
    }, 50);
  });

  test('ignores ArrowRight/ArrowLeft in vertical mode', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.orientation = 'vertical';
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      const keyEvent = createKeyboardEvent('ArrowRight', tab1);
      el.dispatchEvent(keyEvent);

      setTimeout(() => {
        // Should not change
        expect(el.value).toBe('tab1');
        done();
      }, 10);
    }, 50);
  });

  // ============ ARIA Attributes ============

  test('sets aria-selected on active tab', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      expect(tab1.getAttribute('aria-selected')).toBe('true');
      expect(tab2.getAttribute('aria-selected')).toBe('false');
      done();
    }, 50);
  });

  test('sets tabindex correctly on tabs', (done) => {
    const el = document.createElement('el-dm-tabs') as ElDmTabs;
    el.value = 'tab1';

    const tab1 = document.createElement('el-dm-tab');
    tab1.setAttribute('tab-id', 'tab1');

    const tab2 = document.createElement('el-dm-tab');
    tab2.setAttribute('tab-id', 'tab2');

    el.appendChild(tab1);
    el.appendChild(tab2);
    container.appendChild(el);

    setTimeout(() => {
      expect(tab1.getAttribute('tabindex')).toBe('0');
      expect(tab2.getAttribute('tabindex')).toBe('-1');
      done();
    }, 50);
  });
});

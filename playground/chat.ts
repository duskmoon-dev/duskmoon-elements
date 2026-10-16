import '@duskmoon-dev/el-button/register';
import { register } from '@duskmoon-dev/el-chat';
import type {
  ElDmChat,
  ElDmChatInput,
  ElDmChatQueue,
  ChatQueueItem,
  ChatSendEventDetail,
} from '@duskmoon-dev/el-chat';

register();

function initializeChatDesign(): void {
  document.querySelectorAll<HTMLElement>('.chat-design-demo').forEach((demo) => {
    if (demo.dataset.initialized) return;
    demo.dataset.initialized = 'true';
    const transcript = demo.querySelector('el-dm-chat-scroll')!;
    const composer = demo.querySelector<ElDmChatInput>('el-dm-chat-input')!;
    const queue = demo.querySelector<ElDmChatQueue>('el-dm-chat-queue')!;
    const status = demo.querySelector<HTMLElement>('[data-status]')!;
    const complete = demo.querySelector<HTMLButtonElement>('[data-complete]')!;
    let nextId = 3;
    let items: ChatQueueItem[] = [
      { id: 'waiting-1', content: 'Also check keyboard focus.' },
      { id: 'waiting-2', content: 'Include the mobile layout.' },
    ];
    const refresh = () => {
      queue.items = items.map((item, index) => ({ ...item, active: index === 0 }));
      status.textContent = `${items.length} message${items.length === 1 ? '' : 's'} waiting. ${composer.busy ? 'Reply in progress.' : 'Ready for a message.'}`;
      complete.disabled = !composer.busy;
    };
    const appendUser = (value: string) => {
      const message = document.createElement('el-dm-chat') as ElDmChat;
      message.align = 'end';
      message.color = 'primary';
      message.collapsible = true;
      message.textContent = value;
      transcript.append(message);
    };
    const startReply = () => {
      const reply = document.createElement('el-dm-chat') as ElDmChat;
      reply.agent = true;
      reply.author = 'Assistant';
      reply.content = 'Working on the next message…';
      transcript.append(reply);
      composer.busy = true;
    };
    composer.addEventListener('send', (event) => {
      const { value, files } = (event as CustomEvent<ChatSendEventDetail>).detail;
      const content = value || files.map((file) => file.name).join(', ');
      if (composer.busy) items = [...items, { id: `waiting-${nextId++}`, content }];
      else {
        appendUser(content);
        startReply();
      }
      refresh();
    });
    composer.addEventListener('steer', (event) => {
      if (event.target !== composer) return;
      const { value, files } = (event as CustomEvent<ChatSendEventDetail>).detail;
      appendUser(value || files.map((file) => file.name).join(', '));
      refresh();
    });
    for (const action of ['steer', 'remove']) {
      queue.addEventListener(action, (event) => {
        const { item } = (event as CustomEvent<{ item: ChatQueueItem }>).detail;
        if (action === 'steer') appendUser(item.content);
        items = items.filter((queued) => queued.id !== item.id);
        refresh();
        if (!items.length) composer.focus();
      });
    }
    complete.addEventListener('click', () => {
      const next = items[0];
      items = items.slice(1);
      if (next) {
        appendUser(next.content);
        startReply();
      } else composer.busy = false;
      refresh();
    });
    refresh();
  });
}

initializeChatDesign();
document.addEventListener('astro:page-load', initializeChatDesign);

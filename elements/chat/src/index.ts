/**
 * @duskmoon-dev/el-chat
 *
 * DuskMoon chat custom elements.
 */

import {
  ElDmChat,
  ElDmChatBubble,
  ElDmChatInput,
  ElDmChatReasoning,
  ElDmChatTool,
  ElDmChatTyping,
} from './el-dm-chat.js';

export { ElDmChat, ElDmChatBubble, ElDmChatInput, ElDmChatReasoning, ElDmChatTool, ElDmChatTyping };
export type {
  ChatAlign,
  ChatBubbleColor,
  ChatBubbleSize,
  ChatBubbleVariant,
  ChatQuickActionEventDetail,
  ChatSendEventDetail,
  ChatToolStatus,
} from './el-dm-chat.js';

/**
 * Register all chat-related custom elements.
 */
export function register(): void {
  if (!customElements.get('el-dm-chat')) {
    customElements.define('el-dm-chat', ElDmChat);
  }
  if (!customElements.get('el-dm-chat-bubble')) {
    customElements.define('el-dm-chat-bubble', ElDmChatBubble);
  }
  if (!customElements.get('el-dm-chat-input')) {
    customElements.define('el-dm-chat-input', ElDmChatInput);
  }
  if (!customElements.get('el-dm-chat-reasoning')) {
    customElements.define('el-dm-chat-reasoning', ElDmChatReasoning);
  }
  if (!customElements.get('el-dm-chat-tool')) {
    customElements.define('el-dm-chat-tool', ElDmChatTool);
  }
  if (!customElements.get('el-dm-chat-typing')) {
    customElements.define('el-dm-chat-typing', ElDmChatTyping);
  }
}

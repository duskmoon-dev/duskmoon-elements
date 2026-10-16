# @duskmoon-dev/el-chat

DuskMoon chat custom elements for LLM-oriented chat interfaces.

## Elements

- `el-dm-chat`
- `el-dm-chat-scroll`
- `el-dm-chat-bubble`
- `el-dm-chat-input`
- `el-dm-chat-work`
- `el-dm-chat-queue`
- `el-dm-chat-reasoning`
- `el-dm-chat-tool`
- `el-dm-chat-typing`

## Usage

```ts
import { register } from '@duskmoon-dev/el-chat';

register();
```

```html
<el-dm-chat-scroll style="height: 22rem">
  <el-dm-chat agent timeline="1" author="Assistant" content="Hello from **DuskMoon**.">
    <el-dm-chat-reasoning slot="reasoning" summary="Thinking">
      Reviewing the request.
      <el-dm-chat-tool slot="tools" name="search" status="success"></el-dm-chat-tool>
    </el-dm-chat-reasoning>
  </el-dm-chat>

  <el-dm-chat align="end" color="primary" variant="filled"> Thanks! </el-dm-chat>
</el-dm-chat-scroll>
```

Assistant messages may use unique `timeline` values from `1` through `24`. The scroll wrapper
creates an accessible indicator for each mapped assistant reply and keeps indicator navigation
inside the transcript panel. Use the `reasoning` and `tools` slots to place collapsible LLM details
before the final markdown content.

## Current DuskMoonUI design

Use `agent` on assistant messages for unboxed answers. Assign `el-dm-chat-work` to
`slot="work"` to keep activity collapsible independently of the final answer. User
messages can opt into `collapsible`; a native Show more/Show less button appears
when the message exceeds six rendered lines.

```html
<el-dm-chat agent content="The final answer stays visible.">
  <el-dm-chat-work slot="work" summary="Worked · 2 checks">
    <el-dm-chat-tool name="search" status="success"></el-dm-chat-tool>
  </el-dm-chat-work>
</el-dm-chat>
<el-dm-chat-input busy color="ghost" auto-grow clear-on-send>
  <el-dm-chat-queue slot="queue" label="Waiting messages"></el-dm-chat-queue>
</el-dm-chat-input>
```

Set queue `items` to `{ id, content, active?, attachment?, attachmentAlt? }[]`.
Queue `steer` and `remove` events contain `{ item, index }`; the application updates
its queue and owns dispatch. Composer `send` and `steer` events contain `{ value,
files }`. Enter sends/queues, Shift+Enter inserts a newline, and Ctrl/Cmd+Enter
steers while `busy` or sends while idle. IME composition never submits. Cancel a
draft event with `preventDefault()` to retain its text and files; `clear-on-send`
clears only accepted drafts. `focus()` focuses the native editor.

All presentation uses Core Chat, Button, and Avatar styles with Shadow DOM bridges.

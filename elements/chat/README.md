# @duskmoon-dev/el-chat

DuskMoon chat custom elements for LLM-oriented chat interfaces.

## Elements

- `el-dm-chat`
- `el-dm-chat-scroll`
- `el-dm-chat-bubble`
- `el-dm-chat-input`
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
  <el-dm-chat timeline="1" author="Assistant" content="Hello from **DuskMoon**.">
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

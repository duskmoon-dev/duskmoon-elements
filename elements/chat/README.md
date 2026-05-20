# @duskmoon-dev/el-chat

DuskMoon chat custom elements for LLM-oriented chat interfaces.

## Elements

- `el-dm-chat`
- `el-dm-chat-bubble`
- `el-dm-chat-reasoning`
- `el-dm-chat-tool`
- `el-dm-chat-typing`

## Usage

```ts
import { register } from '@duskmoon-dev/el-chat';

register();
```

```html
<el-dm-chat align="end" color="primary" variant="filled">
  <span slot="header">Assistant</span>
  Hello from DuskMoon.
</el-dm-chat>
```

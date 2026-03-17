import { ElDmArtGeminiInput } from './el-dm-art-gemini-input.js';

export { ElDmArtGeminiInput };

export function register(): void {
  if (!customElements.get('el-dm-art-gemini-input')) {
    customElements.define('el-dm-art-gemini-input', ElDmArtGeminiInput);
  }
}

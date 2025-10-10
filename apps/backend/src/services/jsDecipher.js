// You had: export default JsDecipher = new JsDecipher();

import vm from 'vm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class JsDecipher {
  constructor() {
    this.ready = false;
    this.fnName = null;
    this.source = null;
    this.ctx = null;
    this.cachePath = path.join(__dirname, '..', 'tmp', 'player_js_cache.js');
    try { fs.mkdirSync(path.dirname(this.cachePath), { recursive: true }); } catch (e) {}
  }

  prepareFromSource(jsCode) {
    this.source = jsCode;
    const m = jsCode.match(/\b([A-Za-z0-9_$]{2,})=function\(a\)\{a=a\.split\(""\)/);
    if (!m) throw new Error('Decipher function not found');
    this.fnName = m[1];

    const bodyMatch = new RegExp(this.fnName + '\\s*=\\s*function\\(a\\)\\{([\\s\\S]*?)\\}').exec(jsCode);
    if (!bodyMatch) throw new Error('Function body not found');
    const fnBody = bodyMatch[1];

    const execSrc = `function __dec(a){${fnBody}}`;
    this.ctx = {};
    vm.createContext(this.ctx);
    vm.runInContext(execSrc, this.ctx);

    this.ready = true;
  }

  loadCacheIfExists() {
    if (this.ready) return;
    try {
      if (fs.existsSync(this.cachePath)) {
        const src = fs.readFileSync(this.cachePath, 'utf8');
        this.prepareFromSource(src);
      }
    } catch (e) {}
  }

  async decipher(sig) {
    if (!this.ready) this.loadCacheIfExists();
    if (!this.ready) throw new Error('Decipher not prepared');
    try {
      return String(this.ctx.__dec(String(sig)));
    } catch (e) {
      throw new Error('Decipher execution failed: ' + (e?.message || e));
    }
  }
}

// ✅ Correct way to export instance
const decipher = new JsDecipher();
export { JsDecipher };
export default decipher;

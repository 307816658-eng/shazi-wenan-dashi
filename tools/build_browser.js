'use strict';

/**
 * 把 lib/ 打包成浏览器能直接用的一个文件。
 *
 * 为什么要打包：
 *   lib/ 全部是 CommonJS（require / module.exports），浏览器不认。
 *   但好处是 lib/ 里**没有任何 Node 内置模块依赖**（刻意如此），
 *   所以不需要 webpack/rollup，自己写个百来行的翻译器就够，
 *   还不用给项目引入 node_modules。
 *
 * 做法：
 *   每个文件包成 __def('模块id', function(module, exports, require){ 源码 })
 *   require 只支持相对路径（'./xxx'、'../xxx'），这也是 lib 里唯一用到的形式。
 *   最后取 core 作为入口，挂到 window.SWD_LIB。
 *
 * 用法：node tools/build_browser.js
 * 产出：public/lib.bundle.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LIB = path.join(ROOT, 'lib');
const OUT = path.join(ROOT, 'public', 'lib.bundle.js');

/** 入口与其依赖的闭包 —— 顺序无所谓，打包器自己会解析依赖 */
const ENTRY = 'core';

/* ------------------------------ 收集源码 ------------------------------ */

function readModule(id) {
  const p = path.join(LIB, id + '.js');
  if (!fs.existsSync(p)) throw new Error('找不到模块文件：' + p);
  return fs.readFileSync(p, 'utf8');
}

/** 在源码里找 require('...')，只认静态字符串 */
function scanDeps(src) {
  const out = [];
  const re = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

/** './industries/fashion' 这类相对路径 → 规范化的模块 id */
function resolveId(fromId, spec) {
  if (!/^\.\.?\//.test(spec)) {
    throw new Error('不支持的 require 形式（浏览器包只允许相对路径）：' + spec + '（来自 ' + fromId + '）');
  }
  const fromDir = path.posix.dirname(fromId);
  let id = path.posix.normalize(path.posix.join(fromDir, spec));
  // 允许 require('./industries') → industries/index
  if (fs.existsSync(path.join(LIB, id + '.js'))) return id;
  if (fs.existsSync(path.join(LIB, id, 'index.js'))) return id + '/index';
  throw new Error('解析不到模块：' + spec + '（来自 ' + fromId + '）');
}

/* ------------------------------ 生成 ------------------------------ */

function collect(entry) {
  const mods = new Map();
  const queue = [entry];
  while (queue.length) {
    const id = queue.shift();
    if (mods.has(id)) continue;
    const src = readModule(id);
    mods.set(id, src);
    for (const spec of scanDeps(src)) {
      const dep = resolveId(id, spec);
      if (!mods.has(dep)) queue.push(dep);
    }
  }
  return mods;
}

/** 源码里出现 </script> 会提前截断 HTML 里的内联脚本，虽然我们是外链，但保险起见还是转义 */
function guardScriptTag(src) {
  return src.replace(/<\/script/gi, '<\\/script');
}

function build() {
  const mods = collect(ENTRY);
  const ids = Array.from(mods.keys()).sort();

  // 检查有没有模块偷偷 require 了 Node 内置模块（会静默失败在浏览器里）
  const builtin = /^require\(\s*['"](fs|path|os|http|https|crypto|child_process|url|util|net)['"]\s*\)/m;
  for (const id of ids) {
    if (builtin.test(mods.get(id))) {
      throw new Error('模块 ' + id + ' require 了 Node 内置模块，浏览器里跑不了');
    }
  }

  const parts = [];
  parts.push('/* 傻子文案大师 —— 浏览器端 lib 打包产物（自动生成，别手改）');
  parts.push(' * 生成命令：node tools/build_browser.js');
  parts.push(' * 源文件：lib/ 共 ' + ids.length + ' 个模块');
  parts.push(' * 生成时间：' + new Date().toISOString().slice(0, 19).replace('T', ' '));
  parts.push(' */');
  parts.push('(function (global) {');
  parts.push("  'use strict';");
  parts.push('  var __defs = {};');
  parts.push('  var __cache = {};');
  parts.push('');
  parts.push('  function __resolve(spec, fromId) {');
  parts.push("    var segs = fromId.split('/'); segs.pop();");
  parts.push("    var parts = spec.split('/');");
  parts.push('    for (var i = 0; i < parts.length; i++) {');
  parts.push("      var p = parts[i];");
  parts.push("      if (p === '.' || p === '') continue;");
  parts.push("      if (p === '..') segs.pop(); else segs.push(p);");
  parts.push('    }');
  parts.push("    return segs.join('/');");
  parts.push('  }');
  parts.push('');
  parts.push('  function __require(id, fromId) {');
  parts.push("    var real = id.charAt(0) === '.' ? __resolve(id, fromId) : id;");
  parts.push('    if (__cache[real]) return __cache[real].exports;');
  parts.push('    var def = __defs[real];');
  parts.push('    var alt = __defs[real + "/index"];');
  parts.push('    if (!def && alt) { real = real + "/index"; def = alt; }');
  parts.push("    if (!def) throw new Error('模块没打进包里: ' + real);");
  parts.push('    var mod = { exports: {} };');
  parts.push('    __cache[real] = mod;');
  parts.push('    def.call(mod.exports, mod, mod.exports, function (s) { return __require(s, real); });');
  parts.push('    return mod.exports;');
  parts.push('  }');
  parts.push('');

  for (const id of ids) {
    parts.push('  /* ---------- ' + id + ' ---------- */');
    parts.push("  __defs['" + id + "'] = function (module, exports, require) {");
    parts.push(guardScriptTag(mods.get(id)));
    parts.push('  };');
    parts.push('');
  }

  parts.push("  global.SWD_LIB = __require('" + ENTRY + "', '');");
  parts.push("  global.SWD_LIB.__modules = Object.keys(__defs);");
  parts.push("})(typeof window !== 'undefined' ? window : this);");
  parts.push('');

  const code = parts.join('\n');
  fs.writeFileSync(OUT, code, 'utf8');

  const kb = (Buffer.byteLength(code, 'utf8') / 1024).toFixed(1);
  console.log('✓ 打包完成：public/lib.bundle.js');
  console.log('  模块 ' + ids.length + ' 个，共 ' + kb + ' KB');
  console.log('  入口：' + ENTRY);
  return { count: ids.length, kb: Number(kb) };
}

if (require.main === module) {
  build();
}

module.exports = { build };

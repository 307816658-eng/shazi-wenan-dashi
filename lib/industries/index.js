'use strict';

/**
 * 行业包静态注册表。
 *
 * ⚠️ 这里必须一个一个静态 require，不能写 require('./' + id)：
 *    Cloudflare Pages Functions 用 esbuild 打包，动态拼路径的 require 无法静态分析，
 *    打包时不会把行业包带进去，线上会直接报「模块找不到」。
 * 新增一个行业 = 加一个 require + 在 PACKS 里加一行，前后端和测试都不用改。
 *
 * HOT：首页第一屏显示的行业（顺序即展示顺序），其余收在「更多行业」里。
 * FALLBACK：导购找不到自己行业时的兜底，永远排在最后，不进热门位。
 */

const fashion = require('./fashion');
const food = require('./food');
const home = require('./home');
const appliance = require('./appliance');
const beauty = require('./beauty');
const fitness = require('./fitness');
const maternal = require('./maternal');
const pet = require('./pet');
const auto = require('./auto');
const flower = require('./flower');
const jewelry = require('./jewelry');
const digital = require('./digital');
const photo = require('./photo');
const optical = require('./optical');
const cleaning = require('./cleaning');
const tea = require('./tea');
const other = require('./other');

const PACKS = {
  fashion, food, home, appliance,
  beauty, fitness, maternal, pet,
  auto, flower, jewelry, digital,
  photo, optical, cleaning, tea,
  other
};
const DEFAULT_ID = 'fashion';
const HOT = ['fashion', 'food', 'home', 'appliance', 'beauty', 'fitness'];
const FALLBACK_ID = 'other';

/** 给首页渲染的行业卡片（不含庞大的选项树，省流量） */
function list() {
  return Object.keys(PACKS).map((id) => {
    const p = PACKS[id];
    return {
      id: p.id,
      label: p.label,
      emoji: p.emoji,
      hot: HOT.includes(id),
      fallback: id === FALLBACK_ID,
      subTypes: p.subTypes.map((s) => ({ id: s.id, label: s.label }))
    };
  });
}

function has(id) {
  return Object.prototype.hasOwnProperty.call(PACKS, id);
}

/** 非法行业一律静默回落到服装，用户不该看到技术报错 */
function get(id) {
  return has(id) ? PACKS[id] : PACKS[DEFAULT_ID];
}

/** 业态合法性校验 */
function hasSubType(pack, subTypeId) {
  return !subTypeId || pack.subTypes.some((s) => s.id === subTypeId);
}

module.exports = { PACKS, DEFAULT_ID, HOT, FALLBACK_ID, list, get, has, hasSubType };

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const engine = moduleName => require(path.join(output, moduleName));

/** Inspect only the pinned Shopping Center implementation and available action classes. */
function inspect() {
  const manager = initializeCards();
  const shop = manager.getCardByName('Shopping Center EVS');
  assert.ok(shop, 'Pinned engine lacks exact rank11 Shopping Center EVS');
  const reducers = shop.reduceEffect.toString();
  const actions = {};
  for(const pathPart of [
    'game/store/actions/game-actions',
    'game/store/actions/play-card-action',
    'game/store/actions/use-ability-action',
    'game/store/actions/resolve-prompt-action'
  ]) {
    try {
      actions[pathPart] = Object.keys(engine(pathPart));
    } catch(error) {
      actions[pathPart] = ['unavailable: ' + error.code];
    }
  }
  return {
    fullName:shop.fullName,
    cardClass:shop.constructor.name,
    methods:Object.getOwnPropertyNames(Object.getPrototypeOf(shop)),
    reducerSource:reducers.slice(0,9500),
    actions
  };
}

if(require.main === module) process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
module.exports={inspect};

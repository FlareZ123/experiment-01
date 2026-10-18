'use strict';

const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {withExpandedActionOptions}=require('./policy-profiles.cjs');
const {installPinnedTacticEvaluationObserver}=
  require('./decision-tactic-evaluation-observer.cjs');
const {SEED}=require('./rank2-turn5-source-fork-observer.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
const names=new Set(['Guzma & Hala CEC','Bellelba & Brycen-Man CEC']);

/**
 * Count root bot calls, preserving the original action and evaluation.
 * @template T
 * @param {()=>T} fn
 * @returns {{result:T,matches:object[],calls:number}}
 */
function discoverRootSupporterOrdinal(fn) {
  const proto=SimpleTacticsAi.prototype;
  const old=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  let calls=0;
  const matches=[];
  function observed(state) {
    const ordinal=++calls;
    const hand=state.players[1].hand.cards.map(c=>c.fullName);
    const focus=state.turn===5 && state.activePlayer===1 &&
      hand.includes('Guzma & Hala CEC') &&
      hand.includes('Bellelba & Brycen-Man CEC') &&
      hand.includes('Stoutland BCR') &&
      !state.prompts.some(p=>p.result===undefined);

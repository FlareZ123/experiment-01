'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent3-ko-effect-prompt-provenance-v1';

/**
 * Passive, bounded correlation of a real Store's KnockOutEffect with an
 * ensuing Prize prompt and its settled native answer. This is a provenance
 * candidate, not unique proof of checkState origin or paper legality.
 *
 * @template T
 * @param {()=>T} execute Synchronous native Store experiment.
 * @param {{Store?:Function,GameMessage?:object}} [deps] Native modules or tests.
 * @returns {{result:T,audit:object}}
 */
function withKoEffectPromptProvenance(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const output = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ??
    require(path.join(output, 'game/store/store')).Store;
  const GameMessage = deps.GameMessage ??
    require(path.join(output, 'game/game-message')).GameMessage;
  const proto = Store.prototype;
  const original = Object.fromEntries(['dispatch','reduceEffect','prompt']
    .map(name => [name,Object.getOwnPropertyDescriptor(proto,name)]));
  for (const name of Object.keys(original)) {
    assert.equal(typeof original[name]?.value,'function');
    assert.equal(original[name].configurable,true);
  }
  const pending = new WeakMap();
  const issued = new WeakMap();
  let liveStore = null;
  let rootDepth = 0;
  const audit = {
    version:VERSION,
    eligibleKoEffects:0,
    koCorrelatedPrompts:0,
    settledKoCorrelatedAnswers:0,
    unsettledKoCorrelatedAnswers:0,
    unrelatedPrizePrompts:0,
    bySeat:{0:0,1:0},
    realStoreIdentityProofComplete:false,
    uniqueCheckStateOriginCertified:false,
    paperKoCertified:false,
    competitivelyQualifiedGames:0
  };

  function reduceEffect(state,effect,...args) {
    const realRoot = this === liveStore && rootDepth > 0 &&
      this.calculatingPlayability !== true;
    const candidate = realRoot &&
      effect?.constructor?.name === 'KnockOutEffect';
    const returned = original.reduceEffect.value.apply(this,
      [state,effect,...args]);
    if (candidate && effect.preventDefault === false &&
        Number.isSafeInteger(effect.prizeCount) && effect.prizeCount > 0) {
      const owner = state.players.find(p=>p.id === effect.player?.id);
      const taker = state.players.find(p=>p.id !== effect.player?.id);
      if (owner && taker) {
        const events = pending.get(this) ?? [];
        events.push({playerId:taker.id,
          destination:effect.prizeDestination ?? taker.hand,
          count:effect.prizeCount});
        pending.set(this,events);
        audit.eligibleKoEffects++;
      }
    }
    return returned;
  }

  function prompt(state,prompts,...args) {
    const list = Array.isArray(prompts) ? prompts : [prompts];
    const realRoot = this === liveStore && rootDepth > 0;
    const events = pending.get(this) ?? [];
    const correlations = [];
    if (realRoot) for (const p of list) {
      if (p?.constructor?.name !== 'ChoosePrizePrompt' ||
          p.message !== GameMessage.CHOOSE_PRIZE_CARD) continue;
      const matches = events.filter(e => e.playerId === p.playerId &&
        e.destination === p.options?.destination);
      const enough = matches.length > 0 &&
        matches.reduce((n,e)=>n+e.count,0) >= p.options?.count;
      correlations.push({prompt:p,matched:enough,
        playerId:p.playerId});
      if (enough) {
        for (const item of matches) events.splice(events.indexOf(item),1);
      }
    }
    const returned = original.prompt.value.apply(this,[state,prompts,...args]);
    for (const c of correlations) {
      if (c.matched) {
        issued.set(c.prompt,true);
        audit.koCorrelatedPrompts++;
      } else audit.unrelatedPrizePrompts++;
    }
    return returned;
  }

  function dispatch(action,...args) {
    if (action?.constructor?.name === 'AddPlayerAction') liveStore = this;
    const realRoot = this === liveStore;
    const state = this.state;
    const question = realRoot &&
      action?.constructor?.name === 'ResolvePromptAction'
      ? state.prompts?.find(p => p.id === action.id &&
        p.result === undefined && issued.has(p))
      : null;
    if (realRoot) rootDepth++;
    let returned;
    try {
      returned = original.dispatch.value.apply(this,[action,...args]);
    } finally {
      if (realRoot) rootDepth--;
    }
    if (question) {
      if (question.result === action.result) {
        audit.settledKoCorrelatedAnswers++;
        const seat = state.players.findIndex(p=>p.id===question.playerId);
        if (seat===0 || seat===1) audit.bySeat[seat]++;
      } else audit.unsettledKoCorrelatedAnswers++;
    }
    return returned;
  }

  Object.defineProperty(proto,'dispatch',{...original.dispatch,value:dispatch});
  Object.defineProperty(proto,'reduceEffect',
    {...original.reduceEffect,value:reduceEffect});
  Object.defineProperty(proto,'prompt',{...original.prompt,value:prompt});
  try { return {result:execute(),audit}; }
  catch(error) {
    if (error && typeof error === 'object')
      error.agent3KoProvenanceAudit = {...audit,aborted:true};
    throw error;
  } finally {
    Object.defineProperty(proto,'prompt',original.prompt);
    Object.defineProperty(proto,'reduceEffect',original.reduceEffect);
    Object.defineProperty(proto,'dispatch',original.dispatch);
  }
}

module.exports = {VERSION,withKoEffectPromptProvenance};

'use strict';

const crypto = require('node:crypto');
const {sourceZoneSnapshot} = require('./source-zone-checkpoint.cjs');

/**
 * Observe the mutable attack-history field on every physical card, including
 * cards in hidden zones. The observation is detached and never feeds the bot.
 * @param {object[]|object} list
 * @returns {object[]}
 */
function cardHistory(list) {
  const cards = Array.isArray(list) ? list : list.cards;
  return cards.map(c => ({
    printing:c.fullName,
    damageTakenLastTurn:c.damageTakenLastTurn ?? null
  }));
}

/** @param {object} player @returns {object} */
function historyZones(player) {
  return {
    deck:cardHistory(player.deck),hand:cardHistory(player.hand),
    discard:cardHistory(player.discard),lostzone:cardHistory(player.lostzone),
    stadium:cardHistory(player.stadium),supporter:cardHistory(player.supporter),
    prizes:player.prizes.map(cardHistory),
    active:cardHistory(player.active.cards),
    bench:player.bench.map(slot => cardHistory(slot.cards))
  };
}

/** @param {object} state @returns {object} */
function observableState(state) {
  if (state.players.length !== 2) {
    return {phase:state.phase,turn:state.turn,
      activePlayer:state.activePlayer,playerCount:state.players.length};
  }
  return {
    zones:sourceZoneSnapshot(state),
    cardHistory:state.players.map(historyZones)
  };
}

/** @param {unknown} data @returns {string} */
function hash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Return one named discrepancy. This is diagnostic evidence only.
 * @param {unknown} a
 * @param {unknown} b
 * @param {string} prefix
 * @returns {object|null}
 */
function firstMismatch(a,b,prefix='$') {
  if (Object.is(a,b)) return null;
  if (a === null || b === null || typeof a !== 'object' ||
      typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) {
    return {path:prefix,before:a,after:b};
  }
  if (Array.isArray(a) && a.length !== b.length) {
    return {path:prefix+'.length',before:a.length,after:b.length};
  }
  const keys=Array.from(new Set([...Object.keys(a),...Object.keys(b)])).sort();
  for (const key of keys) {
    if (!Object.hasOwn(a,key) || !Object.hasOwn(b,key)) {
      return {path:prefix+'.'+key,missingKey:true};
    }
    const changed=firstMismatch(a[key],b[key],
      prefix+(Array.isArray(a)?'['+key+']':'.'+key));
    if (changed) return changed;
  }
  return null;
}

/**
 * Record changes to the authentic live Store that occur between root dispatch
 * calls, such as while a bot is exploring speculative Simulator actions.
 * A changed state may also reflect legitimate out-of-dispatch engine work.
 * This wrapper restores the original dispatch implementation in finally.
 *
 * @template T
 * @param {function} Store
 * @param {()=>T} run
 * @param {{snapshot?:(state:object)=>object}} options
 * @returns {object}
 */
function withSourceContinuity(Store,run,options={}) {
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  if (!original || typeof original.value !== 'function' ||
      typeof run !== 'function') {
    throw new TypeError('Expected Store.dispatch and runner');
  }
  const snapshot=options.snapshot || observableState;
  let live=null,previous=null,liveDispatches=0,otherDispatches=0;
  const discontinuities=[];
  const wrapped=function(...args) {
    const action=args[0],name=action?.constructor?.name || 'UnknownAction';
    if (!live && name==='AddPlayerAction') live=this;
    if (this!==live) {
      otherDispatches++;
      return original.value.apply(this,args);
    }
    const before=snapshot(this.state);
    const beforeHash=hash(before);
    if (previous && previous.hash!==beforeHash) {
      discontinuities.push({
        afterActionOrdinal:previous.ordinal,
        beforeActionOrdinal:liveDispatches,
        nextAction:name,
        previousHash:previous.hash,
        currentHash:beforeHash,
        firstMismatch:firstMismatch(previous.snapshot,before)
      });
    }
    const ordinal=liveDispatches++;
    try {return original.value.apply(this,args);}
    finally {
      const after=snapshot(this.state);
      previous={ordinal,snapshot:after,hash:hash(after)};
    }
  };
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:wrapped});
  let result;
  try {result=run();}
  finally {Object.defineProperty(Store.prototype,'dispatch',original);}
  return {result,liveDispatches,otherDispatches,discontinuities,
    scope:'first-AddPlayerAction-Store-instance',
    status:'diagnostic partial-State continuity, not source replay'};
}

module.exports={cardHistory,historyZones,observableState,hash,firstMismatch,
  withSourceContinuity};

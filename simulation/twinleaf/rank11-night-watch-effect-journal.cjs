'use strict';

/**
 * Detached aggregate source-State snapshot for an attack-effect audit.
 * The observer cannot drive bot decisions and deliberately preserves no
 * hidden card faces, Prize identities, or random hand-selection identities.
 * @param {object} state
 */
function stateTotals(state) {
  return {
    turn:state.turn,phase:state.phase,winner:state.winner??null,
    unresolvedPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    players:state.players.map(p=>({
      name:p.name, hand:p.hand.cards.length, deck:p.deck.cards.length,
      discard:p.discard.cards.length,
      prizes:p.prizes.filter(slot=>slot.cards.length>0).length,
      active:p.active.getPokemonCard()?{
        name:p.active.getPokemonCard().fullName,
        damage:p.active.damage,
        printedHp:p.active.getPokemonCard().hp
      }:null,
      bench:p.bench.filter(slot=>slot.getPokemonCard()).map(slot=>({
        name:slot.getPokemonCard().fullName,damage:slot.damage
      }))
    }))
  };
}

/**
 * Intercept only the first live Store's real dispatches. Bot policies may use
 * separate speculative Stores; none of those are counted. Restore the exact
 * original prototype descriptor, including through an exception.
 *
 * A Night Watch log declaration begins one journal record; the first later
 * no-prompt state closes it. This documents engine transition effects, not
 * independent proof that they obey every printed or tournament rule.
 *
 * @param {Function} run Synchronous source-dealt match, no state manipulation.
 * @param {Function} Store Pinned compiled Store constructor.
 * @param {string} [attackerName='research-B']
 * @returns {{result:any,records:object[],rootDispatches:number,qualification:false}}
 */
function withNightWatchEffectJournal(run, Store, attackerName='research-B') {
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const original=Store.prototype.dispatch;
  if(typeof original!=='function') throw new TypeError('Pinned Store.dispatch missing');
  const records=[];
  let rootStore=null;
  let rootDispatches=0;
  let depth=0;
  let pending=null;

  Store.prototype.dispatch=function observedDispatch(action) {
    if(rootStore===null) rootStore=this;
    if(this!==rootStore) return original.call(this,action);
    if(depth>0) return original.call(this,action);
    const before=stateTotals(this.state);
    const activePrompt=this.state.prompts.find(p=>p.result===undefined);
    const sourceSide=this.state.players.find(p=>p.name==='research-A');
    const promptAudit=activePrompt?{
      type:activePrompt.constructor.name,
      playerId:activePrompt.playerId,
      sourceHand:activePrompt.cards===sourceSide?.hand,
      minimum:activePrompt.options?.min??null,
      maximum:activePrompt.options?.max??null,
      selectionCount:Array.isArray(action.result)?action.result.length:null
    }:null;
    const startLog=this.state.logs.length;
    const actionName=action.constructor.name;
    const ordinal=++rootDispatches;
    depth++;
    let result;
    try { result=original.call(this,action); }
    finally { depth--; }
    const after=stateTotals(this.state);
    const newDeclarations=this.state.logs.slice(startLog)
      .filter(entry=>entry.message==='LOG_PLAYER_USES_ATTACK' &&
        entry.params?.name===attackerName && entry.params?.attack==='Night Watch');
    if(newDeclarations.length>1) {
      throw new Error('Multiple Night Watch declarations in one real root action');
    }
    if(newDeclarations.length===1) {
      if(pending) throw new Error('Second Night Watch before prior attack settled');
      pending={ordinal,turnBefore:before.turn,actionName,before,stages:[]};
    }
    if(pending) {
      pending.stages.push({ordinal,actionName,promptAudit,beforeHand:before.players[0].hand,beforeDeck:before.players[0].deck,after});
      if(after.unresolvedPrompts.length===0) {
        pending.after=after;
        pending.resolutionRootOrdinal=ordinal;
        pending.status='first-no-prompt-boundary';
        records.push(pending);
        pending=null;
      }
    }
    return result;
  };
  try {
    const result=run();
    if(pending) {
      pending.status='unresolved-at-run-end';
      records.push(pending);
    }
    return {result,records,rootDispatches,qualification:false};
  } finally {
    if(descriptor) Object.defineProperty(Store.prototype,'dispatch',descriptor);
    else delete Store.prototype.dispatch;
  }
}

module.exports={stateTotals,withNightWatchEffectJournal};

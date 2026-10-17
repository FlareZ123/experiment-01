'use strict';
const assert=require('node:assert/strict');
const {observableState,hash}=require('./source-state-continuity.cjs');

/**
 * A single authentic turn-28 policy fork after Copycat -> Timeless-GX.
 * Replaces the root bot's actual Mimikyu retreat choice with Copycat, then
 * resolves the true Dialga-GX Shred prompt using its original Attack object.
 * Public board, own discard and persisted opponent attack are the only gates.
 * The original source game and all preceding turns are untouched.
 *
 * @template T
 * @param {{Store:Function,Bot:Function,AttackAction:Function,ResolvePromptAction:Function}} types
 * @param {()=>T} work
 * @param {{forceShred?:boolean,rootActionOrdinal?:number,snapshot?:(state:object)=>object}} options
 * @returns {{result:T,opportunities:object[],shredSelections:object[]}}
 */
function withTurn28CopycatShredFork(types,work,options={}) {
  const {Store,Bot,AttackAction,ResolvePromptAction}=types;
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const botDesc=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof storeDesc?.value,'function');
  assert.equal(typeof botDesc?.value,'function');
  let root=null,forced=false,rootDispatchCount=0;
  const snapshot=options.snapshot||observableState;
  const opportunities=[],shredSelections=[];
  const dispatch=function(...args) {
    if(!root && args[0]?.constructor?.name==='AddPlayerAction') root=this;
    if(this===root) rootDispatchCount++;
    return storeDesc.value.apply(this,args);
  };
  const decode=function(state,...args) {
    const live=state===root?.state && state.turn===28 &&
      state.activePlayer===1;
    const actor=live?state.players[1]:null;
    const active=actor?.active.getPokemonCard();
    const opponent=live?state.players[0]:null;
    const opponentLast=opponent&&state.playerLastAttack?.[opponent.id];
    const sourceReady=active?.fullName==='Mimikyu GRI' &&
      actor.usedGX===true &&
      opponentLast?.sourceCard?.fullName==='Regidrago VSTAR SIT' &&
      opponentLast?.attack?.name==='Apex Dragon' &&
      opponentLast.attack.gxAttack!==true &&
      actor.discard.cards.some(c=>c.fullName==='Dialga-GX UPR') &&
      actor.active.energies.cards.filter(c=>c.name==='Psychic Energy').length>=2;
    const pending=sourceReady&&state.prompts?.find(p=>
      p.result===undefined && p.playerId===actor.id &&
      p.constructor.name==='ChooseAttackPrompt');
    if(pending && forced && options.forceShred===true) {
      const dialga=pending.cards.find(card=>
        card.fullName==='Dialga-GX UPR' &&
        actor.discard.cards.includes(card));
      const shred=dialga?.attacks.find(a=>a.name==='Shred');
      assert.ok(shred && pending.validate(shred),
        'Actual pending prompt must contain valid own-discard Shred');
      shredSelections.push({turn:28,promptId:pending.id,
        source:dialga.fullName,attack:shred.name,
        stateDigest:hash(snapshot(state))});
      return new ResolvePromptAction(pending.id,shred);
    }
    // A source-ordinal fork avoids executing the generic bot's speculative
    // choice for this one recorded root decision. The paired original branch
    // separately proves that action 215 was a RetreatAction in the source.
    // This is a replay diagnostic, never a general production decision policy.
    if (sourceReady && !pending && !forced &&
        options.forceShred===true &&
        options.rootActionOrdinal===rootDispatchCount &&
        this.client?.id===actor.id) {
      const defender=opponent.active.getPokemonCard();
      const damage=opponent.active.damage;
      assert.equal(defender?.fullName,'Regidrago VSTAR SIT');
      assert.equal(defender.hp,280);
      assert.ok(damage>=200 && damage<280,
        'Source opponent must be in Dialga Shred knockout range');
      opportunities.push({turn:28,actor:actor.id,
        originalAction:'independently verified source RetreatAction',
        defender:defender.fullName,damage,shredPrintedDamage:80,
        defenderHP:defender.hp,ownDiscardDragon:'Dialga-GX UPR',
        sourceDigest:hash(snapshot(state)),rootActionOrdinal:rootDispatchCount});
      forced=true;
      return new AttackAction(actor.id,'Copycat');
    }
    const chosen=botDesc.value.call(this,state,...args);
    // An ordinal-gated fork may force only its exact archived decision.
    // Never fall through to the legacy proposal-based override on other steps.
    if (options.rootActionOrdinal!==undefined) return chosen;
    if(!sourceReady || chosen?.constructor?.name!=='RetreatAction' ||
        this.client?.id!==actor.id || forced) return chosen;
    const defender=opponent.active.getPokemonCard();
    const damage=opponent.active.damage;
    assert.ok(defender?.fullName==='Regidrago VSTAR SIT');
    assert.equal(defender.hp,280);
    assert.ok(damage>=200 && damage<280,
      'Source opponent must be in Dialga Shred knockout range');
    opportunities.push({turn:28,actor:actor.id,originalAction:'RetreatAction',
      defender:opponent.active.getPokemonCard().fullName,
      damage,shredPrintedDamage:80,defenderHP:defender.hp,
      ownDiscardDragon:'Dialga-GX UPR',sourceDigest:hash(snapshot(state))});
    if(options.forceShred!==true) return chosen;
    forced=true;
    return new AttackAction(actor.id,'Copycat');
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:dispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...botDesc,value:decode});
  let result;
  try {result=work();}
  finally {
    Object.defineProperty(Bot.prototype,'decodeNextAction',botDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
  return {result,opportunities,shredSelections,
    forcedAttack:forced};
}
module.exports={withTurn28CopycatShredFork};

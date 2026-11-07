'use strict';

const assert=require('node:assert/strict');
const {runSeat}=require('./agent46-mimikyu-apex-consecutive-native.cjs');

/**
 * Trace the original pinned Dragon Dialga GX source handler on the actual
 * Regidrago -> Apex Dragon -> Overclock native prompt path. The source object
 * lives in the original player's discard; source.reduceEffect.call(copycat)
 * must dispatch its printed payload when the generator advances correctly.
 * All instrumentation is instance-local and restored before returning.
 *
 * @param {0|1} seat Physical Mimikyu owner seat.
 * @returns {object} Actual native source-handler and Store effect events.
 */
function traceSeat(seat){
  const audit={seat,handlerCalls:[],storeEffects:[],
    restoredSourceMethod:false,restoredStoreMethod:false,
    originalDiscardSourceRetained:false};
  let source=null, store=null, originalMethod=null,originalStoreMethod=null;
  const stage=({x,usedDragon})=>{
    source=usedDragon;
    store=x.store;
    const sourceOwner=x.opponent;
    originalMethod=usedDragon.reduceEffect;
    originalStoreMethod=store.reduceEffect;
    usedDragon.reduceEffect=function nativeDialgaTrace(st,ns,effect){
      const currentThis=this;
      const inHand=sourceOwner.hand.cards.length;
      const inDeck=sourceOwner.deck.cards.length;
      audit.handlerCalls.push({
        effect:effect?.constructor?.name??null,
        printedAttack:effect?.attack?.name??null,
        thisIsRegidrago:currentThis===x.opponent.active.getPokemonCard(),
        thisPrinting:currentThis.fullName,
        equalsOwnOverclock:effect?.attack===currentThis.attacks?.[0],
        copySourceInDiscard:sourceOwner.discard.cards.includes(source),
        ownerHandAtEntry:inHand,ownerDeckAtEntry:inDeck});
      return originalMethod.call(this,st,ns,effect);
    };
    const sourceWrapper=usedDragon.reduceEffect;
    store.reduceEffect=function nativeStoreEffectTrace(ns,effect){
      const interesting=['AttackEffect','BeforeDoingDamageEffect',
        'AfterAttackEffect','DealDamageEffect','UseAttackEffect'];
      if(interesting.includes(effect?.constructor?.name)){
        audit.storeEffects.push({
          effect:effect.constructor.name,
          printedAttack:effect.attack?.name??null,
          effectDamage:effect.damage??null,
          sourceCard:effect.source?.getPokemonCard?.()?.fullName??null,
          handAtEntry:sourceOwner.hand.cards.length,
          deckAtEntry:sourceOwner.deck.cards.length,
          sourceWrapperStillInstalled:source.reduceEffect===sourceWrapper});
      }
      return originalStoreMethod.call(this,ns,effect);
    };
  };
  const result=runSeat(seat,{beforeApex:stage});
  assert.ok(source);
  assert.ok(store);
  if(Object.prototype.hasOwnProperty.call(source,'reduceEffect'))
    delete source.reduceEffect;
  if(Object.prototype.hasOwnProperty.call(store,'reduceEffect'))
    delete store.reduceEffect;
  audit.restoredSourceMethod=source.reduceEffect===originalMethod;
  audit.restoredStoreMethod=store.reduceEffect===originalStoreMethod;
  audit.originalDiscardSourceRetained=result.originalSourceLastAttackAfterResolvedApex?.source
    ==='Regidrago VSTAR SIT';
  return {seat,audit,
    actualSourcePreviousAttack:result.originalSourceLastAttackAfterResolvedApex,
    chosenNativeApexOverclock:result.sourceChooseAttackPromptSeen,
    sourceHandAfterApex:result.sourceHandImmediatelyAfterApex,
    sourceDeckAfterApex:result.sourceDeckImmediatelyAfterApex,
    nativeError:result.error,nativePromptSequence:result.history,
    paperQualifiedGame:false};
}

function run(){
  const rows=[traceSeat(0),traceSeat(1)];
  for(const row of rows){
    assert.equal(row.nativeError,null);
    assert.equal(row.audit.restoredSourceMethod,true);
    assert.equal(row.audit.restoredStoreMethod,true);
    assert.equal(row.chosenNativeApexOverclock,true);
  }
  const out={schema:'agent46-regidrago-apex-delegation-native-effect-trace-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Regidrago VSTAR SIT -> Dialga-GX UPR Overclock',
    instrumentationScope:'per-card instance and per-live-Store only',
    noVendorEdits:true,qualifiedCompetitiveGames:0,rows};
  console.log('AGENT46_APEX_EFFECT_DELEGATION_TRACE '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={traceSeat,run};

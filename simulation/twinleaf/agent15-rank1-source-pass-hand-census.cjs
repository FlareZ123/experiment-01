'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent15-actual-rank1-source-owner-postchoice-pass-hand-census-v1';
const TARGET='1:212:B:champion-reference';
const PREFIX='agent41-bilateral-v2-common-policy-development-';

/**
 * Audit only already-selected Pass roots, from their acting owner's legal
 * information. Never provide this read-only data to the decision policy.
 * @template T
 * @param {()=>T} execute
 * @param {{Store?:Function,EnergyType?:object,sourceSeat?:0|1}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerPassHandCensus(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const EnergyType=deps.EnergyType??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types')).EnergyType;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  const sourceSeat=deps.sourceSeat??0;
  assert.ok(sourceSeat===0||sourceSeat===1);
  let live=null;
  const audit={schema:VERSION,sourceSeat,originalStores:0,ownerPasses:[],
    ownerPrivateCardsUsedByBot:false,sourceDecisionChanged:false,
    gameQualified:false};

  function observed(action,...args){
    if(live===null&&action?.constructor?.name==='AddPlayerAction'){
      live=this;audit.originalStores++;
    }
    if(this===live&&action?.constructor?.name==='PassTurnAction'){
      const state=this.state;
      const who=state.players.findIndex(p=>p.id===(action.clientId??action.id));
      if(who===sourceSeat){
        const owner=state.players[who];
        const all=owner.hand.cards;
        const hand=all.map(card=>({
          name:card.fullName??card.name??null,
          superType:card.superType??null,
          energyType:card.energyType??null
        }));
        const energy=hand.filter(c=>c.energyType!==null);
        const occupied=owner.bench.filter(b=>b.getPokemonCard()).length;
        const usedNormalEnergy=owner.energyPlayedTurn===state.turn;
        audit.ownerPasses.push({
          turn:state.turn,seat:who,
          sourcePublicActive:owner.active.getPokemonCard()?.fullName??null,
          publicActiveEnergy:owner.active.energies.cards
            .map(c=>c.fullName??c.name??null),
          occupiedBench:occupied,
          ownerHandAfterOwnDecision:hand,
          ownerHandSize:all.length,heldEnergyCount:energy.length,
          heldBasicEnergyNames:energy
            .filter(c=>c.energyType===EnergyType.BASIC)
            .map(c=>c.name),
          energyPlayedTurn:owner.energyPlayedTurn,
          normalEnergyQuotaUsed:usedNormalEnergy,
          cannotPlayEnergyCards:owner.cannotPlayEnergyCards===true,
          cannotPlaySpecialEnergyCards:owner.cannotPlaySpecialEnergyCards===true,
          preliminaryUnspentHandEnergyOpportunity:energy.length>0&&
            !usedNormalEnergy&&owner.cannotPlayEnergyCards!==true&&
            (owner.active.getPokemonCard()!==undefined||occupied>0),
          opportunityIsPaperOrStoreCertified:false
        });
      }
    }
    return prior.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:observed});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent15OwnerPassCensus=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}

/** Run only the source rank1 mirror from the already frozen eight arms. */
function runRank1MirrorOwnerPassHandCensus(deps={}){
  const headless=deps.headless??require('./headless.cjs');
  const runner=deps.runner??require(
    '../evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs'
  ).runIssue25V8WithTelepathAndDefaultConfirmFalse;
  const observer=deps.observer??withOwnerPassHandCensus;
  const old=headless.runMatch;
  assert.equal(typeof old,'function');
  const observations=[];
  function target(request){
    const id=typeof request.label==='string'&&request.label.startsWith(PREFIX)?
      request.label.slice(PREFIX.length):request.label;
    if(id!==TARGET)return old(request);
    const captured=observer(()=>old(request),{sourceSeat:0});
    observations.push(captured.audit);
    return captured.result;
  }
  headless.runMatch=target;
  let execution;
  try{execution=runner();}
  finally{
    assert.strictEqual(headless.runMatch,target);
    headless.runMatch=old;
  }
  assert.equal(observations.length,1);
  return {schema:VERSION,target:TARGET,execution,audit:observations[0]};
}
module.exports={VERSION,TARGET,PREFIX,withOwnerPassHandCensus,
  runRank1MirrorOwnerPassHandCensus};

'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const VERSION='agent17-frozen-rank1-post-denial-pale-moon-gx-v1';
const output=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Propose a single typed native AttackAction on a previously missed
 * post-denial rank1 Pass. All selection conditions come from the current
 * actor's detached hand/public view. Stage-specific counterfactual only.
 * Native Store must still adjudicate actual Energy, timing, GX use and
 * delayed attack effects. This is not a new default strategic policy.
 *
 * @param {object} view Genuine owner-only actor view.
 * @returns {{attackName:string}|null}
 */
function chooseFrozenFundedPaleMoon(view) {
  if(view?.decisionKind!=='owner-root'||view.globalTurn<=1)
    return null;
  const own=view.ownPublic,def=view.opponentPublic;
  if(own?.active?.printing!=='Trevenant & Dusknoir-GX SMP'||
    !def?.active||
    own.publicTurnRestrictions?.gxUsed!==false||
    own.publicTurnRestrictions?.attackLockTurnsRemaining!==0||
    own.publicTurnRestrictions?.cannotUseGXAttacks===true)
    return null;
  const printed=own.active.attacks?.find(row=>row.name==='Pale Moon-GX');
  if(!printed||!Array.isArray(printed.cost))return null;
  if(!Array.isArray(own.active.energies)||
    own.active.energies.filter(x=>x==='Psychic Energy MEE').length<2)
    return null;
  return {attackName:'Pale Moon-GX'};
}

/**
 * @template T
 * @param {()=>T} execute Actual native match.
 * @param {{targetSeat:0|1,targetTurn:number,SimpleTacticsAi?:Function,
 *   AttackAction?:Function,observe?:Function,choose?:Function}} deps
 * @returns {{result:T,audit:object}}
 */
function withTargetedFundedPaleMoon(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(deps.targetSeat===0||deps.targetSeat===1);
  assert.ok(Number.isSafeInteger(deps.targetTurn)&&deps.targetTurn>=2);
  const Tactics=deps.SimpleTacticsAi??
    require(path.join(output,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const AttackAction=deps.AttackAction??require(path.join(output,
    'game/store/actions/game-actions')).AttackAction;
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseFrozenFundedPaleMoon;
  const previous=Object.getOwnPropertyDescriptor(Tactics.prototype,
    'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  const audit={version:VERSION,targetSeat:deps.targetSeat,
    targetTurn:deps.targetTurn,originalPassesFound:0,
    ownerPayableProposals:0,actualNativeAcceptanceUnverified:true,
    sourceSingleRootOnly:true,competitiveGamesQualified:0};
  function decode(state,...args){
    const original=previous.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction'||
      state.activePlayer!==deps.targetSeat||
      state.turn!==deps.targetTurn||
      state.prompts?.some(row=>row.result===undefined))
      return original;
    audit.originalPassesFound++;
    const view=observe(state,deps.targetSeat);
    const planned=choose(view);
    if(!planned)return original;
    assert.equal(planned.attackName,'Pale Moon-GX');
    audit.ownerPayableProposals++;
    return new AttackAction(state.players[deps.targetSeat].id,
      planned.attackName);
  }
  Object.defineProperty(Tactics.prototype,'decodeNextAction',{
    ...previous,value:decode});
  try{
    return {result:execute(),audit};
  }finally{
    assert.strictEqual(Tactics.prototype.decodeNextAction,decode);
    Object.defineProperty(Tactics.prototype,'decodeNextAction',previous);
  }
}

module.exports={VERSION,chooseFrozenFundedPaleMoon,
  withTargetedFundedPaleMoon};

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {chooseTeamFlareGruntDenial} =
  require('./agent1-owner-team-flare-grunt-denial.cjs');

const VERSION = 'agent17-historical-source-single-root-teamflare-v1';
const output = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Retrospective *single-owner-root* test of an existing public Team Flare
 * Grunt selector against the original source Pass. No new card selection
 * rule is created; only the frozen intervention window is selected.
 * Default off everywhere else. This is source diagnostics, not a prospective
 * generally qualified bilateral policy.
 *
 * @template T
 * @param {()=>T} execute Exact native Store game.
 * @param {{targetSeat:0|1,targetTurn:number,SimpleTacticsAi?:Function,
 *   PlayCardAction?:Function,PlayerType?:object,SlotType?:object,
 *   observe?:Function,choose?:Function}} deps Injected test seams.
 * @returns {{result:T,audit:object}}
 */
function withTargetedTeamFlareNative(execute,deps) {
  assert.equal(typeof execute,'function');
  assert.ok(deps.targetSeat===0||deps.targetSeat===1);
  assert.ok(Number.isSafeInteger(deps.targetTurn)&&deps.targetTurn>=2);
  const Tactics=deps.SimpleTacticsAi??require(path.join(output,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const PlayCardAction=deps.PlayCardAction??require(path.join(output,
    'game/store/actions/play-card-action')).PlayCardAction;
  const nativeType=deps.PlayerType&&deps.SlotType?{
    PlayerType:deps.PlayerType,SlotType:deps.SlotType
  }:require(path.join(output,'game/store/actions/play-card-action'));
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseTeamFlareGruntDenial;
  const previous=Object.getOwnPropertyDescriptor(Tactics.prototype,
    'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  const audit={version:VERSION,
    targetSeat:deps.targetSeat,targetTurn:deps.targetTurn,
    originalPassWindowObserved:0,ownerOnlyOffers:0,
    typedNativeProposals:0,proposals:[],
    changeScope:'exact single source actor root; no other owner turns',
    competitiveGameQualified:false};
  function decode(state,...args) {
    const original=previous.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction'||
      state.activePlayer!==deps.targetSeat||
      state.turn!==deps.targetTurn||
      state.prompts?.some(row=>row.result===undefined))
      return original;
    audit.originalPassWindowObserved++;
    const view=observe(state,deps.targetSeat);
    const proposal=choose(view);
    if(!proposal)return original;
    assert.equal(proposal.kind,'play-team-flare-grunt-denial');
    assert.equal(view.ownHand[proposal.handIndex],proposal.printing);
    audit.ownerOnlyOffers++;
    audit.proposals.push({
      actorSeat:view.actorSeat,globalTurn:view.globalTurn,
      sourceHandIndex:proposal.handIndex,
      sourcePrinting:proposal.printing,
      opponentActive:view.opponentPublic.active?.printing??null,
      opponentActiveEnergyBefore:
        [...(view.opponentPublic.active?.energies??[])],
      ownerSupporterQuota:view.ownTurnResources.supporterPlayedTurn,
      nextAction:'typed PlayCardAction; native Store acceptance unverified'
    });
    audit.typedNativeProposals++;
    return new PlayCardAction(state.players[deps.targetSeat].id,
      proposal.handIndex,{
        player:nativeType.PlayerType.ANY,
        slot:nativeType.SlotType.BOARD,index:0
      });
  }
  Object.defineProperty(Tactics.prototype,'decodeNextAction',{
    ...previous,value:decode});
  try {
    return {result:execute(),audit};
  } finally {
    assert.strictEqual(Tactics.prototype.decodeNextAction,decode);
    Object.defineProperty(Tactics.prototype,'decodeNextAction',previous);
  }
}

module.exports={VERSION,withTargetedTeamFlareNative};

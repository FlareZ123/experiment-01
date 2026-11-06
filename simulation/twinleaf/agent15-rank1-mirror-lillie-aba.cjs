'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent15-rank1-original-owner-held-lillie-turn20-aba-v1';
const TARGET='1:212:B:champion-reference';
const PREFIX='agent41-bilateral-v2-common-policy-development-';
const REGISTRATION='results/aichi-2026/registrations/agent15-rank1-mirror-lillie-first-own-turn20-aba-20261106.json';
const SOURCE_SEAT=0;
const TARGET_TURN=20;
const LILLIE="Lillie's Determination M1L";

/**
 * One owner-only, post-Bot-decision source trial action substitution.
 * This wrapper does not inspect opponent private information.
 *
 * @template T
 * @param {()=>T} execute
 * @param {{SimpleTacticsAi?:Function,PlayCardAction?:Function,
 *   PlayerType?:object,SlotType?:object}} [deps]
 */
function withOriginalRank1HeldLillie(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Tactics=deps.SimpleTacticsAi??require(path.join(output,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const types=deps.PlayerType&&deps.SlotType?
    {PlayerType:deps.PlayerType,SlotType:deps.SlotType}:
    require(path.join(output,'game/store/actions/play-card-action'));
  const PlayCardAction=deps.PlayCardAction??types.PlayCardAction;
  assert.equal(typeof PlayCardAction,'function');
  const before=Object.getOwnPropertyDescriptor(Tactics.prototype,'decodeNextAction');
  assert.equal(typeof before?.value,'function');
  const audit={schema:VERSION,exactOwnerPassWindows:0,sourceOwnerHandMatches:0,
    sourceSupporterQuotaAvailable:0,actualTypedProposals:0,proposals:[],
    sourcePrivateOwnerOnly:true,opponentPrivateRead:false,
    competitivelyQualifiedGames:0};
  function decode(state,...args){
    const proposed=before.value.call(this,state,...args);
    if(proposed?.constructor?.name!=='PassTurnAction'||
      state?.activePlayer!==SOURCE_SEAT||state?.turn!==TARGET_TURN||
      state?.prompts?.some(p=>p.result===undefined))return proposed;
    audit.exactOwnerPassWindows++;
    const owner=state.players[SOURCE_SEAT];
    const handIndex=owner.hand.cards.findIndex(c=>c.fullName===LILLIE);
    if(handIndex<0)return proposed;
    audit.sourceOwnerHandMatches++;
    if(owner.supporterTurn===state.turn||owner.cannotPlaySupporterCards===true)
      return proposed;
    audit.sourceSupporterQuotaAvailable++;
    audit.actualTypedProposals++;
    audit.proposals.push({seat:SOURCE_SEAT,turn:state.turn,
      supporterPrinting:LILLIE,ownerHandIndex:handIndex,
      ownerHandSize:owner.hand.cards.length,
      ownerSupporterPlayedTurn:owner.supporterTurn,
      nativeSettlementUnverified:true});
    return new PlayCardAction(owner.id,handIndex,{
      player:types.PlayerType.ANY,slot:types.SlotType.BOARD,index:0
    });
  }
  Object.defineProperty(Tactics.prototype,'decodeNextAction',
    {...before,value:decode});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent15LillieAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Tactics.prototype.decodeNextAction,decode);
    Object.defineProperty(Tactics.prototype,'decodeNextAction',before);
  }
}

/**
 * Reexecute the frozen original eight developmental v8+Confirm arms in A/B/A,
 * with only a single original source seat at turn20 eligible for B.
 *
 * @param {{headless?:object,runner?:Function,treatment?:Function}} [deps]
 */
function runOriginalRank1HeldLillieABA(deps={}){
  const headless=deps.headless??require('./headless.cjs');
  const runner=deps.runner??require(
    '../evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs'
  ).runIssue25V8WithTelepathAndDefaultConfirmFalse;
  const treatment=deps.treatment??withOriginalRank1HeldLillie;
  const original=headless.runMatch;
  assert.equal(typeof original,'function');
  const phases=[];
  for(const phase of ['A','B','A-repeat']){
    let observed=0,receipt=null;
    function intercept(request){
      const id=typeof request.label==='string'&&request.label.startsWith(PREFIX)?
        request.label.slice(PREFIX.length):request.label;
      if(id!==TARGET)return original(request);
      observed++;
      if(phase==='B'){
        receipt=treatment(()=>original(request));
        return receipt.result;
      }
      return original(request);
    }
    headless.runMatch=intercept;
    let execution;
    try{execution=runner();}
    finally{
      assert.strictEqual(headless.runMatch,intercept);
      headless.runMatch=original;
    }
    assert.equal(observed,1,'frozen eight must contain one target source');
    if(phase==='B')assert.ok(receipt?.audit);
    phases.push({phase,execution,audit:receipt?.audit??null});
  }
  return {schema:VERSION,registration:REGISTRATION,
    sourceTrial:TARGET,phases,competitiveQualifiedGames:0};
}
module.exports={VERSION,TARGET,PREFIX,REGISTRATION,
  SOURCE_SEAT,TARGET_TURN,LILLIE,
  withOriginalRank1HeldLillie,runOriginalRank1HeldLillieABA};

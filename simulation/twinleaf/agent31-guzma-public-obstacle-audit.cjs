'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {isGuzma}=require('./agent2-held-guzma-mobility-frontier.cjs');
const {fundedPlainAttacks}=
  require('./agent31-forced-guzma-ko-frontier.cjs');
const {nominalKo}=require('./agent31-final-prize-guzma-frontier.cjs');
const {ROOT_ACTIONS}=
  require('./agent2-native-owner-supporter-opportunity.cjs');

const VERSION='agent31-owner-public-guzma-obstacle-audit-v1';

/**
 * Classify a true acting-owner view without opening any opponent concealed
 * card zone. Each dimension is independent to preserve conjunction failures.
 * @param {object} view Detached actual root observation.
 * @param {object} catalog Public printed card catalog.
 * @returns {object}
 */
function classifyGuzmaRoot(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic;
  const r=view.ownTurnResources;
  const heldGuzma=Array.isArray(view.ownHand)&&
    view.ownHand.some(isGuzma);
  const ownBench=own?.bench?.filter(Boolean)??[];
  const opponentBench=opp?.bench?.filter(Boolean)??[];
  const paidAttacks=ownBench.flatMap(p=>
    fundedPlainAttacks(p,catalog).map(a=>({attacker:p,attack:a})));
  let nominalKoPairs=0;
  for(const {attacker,attack} of paidAttacks){
    for(const target of opponentBench){
      if(nominalKo(target,attacker,attack))nominalKoPairs++;
    }
  }
  const directActiveNominalKo=own?.active&&opp?.active?
    fundedPlainAttacks(own.active,catalog).some(attack=>
      nominalKo(opp.active,own.active,attack)!==null):false;
  const quotaOpen=r?.supporterPlayedTurn===0 &&
    r?.supporterPlayLocked!==true &&
    own?.publicTurnRestrictions?.supporterPlayLocked!==true &&
    (own?.publicTurnRestrictions?.attackLockTurnsRemaining??0)<=0 &&
    (own?.resolvingSupporter?.length??0)===0 &&
    view.globalTurn>1;
  const actionable=quotaOpen&&!directActiveNominalKo;
  return {
    heldGuzma,ownerSeat:view.actorSeat,turn:view.globalTurn,
    ownerBenchCount:ownBench.length,opponentBenchCount:opponentBench.length,
    fundedPlainBenchAttackCount:paidAttacks.length,
    nominalKoPairCount:nominalKoPairs,
    supporterQuotaOpen:quotaOpen,
    directActiveNominalKo:directActiveNominalKo===true,
    prizeCount:own?.prizeCount??null,
    finalPrizeOpportunity:heldGuzma&&actionable&&
      own?.prizeCount===1&&nominalKoPairs>0,
    nonfinalPrizeOpportunity:heldGuzma&&actionable&&
      Number.isSafeInteger(own?.prizeCount)&&own.prizeCount>=2&&
      nominalKoPairs>0,
    opponentHiddenDeckAndHandUnexamined:true
  };
}

/**
 * Observe actual accepted native owner roots. The control policy is
 * never altered: only detached owner-public snapshots are counted.
 *
 * @template T
 * @param {()=>T} execute Synchronous full set of native games.
 * @param {object} [deps] Native injection for tests.
 * @returns {{result:T,audit:object}}
 */
function withGuzmaPublicObstacleAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,
    'game/store/store')).Store;
  const observe=deps.observe??actorObservation;
  const getCatalog=deps.getCatalog??(()=>require(
    './agent43-guzma-prompt-continuation.cjs').publicCatalog());
  const previous=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const live=new WeakMap();
  const turns=new Map(),errors=[];
  let nextGameId=0,rootDispatchCount=0,acceptedRootCount=0,
    ownerRootsHoldingGuzma=0,nominalRootCount=0,
    attemptedActionChanges=0,catalog=null;
  const summarize=()=>{
    const items=[...turns.values()];
    const countWhere=key=>items.filter(x=>x[key]===true).length;
    const counts={
      gamesObserved:nextGameId,
      acceptedOwnerRoots:acceptedRootCount,
      acceptedOwnerRootsHoldingGuzma:ownerRootsHoldingGuzma,
      acceptedOwnerRootsWithNominalBenchKo:nominalRootCount,
      uniqueOwnerTurnsWithGuzma:items.length,
      ownerTurnsWithAnyFundedBenchAttack:
        items.filter(x=>x.maxFundedBenchAttacks>0).length,
      ownerTurnsWithAnyNominalBenchKo:
        items.filter(x=>x.maxNominalKoPairs>0).length,
      ownerTurnsWithAnyNominalAndOpenSupporter:
        items.filter(x=>x.anyNominalAndOpen).length,
      ownerTurnsWithFinalPrizeOpportunity:
        countWhere('anyFinalPrizeOpportunity'),
      ownerTurnsWithNonfinalOpportunity:
        countWhere('anyNonfinalPrizeOpportunity'),
      ownerTurnsWithAnyOpponentBench:
        items.filter(x=>x.maxOpponentBench>0).length,
      ownerTurnsWithAnyOwnBench:
        items.filter(x=>x.maxOwnerBench>0).length
    };
    return {
      version:VERSION,ownerOnly:true,readOnly:true,
      actualAcceptedRootBoundary:true,rootDispatchCount,
      ...counts,
      ownerTurnSummaries:items.slice(0,120),
      ownerTurnSummariesTruncated:Math.max(0,items.length-120),
      errors:errors.slice(0,16),errorsTruncated:Math.max(0,errors.length-16),
      attemptedActionChanges,
      competitiveQualifiedGames:0,
      limitation:'Only fixed printed positive no-text Basic-funded Bench attacks; native actual KO, alternate supporter use and future turns unproven.'
    };
  };
  function intercepted(action,...args){
    const type=action?.constructor?.name;
    if(type==='AddPlayerAction'&&!live.has(this))
      live.set(this,++nextGameId);
    const gameId=live.get(this);
    if(!gameId)return previous.value.call(this,action,...args);
    rootDispatchCount++;
    const state=this.state;
    const seat=state.players?.findIndex(p=>p.id===
      (action?.id??action?.clientId));
    const validSeat=seat===0||seat===1;
    const pending=state.prompts?.some(p=>p.result===undefined)===true;
    const eligible=ROOT_ACTIONS.has(type)&&validSeat&&
      state.activePlayer===seat&&!pending&&
      Number.isSafeInteger(state.turn)&&state.turn>=1;
    let reading=null;
    if(eligible){
      const view=observe(state,seat);
      assert.equal(view.decisionKind,'owner-root');
      catalog??=getCatalog();
      reading=classifyGuzmaRoot(view,catalog);
    }
    let result;
    try{result=previous.value.call(this,action,...args);}
    catch(error){
      if(error&&typeof error==='object')
        error.agent31GuzmaObstacleEvidence=summarize();
      throw error;
    }
    if(reading){
      acceptedRootCount++;
      if(reading.heldGuzma){
        ownerRootsHoldingGuzma++;
        if(reading.nominalKoPairCount>0)nominalRootCount++;
        const key=gameId+':'+seat+':'+reading.turn;
        const prior=turns.get(key)??{
          gameId,seat,turn:reading.turn,prizeCountAtFirstGuzmaRoot:
            reading.prizeCount,
          heldGuzmaRootCount:0,maxOwnerBench:0,maxOpponentBench:0,
          maxFundedBenchAttacks:0,maxNominalKoPairs:0,
          anyNominalAndOpen:false,
          anyFinalPrizeOpportunity:false,
          anyNonfinalPrizeOpportunity:false
        };
        prior.heldGuzmaRootCount++;
        prior.maxOwnerBench=Math.max(
          prior.maxOwnerBench,reading.ownerBenchCount);
        prior.maxOpponentBench=Math.max(
          prior.maxOpponentBench,reading.opponentBenchCount);
        prior.maxFundedBenchAttacks=Math.max(
          prior.maxFundedBenchAttacks,
          reading.fundedPlainBenchAttackCount);
        prior.maxNominalKoPairs=Math.max(
          prior.maxNominalKoPairs,reading.nominalKoPairCount);
        prior.anyNominalAndOpen||=reading.nominalKoPairCount>0&&
          reading.supporterQuotaOpen;
        prior.anyFinalPrizeOpportunity||=reading.finalPrizeOpportunity;
        prior.anyNonfinalPrizeOpportunity||=reading.nonfinalPrizeOpportunity;
        turns.set(key,prior);
      }
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...previous,value:intercepted
  });
  try{return {result:execute(),audit:summarize()};}
  catch(error){
    if(error&&typeof error==='object'&&
       !error.agent31GuzmaObstacleEvidence)
      error.agent31GuzmaObstacleEvidence=summarize();
    throw error;
  }
  finally{
    assert.strictEqual(Store.prototype.dispatch,intercepted);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,classifyGuzmaRoot,withGuzmaPublicObstacleAudit};

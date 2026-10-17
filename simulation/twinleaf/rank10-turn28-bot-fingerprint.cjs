'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {stateGraphFingerprint}=
  require('./rank10-live-decision-noninterference.cjs');

/**
 * Capture the generic bot's *exact* original source-root decision at a root
 * Store dispatch ordinal, without giving the bot access to the audit hashes.
 * Root-State graph contents include hidden zones but only detached digests
 * are ever reported. In particular this does not observe speculative Store
 * clones or make any legality claim for the AI policy.
 *
 * @template T
 * @param {function} Store
 * @param {function} Bot
 * @param {()=>T} work
 * @param {{rootActionOrdinal:number,turn:number,seat:number,
 *   fingerprint?:(state:object)=>{digest:string,nodes:number}}} target
 * @returns {{result:T,observations:object[],rootDispatches:number}}
 */
function withOrdinalBotFingerprint(Store,Bot,work,target){
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const botDesc=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof storeDesc?.value,'function');
  assert.equal(typeof botDesc?.value,'function');
  assert.equal(typeof work,'function');
  const fingerprint=target.fingerprint||stateGraphFingerprint;
  let root=null,rootDispatches=0;
  const observations=[];
  const dispatch=function(...args){
    if(!root&&args[0]?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root)rootDispatches++;
    return storeDesc.value.apply(this,args);
  };
  const decode=function(state,...args){
    const shouldCapture=state===root?.state &&
      rootDispatches===target.rootActionOrdinal &&
      state.turn===target.turn &&
      state.activePlayer===target.seat &&
      this.client?.id===state.players[target.seat]?.id &&
      observations.length===0;
    if(!shouldCapture)return botDesc.value.call(this,state,...args);
    const before=fingerprint(state);
    const action=botDesc.value.call(this,state,...args);
    const after=fingerprint(state);
    observations.push({
      rootActionOrdinal:rootDispatches,turn:state.turn,seat:target.seat,
      originalBotAction:action?.constructor?.name??null,
      originalBotAttack:action?.name??null,
      before,after,
      graphMutatedDuringBotChoice:before.digest!==after.digest,
      graphNodeDelta:after.nodes-before.nodes
    });
    return action;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:dispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...botDesc,value:decode});
  let result;
  try {result=work();}
  finally {
    Object.defineProperty(Bot.prototype,'decodeNextAction',botDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
  return {result,observations,rootDispatches};
}

/** Fixed authentic rank-10 source branch; no forced replacement attack. */
function auditRank10Turn28BotFingerprint(){
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(d=>[d.rank,d]));
  const rank1=byRank.get(1),rank10=byRank.get(10);
  assert.ok(rank1?.playableUnderEngine&&rank10?.playableUnderEngine);
  initializeCards();
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const request={
    deckA:rank10.cardIds,deckB:rank1.cardIds,
    seed:4246551499,maxActions:350,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:1,
    mimikyuTurn27SetupSeat:1,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const control=runMatch(request);
  const observed=withOrdinalBotFingerprint(Store,SimpleTacticsAi,
    ()=>runMatch(request),{rootActionOrdinal:215,turn:28,seat:1});
  assert.deepEqual(observed.result,control,
    'Root graph observer must not alter the source game');
  assert.equal(observed.observations.length,1,
    'Expected exactly one source-root bot proposal at action 215');
  assert.equal(observed.observations[0].originalBotAction,'RetreatAction');
  return {
    schema:'rank10-turn28-original-bot-source-graph-v1',
    sourceRanks:[10,1],candidatePhysicalSeat:1,
    candidateActuallyFirst:true,seed:request.seed,
    observed:observed.observations[0],
    actionCount:control.actions,
    originalWinner:control.winner,
    originalPrizesRemaining:control.prizesRemaining,
    matchesUnauditedControl:true,
    qualifiedForCompetitiveInference:false,
    limitations:[
      'One physical seed and source-bounded turn-28 decision',
      'Entire State graph fingerprint observes only data-descriptor topology',
      'Hidden-zone data is hashed for diagnostics, never passed to the bot',
      'Policy RNG and unmodeled engine closures are not full source replay evidence'
    ]
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(auditRank10Turn28BotFingerprint(),null,2)+'\n');
module.exports={withOrdinalBotFingerprint,auditRank10Turn28BotFingerprint};

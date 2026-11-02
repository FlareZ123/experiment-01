'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const {Store}=require(path.join(base,'game/store/store'));
const {RetreatAction}=require(path.join(base,'game/store/actions/game-actions'));
const {CORE,withOwnerLastBenchReadOnlyAudit}=
  require('./agent34-rank9-newmoon-lastbench-owner-location.cjs');
const {withOwnerSearchAlternative,conciseRow}=
  require('./agent34-rank9-mewtwo-native-search-choice-fork.cjs');
const {withOwnerMewtwoEnergyTarget}=
  require('./agent34-rank9-mewtwo-energy-native-target-fork.cjs');
const {run}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const VERSION='agent34-rank9-klefki-retreat-to-early-mewtwo-native-v1';

/**
 * Postchoice, developer-only paid retreat from Active Klefki to an actually
 * face-up Benched Mewtwo with Energy. A same-turn AttackAction is replaced
 * only at original t21; native Store must accept retreat cost, conditions,
 * and prompt. No subsequent attack or choice is forced.
 * @template T
 * @param {()=>T} execute Unchanged rank9 original registered runner.
 * @param {{Store?:Function,RetreatAction?:Function}} [deps]
 */
function withOriginalKlefkiRetreatToCore(execute,deps={}){
  const NativeStore=deps.Store??Store;
  const RetAction=deps.RetreatAction??RetreatAction;
  const original=Object.getOwnPropertyDescriptor(NativeStore.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const stores=new WeakMap(),events=[];
  let storeCount=0;
  function observed(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!stores.has(this)){
      stores.set(this,{run:++storeCount,ordinal:0});
    }
    const info=stores.get(this);
    if(!info)return original.value.apply(this,[action,...args]);
    const ordinal=++info.ordinal;
    const state=this.state;
    const seat=state?.players?.findIndex(p=>p.id===action?.clientId)??-1;
    const owner=state?.players?.[seat];
    const coreIndex=owner?.bench?.findIndex(p=>
      p.getPokemonCard()?.fullName===CORE)??-1;
    const core=owner?.bench?.[coreIndex];
    const eligible=action?.constructor?.name==='AttackAction'&&
      action.name==='Joust'&&state?.turn===21&&seat===0&&
      owner?.active?.getPokemonCard()?.fullName==='Klefki SVI'&&
      coreIndex>=0&&core.energies.cards.length>0&&
      owner.active.energies.cards.length>0&&
      owner.retreatedTurn!==state.turn;
    if(!eligible)return original.value.apply(this,[action,...args]);
    const prior={
      storeRunIndex:info.run,dispatchOrdinal:ordinal,
      globalTurn:state.turn,ownerSeat:seat,
      unmodifiedAction:'AttackAction Joust',benchIndex:coreIndex,
      activeBefore:owner.active.getPokemonCard().fullName,
      activeEnergyBefore:owner.active.energies.cards.map(c=>c.fullName),
      coreEnergyBefore:core.energies.cards.map(c=>c.fullName),
      ownerHasActiveRetreatEnergy:true,
      originalCardsUnmodified:true,
      developerPostchoiceIntervention:true
    };
    try{
      const out=original.value.apply(this,[new RetAction(owner.id,coreIndex),...args]);
      const activeNow=owner.active.getPokemonCard()?.fullName??null;
      const pending=state.prompts?.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)??[];
      events.push({...prior,nativeAccepted:true,activeAfter:activeNow,
        activeEnergyAfter:owner.active.energies.cards.map(c=>c.fullName),
        pendingPromptsAfterRetreat:pending});
      return out;
    }catch(error){
      events.push({...prior,nativeAccepted:false,
        error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(NativeStore.prototype,'dispatch',
    {...original,value:observed});
  try{
    const result=execute();
    return {result,audit:{
      schema:VERSION,originalStores:storeCount,
      eligibleNativeReplacements:events.length,
      nativeAccepted:events.filter(x=>x.nativeAccepted).length,
      events,competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(NativeStore.prototype.dispatch,observed);
    Object.defineProperty(NativeStore.prototype,'dispatch',original);
  }
}

function runSourceRank9(enableRetreat){
  const observed=withOwnerLastBenchReadOnlyAudit(()=>{
    const energy=withOwnerMewtwoEnergyTarget(()=>{
      if(!enableRetreat)return withOwnerSearchAlternative(run,{targetTurn:1});
      return withOriginalKlefkiRetreatToCore(()=>
        withOwnerSearchAlternative(run,{targetTurn:1}));
    },{targetTurns:[19]});
    return energy;
  });
  const wrapper=observed.result;
  const core=enableRetreat?wrapper.result.result.result:wrapper.result.result;
  const retreat=enableRetreat?wrapper.result.audit:null;
  const search=enableRetreat?wrapper.result.result.audit:wrapper.result.audit;
  return {
    label:enableRetreat?'search+t19-mewtwo-energy+paid-retreat':
      'search+t19-mewtwo-energy',
    rows:(core.rows??[]).map(conciseRow),
    originalRank:core.originalSourceRank,
    pinnedEngine:core.enginePin,
    sourceClosureSha256:core.sourceClosureSha256,
    paidRetreat:retreat,search,
    energy:wrapper.audit,
    observer:observed.audit
  };
}
function main(){
  const control=runSourceRank9(false);
  const intervention=runSourceRank9(true);
  const trials=control.rows.map((a,index)=>{
    const b=intervention.rows[index];
    assert.equal(a.id,b?.id);
    return {
      id:a.id,matchedSourceDeal:!!a.sourceDealFingerprint&&
        a.sourceDealFingerprint===b.sourceDealFingerprint,
      matchedFullDeal:!!a.fullPhysicalDealFingerprint&&
        a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint,
      baselineWinner:a.nativeWinner,
      nativeRetreatWinner:b.nativeWinner,
      baselinePrizes:a.nativeFinalPrizes,
      nativeRetreatPrizes:b.nativeFinalPrizes,
      baselineRootSha256:a.rootActionLedgerSha256,
      retreatRootSha256:b.rootActionLedgerSha256
    };
  });
  const affected='9:0:A:new-moon-lockbreaker-v1';
  return {
    schema:VERSION,researchRevision:process.env.GITHUB_SHA??null,
    originals:{control:control.rows.length,retreat:intervention.rows.length},
    allSameOriginalFullDeals:trials.length===4&&
      trials.every(row=>row.matchedSourceDeal&&row.matchedFullDeal),
    trials,
    control:{energy:control.energy,
      actualSearch:control.search,
      candidate:control.rows.find(row=>row.id===affected),
      observer:control.observer},
    nativeRetreat:{retreat:intervention.paidRetreat,
      energy:intervention.energy,
      actualSearch:intervention.search,
      candidate:intervention.rows.find(row=>row.id===affected),
      observer:intervention.observer},
    developerRetrospective:true,
    autonomousPolicyQualified:false,paperComplete:false,
    competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,withOriginalKlefkiRetreatToCore,runSourceRank9,main};

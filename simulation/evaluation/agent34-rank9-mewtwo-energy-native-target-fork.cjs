'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
const {PlayerType,SlotType}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action'));
const {CORE}=require('./agent34-rank9-newmoon-lastbench-owner-location.cjs');
const {withOwnerLastBenchReadOnlyAudit}=
  require('./agent34-rank9-newmoon-lastbench-owner-location.cjs');
const {withOwnerSearchAlternative,conciseRow}=
  require('./agent34-rank9-mewtwo-native-search-choice-fork.cjs');
const {run}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');

const VERSION='agent34-rank9-early-mewtwo-basic-psychic-target-retro-v1';

/**
 * Developer-only public owner-board substitution of a proposed actual
 * Psychic Energy attachment on turns 11 and 19. The already chosen hand
 * card is unchanged; only its target changes from Klefki Active to an
 * actually occupied Bench Mewtwo. Native Store enforces legality.
 * @template T
 * @param {()=>T} execute Original rank9 fixed-source development runner.
 * @param {{Store?:Function,PlayerType?:object,SlotType?:object,targetTurns?:number[]}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerMewtwoEnergyTarget(execute,deps={}){
  const NativeStore=deps.Store??Store;
  const players=deps.PlayerType??PlayerType;
  const slots=deps.SlotType??SlotType;
  const targetTurns=deps.targetTurns??[11,19];
  assert.ok(targetTurns.every(t=>t===11||t===19));
  const descriptor=Object.getOwnPropertyDescriptor(NativeStore.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const originalStores=new WeakMap();
  let count=0;
  const attempts=[];
  function dispatched(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!originalStores.has(this)){
      originalStores.set(this,{run:++count,ordinal:0});
    }
    const ctx=originalStores.get(this);
    if(!ctx)return descriptor.value.apply(this,[action,...args]);
    const ordinal=++ctx.ordinal;
    const state=this.state;
    const seat=state?.players?.findIndex(p=>p.id===(action?.id??-1))??-1;
    const owner=state?.players?.[seat];
    const card=owner?.hand?.cards?.[action?.handIndex];
    const index=owner?.bench?.findIndex(slot=>
      slot.getPokemonCard()?.fullName===CORE)??-1;
    const matches=action?.constructor?.name==='PlayCardAction'&&
      seat===0&&targetTurns.includes(state.turn)&&
      owner?.active?.getPokemonCard()?.fullName==='Klefki SVI'&&
      action.target?.slot===slots.ACTIVE&&
      card?.name==='Psychic Energy'&&
      index>=0;
    if(!matches)return descriptor.value.apply(this,[action,...args]);
    const bench=owner.bench[index];
    const before={
      storeRunIndex:ctx.run,ordinal,turn:state.turn,
      ownerSeat:seat,printedEnergy:card.fullName,
      existingActive:owner.active.getPokemonCard()?.fullName??null,
      benchCore:bench.getPokemonCard()?.fullName??null,
      benchSlot:index,
      originalTarget:action.target,
      originalHandCount:owner.hand.cards.length,
      originalBenchAttached:bench.energies.cards.length,
      originalActiveAttached:owner.active.energies.cards.length,
      rootActionSelectedByUnmodifiedBot:true
    };
    const alternative=new action.constructor(action.id,action.handIndex,{
      player:players.BOTTOM_PLAYER,slot:slots.BENCH,index
    });
    try{
      const result=descriptor.value.apply(this,[alternative,...args]);
      attempts.push({...before,actualTarget:alternative.target,
        nativeAccepted:true,
        physicalBenchEnergyIncreased:
          bench.energies.cards.length===before.originalBenchAttached+1,
        physicalActiveEnergyPreserved:
          owner.active.energies.cards.length===before.originalActiveAttached,
        physicalHandSpent:
          owner.hand.cards.length===before.originalHandCount-1,
        nativeTurnAfter:this.state.turn
      });
      return result;
    }catch(error){
      attempts.push({...before,actualTarget:alternative.target,
        nativeAccepted:false,error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(NativeStore.prototype,'dispatch',
    {...descriptor,value:dispatched});
  try{
    const result=execute();
    return {result,audit:{schema:VERSION,
      originalStoreInstances:count,targetTurns,attempts,
      nativeAccepted:attempts.filter(x=>x.nativeAccepted).length,
      physicallyConfirmed:attempts.filter(x=>
        x.nativeAccepted&&x.physicalBenchEnergyIncreased&&
        x.physicalActiveEnergyPreserved&&x.physicalHandSpent).length,
      developerSelectedTarget:true,competitiveQualifiedGames:0}};
  }finally{
    assert.strictEqual(NativeStore.prototype.dispatch,dispatched);
    Object.defineProperty(NativeStore.prototype,'dispatch',descriptor);
  }
}

function main(){
  const normal=withOwnerLastBenchReadOnlyAudit(run);
  const search=withOwnerLastBenchReadOnlyAudit(()=>
    withOwnerSearchAlternative(run,{targetTurn:1}));
  const redirected=withOwnerLastBenchReadOnlyAudit(()=>
    withOwnerMewtwoEnergyTarget(()=>
      withOwnerSearchAlternative(run,{targetTurn:1})));
  const summaries=[
    {name:'baseline',data:normal.result,observer:normal.audit},
    {name:'search-only',data:search.result.result,observer:search.audit,
      search:search.result.audit},
    {name:'search-plus-energy',data:redirected.result.result.result,
      observer:redirected.audit,
      energy:redirected.result.audit,
      search:redirected.result.result.audit}
  ].map(t=>({
    name:t.name,
    enginePin:t.data.enginePin,
    sourceRegisteredGames:t.data.attempted,
    originalRank:t.data.originalSourceRank,
    sourceMatchedDealTrials:(t.data.rows??[]).map(conciseRow),
    coreBenchPlays:t.observer.coreBenchPlays,
    energy:t.energy??null,search:t.search??null
  }));
  const reference=summaries[0].sourceMatchedDealTrials;
  const affected='9:0:A:new-moon-lockbreaker-v1';
  const matched=summaries.slice(1).map(row=>({
    case:row.name,
    physicalDealsMatch:row.sourceMatchedDealTrials.length===reference.length&&
      reference.every((ref,index)=>{
        const other=row.sourceMatchedDealTrials[index];
        return ref.id===other.id&&
          ref.fullPhysicalDealFingerprint===other.fullPhysicalDealFingerprint&&
          ref.sourceDealFingerprint===other.sourceDealFingerprint;
      }),
    affectedBaseline:reference.find(row=>row.id===affected)??null,
    affectedTreatment:row.sourceMatchedDealTrials.find(row=>row.id===affected)??null,
    negativeAttempts:row.energy?.attempts.filter(x=>!x.nativeAccepted)??[]
  }));
  return {
    schema:VERSION,
    researchRevision:process.env.GITHUB_SHA??null,
    experiments:summaries,matched,
    sourceSixtyChanged:false,candidateSixtyChanged:false,
    developerRetrospective:true,autonomousPolicyQualified:false,
    competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,withOwnerMewtwoEnergyTarget,main};

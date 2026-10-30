'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {withNumericShuffleValidator}=require('./agent22-numeric-shuffle-validation-hook.cjs');
const {sparseObservedOwnerSearch,withSparseActorOwnerSearch}=
  require('./agent22-sparse-owner-search-adapter.cjs');

const SEEDS=[324711001,324711002];
const VALUES={'VS Seeker PHF':10,'Counter Catcher PAR':8,
  'Capture Energy RCL':6};
/** @param {readonly string[]} names @returns {number} */
const scoreBundle=names=>[...new Set(names)].reduce((n,x)=>
  n+(VALUES[x]??0),0)-100*(names.length-new Set(names).size);

/** @returns {object} */
function run(){
  initializeCards();
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const byRank=new Map(manifest.decks.map(d=>[d.rank,d]));
  for(const rank of [1,7]){
    const d=byRank.get(rank);
    assert.ok(d?.playableUnderEngine&&d.cardIds.length===60);
  }
  const rows=[];
  for(const seed of SEEDS)for(const sourceSeat of [0,1]){
    const request={deckA:byRank.get(sourceSeat===0?7:1).cardIds,
      deckB:byRank.get(sourceSeat===1?7:1).cardIds,
      seed,maxActions:80,strictPromptValidation:true,
      isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
      supporterDecisionCorrection:true,
      captureInitialSourceDealFingerprintSeat:sourceSeat};
    const pair={seed,sourceSeat,branches:[],sameSourceDeal:null};
    for(const policy of ['lexical-control','scored-opt-in']){
      let result=null,error=null,search=null;
      try{
        const w=withNumericShuffleValidator(()=>withSparseActorOwnerSearch(()=>runMatch(request),{
          observe:(state,seat)=>seat===sourceSeat?
            sparseObservedOwnerSearch(state,seat,actorObservation,
              policy==='scored-opt-in'?scoreBundle:null):null}));
        const g=w.result;
        result={deal:g.initialSourceDealFingerprint?.digestSha256??null,
          deckHashes:g.deckHashes,firstTurnSlot:g.firstTurnSlot,
          winner:g.winner,actions:g.actions,turns:g.turns,
          endReason:g.endReason,prizesRemaining:g.prizesRemaining};
        search={accepted:w.audit.bySeat[sourceSeat],
          postconditions:w.audit.nativePromptPostconditionsConfirmed,
          selections:w.audit.boundedSelections,
          numericShuffleValidationHook:true};
      }catch(e){error=String(e?.stack??e);}
      pair.branches.push({policy,result,error,search});
    }
    const [a,b]=pair.branches;
    if(a.result?.deal&&b.result?.deal){
      pair.sameSourceDeal=a.result.deal===b.result.deal;
      assert.equal(pair.sameSourceDeal,true);
    }
    rows.push(pair);
  }
  assert.equal(rows.length,4);
  return {schema:'agent22-rank7-dealt-steven-v1',sourceRank:7,
    opponentRank:1,seeds:SEEDS,maxActions:80,
    source60sUnchanged:true,scoreValues:VALUES,
    attempted:8,rows,competitiveQualifiedGames:0};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={SEEDS,scoreBundle,run};

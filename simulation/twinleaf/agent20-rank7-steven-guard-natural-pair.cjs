'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {run:unmodifiedSourceStudy,SEEDS,scoreBundle}=
  require('./agent22-rank7-dealt-steven-pair.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {withNumericShuffleValidator}=
  require('./agent22-numeric-shuffle-validation-hook.cjs');
const {sparseObservedOwnerSearch,withSparseActorOwnerSearch}=
  require('./agent22-sparse-owner-search-adapter.cjs');

const compiled=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const MANIFEST=path.resolve(__dirname,
  '../../results/aichi-2026/full-decklists.json');

/**
 * Re-execute the exact Agent 22 pre-registered source deals and owner-search
 * protocols with the headless-owned opt-in Steven Store guard enabled.
 * This verifies integration through the ordinary runMatch boundary.
 *
 * @returns {object} One 8-arm guarded original-source development receipt.
 */
function runGuardedSourceStudy() {
  initializeCards();
  const manifest=resolveManifestFile(MANIFEST,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const byRank=new Map(manifest.decks.map(row=>[row.rank,row]));
  for(const rank of [1,7]){
    const deck=byRank.get(rank);
    assert.ok(deck?.playableUnderEngine);
    assert.equal(deck.cardIds.length,60);
  }
  const rows=[];
  for(const seed of SEEDS)for(const sourceSeat of [0,1]){
    const request={
      deckA:byRank.get(sourceSeat===0?7:1).cardIds,
      deckB:byRank.get(sourceSeat===1?7:1).cardIds,
      seed,maxActions:80,strictPromptValidation:true,
      isolatePolicyRandomness:true,
      postSuperAliasRepairIsolation:true,
      supporterDecisionCorrection:true,
      captureInitialSourceDealFingerprintSeat:sourceSeat,
      stevenPaperMinimumCorrection:true
    };
    const pair={seed,sourceSeat,branches:[],sameSourceDeal:null};
    for(const policy of ['lexical-control','scored-opt-in']){
      let result=null,error=null,search=null,guardAudit=null;
      try{
        const response=withNumericShuffleValidator(()=>
          withSparseActorOwnerSearch(()=>runMatch(request),{
            observe:(state,seat)=>seat===sourceSeat?
              sparseObservedOwnerSearch(state,seat,actorObservation,
                policy==='scored-opt-in'?scoreBundle:null):null
          }));
        const game=response.result;
        result={
          deal:game.initialSourceDealFingerprint?.digestSha256??null,
          deckHashes:game.deckHashes,
          firstTurnSlot:game.firstTurnSlot,
          winner:game.winner,
          actions:game.actions,
          turns:game.turns,
          endReason:game.endReason,
          prizesRemaining:game.prizesRemaining
        };
        search={
          accepted:response.audit.bySeat[sourceSeat],
          postconditions:response.audit.nativePromptPostconditionsConfirmed,
          selections:response.audit.boundedSelections,
          numericShuffleValidationHook:true
        };
        guardAudit=game.stevenPaperMinimumAudit;
        assert.equal(game.stevenPaperMinimumCorrection,true);
        assert.ok(guardAudit);
      }catch(exception){error=String(exception?.stack??exception);}
      pair.branches.push({policy,result,error,search,guardAudit});
    }
    const [first,second]=pair.branches;
    if(first.result?.deal&&second.result?.deal){
      pair.sameSourceDeal=first.result.deal===second.result.deal;
      assert.equal(pair.sameSourceDeal,true);
    }
    rows.push(pair);
  }
  assert.equal(rows.length,4);
  return {sourceRank:7,opponentRank:1,seeds:SEEDS,
    attempted:8,competitiveQualifiedGames:0,rows};
}

/** @returns {object} Matched natural-source Store rule-guard comparison. */
function run(){
  const {Store}=require(path.join(compiled,'game/store/store'));
  const nativeDispatch=Store.prototype.dispatch;
  const baseline=unmodifiedSourceStudy();
  assert.strictEqual(Store.prototype.dispatch,nativeDispatch,
    'Original baseline must restore the pinned Store dispatch');
  const guarded=runGuardedSourceStudy();
  assert.strictEqual(Store.prototype.dispatch,nativeDispatch,
    'Integrated headless opt-in correction must fully restore Store dispatch');

  assert.equal(baseline.attempted,8);
  assert.equal(guarded.attempted,8);
  assert.deepEqual(guarded.seeds,baseline.seeds);
  const audits=[];
  for(let i=0;i<baseline.rows.length;i++){
    const left=baseline.rows[i],right=guarded.rows[i];
    assert.equal(right.seed,left.seed);
    assert.equal(right.sourceSeat,left.sourceSeat);
    assert.equal(right.sameSourceDeal,left.sameSourceDeal);
    for(let j=0;j<left.branches.length;j++){
      const a=left.branches[j],b=right.branches[j];
      assert.equal(b.policy,a.policy);
      assert.deepEqual(b.result,a.result);
      assert.deepEqual(b.error,a.error);
      assert.deepEqual(b.search,a.search);
      assert.ok(b.guardAudit);
      audits.push(b.guardAudit);
    }
  }
  assert.equal(audits.length,8);
  assert.equal(audits.reduce((n,a)=>n+a.emptyVetoed,0),0);
  const observed=audits.reduce((n,a)=>n+a.sourceStampedOwnDeckPrompts,0);
  const accepted=audits.reduce((n,a)=>n+a.nonemptyAccepted,0);
  assert.ok(observed>0,
    'A genuine original rank7 source search must cross integrated Store guard');
  assert.equal(accepted,observed);

  return {
    schema:'agent20-rank7-integrated-steven-minimum-nonperturbation-v2',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:7,opponentRank:1,
    originalSource60sUnchanged:true,
    controlSeeds:guarded.seeds,
    originalPhysicalSeats:[0,1],
    actionsPerArmCap:80,
    arms:guarded.attempted,
    baselineVsGuardedRowsIdentical:true,
    sourceStampedOwnDeckPromptCount:observed,
    nativeAcceptedPaperValidPromptCount:accepted,
    emptyPromptVetoes:0,
    headlessOptInFlag:'stevenPaperMinimumCorrection',
    StoreDispatchRestored:true,
    competitiveQualifiedGames:0,
    limitation:'Reuses known Agent22 source-deal seeds, developmental capped actions, no independent competitive game inference'
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,runGuardedSourceStudy};

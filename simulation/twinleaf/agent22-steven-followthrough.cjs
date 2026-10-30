'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');

const expected=new Map([
  ['324711001:0',{deal:'f56f2980911c2c321d343406ff94be6f7acc389f83e4c851bf0448c8879fb8b0',turns:[7,8],searches:2}],
  ['324711001:1',{deal:'9bf1394508b623c261d48227525750f12290f411a697b4d096a0b95a17fcc2bd',turns:[6,6],searches:1}],
  ['324711002:0',{deal:'d8782a279dc5bb3a097d67a1280afc24fe298ff4e9ffb5da271660876a79a59e',turns:[10,10],searches:1}],
  ['324711002:1',{deal:'886dde53b719d41d76fecb2c1da9f88867afd86c4e9379052dffcfd9cc4f227a',turns:[7,7],searches:0}]
]);

/**
 * Pure read-only source/opponent root follow-through, conditional on an
 * already accepted original-Store owner search. Printed name matching can
 * never prove that a particular duplicate physical copy entered play.
 * @param {readonly object[]} selections
 * @param {readonly object[]} rootLedger
 * @param {0|1} sourceSeat
 * @returns {object[]}
 */
function analyzeFollowthrough(selections,rootLedger,sourceSeat){
  const roots=rootLedger.filter(row=>row.pendingPrompt===null);
  const sourcePlays=roots.filter(row=>row.playerSlot===sourceSeat&&
    row.action==='PlayCardAction');
  return selections.map(selection=>{
    const after=sourcePlays.filter(row=>row.turnBefore>selection.turn);
    const opponents=roots.filter(row=>row.playerSlot!==sourceSeat&&
      row.turnBefore>selection.turn);
    return {searchTurn:selection.turn,printings:selection.printings,
      laterSourcePlays:after.map(row=>({ordinal:row.actionOrdinal,
        turn:row.turnBefore,card:row.card})),
      subsequentPrintedPlays:selection.printings.map(printing=>({
        printing,
        playedLaterByName:after.some(row=>row.card===printing)
      })),
      opponentRootAfterSearch:opponents.length>0,
      opponentFirstRootAfterSearch:opponents[0]?.actionOrdinal??null};
  });
}

/** @returns {object} Full retained denominator of retrospective trials. */
function run(){
  // Native imports are deferred so pure source-root lineage tests run
  // without building or loading the pinned vendor submodule.
  const {runMatch,initializeCards}=require('./headless.cjs');
  const {resolveManifestFile}=require('./resolve-field.cjs');
  const {actorObservation}=require('./actor-observation-contract.cjs');
  const {SEEDS,scoreBundle}=require('./agent22-rank7-dealt-steven-pair.cjs');
  const {withNumericShuffleValidator}=
    require('./agent22-numeric-shuffle-validation-hook.cjs');
  const {sparseObservedOwnerSearch,withSparseActorOwnerSearch}=
    require('./agent22-sparse-owner-search-adapter.cjs');
  initializeCards();
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  for(const rank of [1,7])
    assert.ok(byRank.get(rank)?.playableUnderEngine&&
      byRank.get(rank).cardIds.length===60);
  const rows=[];
  for(const seed of SEEDS)for(const sourceSeat of [0,1]){
    const frozen=expected.get(seed+':'+sourceSeat);
    for(const [arm,policy] of ['lexical-control','scored-opt-in'].entries()){
      const request={
        deckA:byRank.get(sourceSeat===0?7:1).cardIds,
        deckB:byRank.get(sourceSeat===1?7:1).cardIds,
        seed,maxActions:80,strictPromptValidation:true,
        isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
        supporterDecisionCorrection:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureDecisionTrace:true
      };
      let status='native-exception',error=null,summary=null;
      try{
        const w=withNumericShuffleValidator(()=>
          withSparseActorOwnerSearch(()=>runMatch(request),{
            observe:(state,seat)=>seat===sourceSeat?
              sparseObservedOwnerSearch(state,seat,actorObservation,
                policy==='scored-opt-in'?scoreBundle:null):null
          }));
        const game=w.result,ledger=game.rootActionLedger;
        assert.ok(Array.isArray(ledger));
        assert.equal(game.initialSourceDealFingerprint.digestSha256,
          frozen.deal,'source deal drift from frozen prior study');
        assert.equal(game.firstTurnSlot,0);
        assert.equal(game.actions,80);
        assert.equal(game.turns,frozen.turns[arm]);
        assert.equal(game.endReason,'action-limit');
        assert.deepEqual(game.prizesRemaining,[6,6]);
        assert.equal(w.audit.bySeat[sourceSeat],frozen.searches);
        status='native-replay-identical';
        const publicRoots=ledger.filter(row=>row.pendingPrompt===null);
        summary={
          originalOutcomeReproduced:true,
          sourceDealFingerprint:frozen.deal,
          sourceActualStart:sourceSeat===0?'first':'second',
          actions:game.actions,turns:game.turns,
          endReason:game.endReason,prizesRemaining:game.prizesRemaining,
          ledgerCount:ledger.length,
          ledgerSha256:crypto.createHash('sha256')
            .update(JSON.stringify(ledger)).digest('hex'),
          ownerSearchAccepted:w.audit.bySeat[sourceSeat],
          acceptedSourceRootCards:publicRoots.filter(row=>
            row.playerSlot===sourceSeat&&row.action==='PlayCardAction')
            .map(row=>({ordinal:row.actionOrdinal,
              turn:row.turnBefore,card:row.card})),
          acceptedOpponentRoots:publicRoots.filter(row=>
            row.playerSlot!==sourceSeat).length,
          searchFollowthrough:analyzeFollowthrough(
            w.audit.boundedSelections,ledger,sourceSeat)
        };
      }catch(e){error=String(e?.stack??e);}
      rows.push({seed,sourceSeat,policy,status,error,summary});
    }
  }
  assert.equal(rows.length,8);
  return {schema:'agent22-rank7-steven-native-followthrough-retrospective-v1',
    original60sUnchanged:true,reusedKnownSourceSeeds:SEEDS,
    attempted:8,rows,competitiveQualifiedGames:0,
    caveat:'Read-only root audit for previously selected capped deals. Printed-name matches are not copy-identity proof. No real opponent-policy skill or complete game outcome.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={analyzeFollowthrough,run};

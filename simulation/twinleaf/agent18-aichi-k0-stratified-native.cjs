'use strict';
const assert=require('node:assert/strict');
const {runMatch}=require('./headless.cjs');
const {sourceDecks,observeSourceK0}=
  require('./agent18-aichi-source-k0-native-root.cjs');
const SOURCE_RANKS=Object.freeze([2,6,10,11,24,29]);
const SEED=4246551499;
const MAX_ACTIONS=48;

/** @param {object} result Pinned headless bounded source outcome. */
function outcome(result){
  return {
    deckHashes:result.deckHashes,winner:result.winner,
    actions:result.actions,turns:result.turns,
    endReason:result.endReason,prizesRemaining:result.prizesRemaining
  };
}

/**
 * Complete preserved original source printing inputs and unchanged native
 * bot decisions; the owner-only policy is observed, never substituted.
 * @param {readonly number[]} ranks Preregistered full-source opponent ranks.
 * @param {string} registration Registration document.
 * @param {string} schema Versioned summary label.
 * @returns {object} Failure-inclusive fixed-sample public summary.
 */
function runRanks(ranks,registration,schema){
  const originals=sourceDecks();
  const champion=originals.get(1);
  assert.equal(champion?.playableUnderEngine,true);
  const rows=[];
  for(const rank of ranks){
    const opposing=originals.get(rank);
    const entry={rank,sourceArchetype:opposing?.archetype??null,
      seed:SEED,maxActions:MAX_ACTIONS};
    try{
      assert.equal(opposing?.playableUnderEngine,true,
        'Registered original rank lacks a complete engine-playable source 60');
      const request={
        deckA:champion.cardIds,deckB:opposing.cardIds,
        seed:SEED,maxActions:MAX_ACTIONS,
        label:'agent18-original-rank1-vs-'+rank+'-K0-survey',
        strictPromptValidation:true,isolatePolicyRandomness:true,
        postSuperAliasRepairIsolation:true,supporterDecisionCorrection:true
      };
      const original=runMatch(request);
      const observed=observeSourceK0(()=>runMatch(request));
      assert.deepStrictEqual(outcome(original),outcome(observed.result),
        'Owner-only K0 observer changed native source result');
      assert.equal(observed.rows.length,2,
        'Expected one first original native owner root per actual seat');
      assert.ok(observed.rows.every(row=>
        row.status==='K0-native-source-owner-invariant'&&
        row.physicalObjectsRestored===true&&
        row.sameRootAllProposersK0Invariant===true&&
        row.sameRootReceipt?.independentAllProposers===true&&
        row.sameRootReceipt?.changed===false&&
        row.nativeStoreFirstActionDispatched===true&&
        row.nativeStoreFirstActionAccepted===true),
        'Both original source roots must have accepted native Store actions');
      if(rank===2||rank===10){
        const sourceOpponentRoot=observed.rows.find(row=>row.seat===1);
        const expected=rank===2?'Stealthy Hood UNB':'Muscle Band XY';
        assert.equal(sourceOpponentRoot?.nativeBotProposedHandPrinting,
          expected,'Expected actual original source-native held Tool printing');
        assert.equal(sourceOpponentRoot.nativeStoreFirstActionCardLeftHand,true);
        assert.equal(sourceOpponentRoot.nativeStoreFirstActionAttachedToolTarget
          ?.printing,expected,
          'Native first-root Tool must physically attach to original source owner');
        const nativeTarget=sourceOpponentRoot.nativeStoreFirstActionAttachedToolTarget;
        assert.ok(sourceOpponentRoot.ownerToolCandidates.some(candidate=>
          candidate.printing===expected&&
          candidate.handIndex===sourceOpponentRoot.nativeBotProposedHandIndex&&
          candidate.slot===nativeTarget.slot&&
          candidate.index===nativeTarget.index),
          'Owner-only Tool candidates must include actual Store-positive source target');
        const matchingSameRootTools=sourceOpponentRoot.sameRootReceipt.offers
          .filter(offer=>offer.source==='owner-tool'&&
            offer.printing===expected&&
            offer.handIndex===sourceOpponentRoot.nativeBotProposedHandIndex&&
            offer.slot===nativeTarget.slot&&
            offer.index===nativeTarget.index);
        assert.equal(matchingSameRootTools.length,1,
          'Shared same-root owner Tool proposer must expose actual native-positive original Tool target');
        assert.equal(matchingSameRootTools[0].nativeDispatchImplemented,false,
          'A proposed original Tool target remains observation-only');
        assert.equal(sourceOpponentRoot.nativeStoreToolActionEncodingEquivalent,true,
          'Detached owner-native Tool action constructor must match actual Store-positive bot action');
        assert.deepStrictEqual(sourceOpponentRoot.nativeStoreToolActionEncodingTarget,{
          slot:nativeTarget.slot,index:nativeTarget.index,
          printing:expected,handIndex:sourceOpponentRoot.nativeBotProposedHandIndex
        });
      }
      Object.assign(entry,{
        status:'native-source-K0-both-owner-roots-passed',
        ownerRoots:observed.rows.map(row=>({
          physicalSeat:row.seat,globalTurn:row.turn,
          chosenIntent:row.chosenOwnerOnlyIntent,
          sameRootCollectorVersion:row.sameRootCollectorVersion,
          sameRootAllProposersK0Invariant:
            row.sameRootAllProposersK0Invariant,
          sameRootReceipt:row.sameRootReceipt,
          nativeBotProposedActionClass:row.nativeBotProposedActionClass,
          nativeBotProposedHandIndex:row.nativeBotProposedHandIndex,
          nativeBotProposedHandPrinting:row.nativeBotProposedHandPrinting,
          nativeStoreFirstActionDispatched:row.nativeStoreFirstActionDispatched,
          nativeStoreFirstActionAccepted:row.nativeStoreFirstActionAccepted,
          nativeStoreFirstActionCardLeftHand:
            row.nativeStoreFirstActionCardLeftHand,
          nativeStoreFirstActionAttachedToolTarget:
            row.nativeStoreFirstActionAttachedToolTarget,
          nativeStoreToolActionEncodingEquivalent:
            row.nativeStoreToolActionEncodingEquivalent,
          nativeStoreToolActionEncodingTarget:
            row.nativeStoreToolActionEncodingTarget,
          ownerToolCandidates:row.ownerToolCandidates,
          nativeStoreFirstActionPublicBefore:
            row.nativeStoreFirstActionPublicBefore,
          nativeStoreFirstActionPublicAfter:
            row.nativeStoreFirstActionPublicAfter,
          ownerKnownHand:row.ownerKnownHand,
          ownActive:row.ownActivePublicPrinting,
          ownBench:row.ownBenchPublicPrintings,
          opponentActive:row.opponentActivePublicPrinting,
          sourceDeckSize:row.sourceDeckCards,
          secretPrizes:row.faceDownPrizeCount
        })),outcome:outcome(original),observerOutcomeParity:true
      });
    }catch(error){
      entry.status='blocked';
      entry.error=String(error?.stack??error).slice(0,1400);
    }
    rows.push(entry);
  }
  return {schema,registration,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixedChampionOriginalRank:1,rankSet:[...ranks],
    passed:rows.filter(row=>row.status.includes('passed')).length,
    blocked:rows.filter(row=>row.status==='blocked').length,
    rows,sourceRootSameRootCollectorVersion:
      require('./agent41-same-root-proposal-choice.cjs').VERSION,
    sameRootAuditedOwnerRoots:rows.reduce((sum,row)=>sum+
      (row.ownerRoots?.filter(root=>
        root.sameRootAllProposersK0Invariant===true).length??0),0),
    competitiveQualifiedGames:0,
    caveat:'48-action source-openers only, owner-only selection observer and weak original bot, no finished matchup or win-rate estimate.'};
}
/** @returns {object} Original six-rank study, frozen and reproducible. */
function run(){
  return runRanks(SOURCE_RANKS,
    'agents/agent18/20261029-aichi-k0-stratified-native-protocol.md',
    'agent18-aichi-original-source-K0-six-rank-survey-v5');
}
if(require.main===module){
  const audit=run();
  process.stdout.write(JSON.stringify(audit,null,2)+'\n');
  if(audit.blocked>0)process.exitCode=1;
}
module.exports={SOURCE_RANKS,outcome,runRanks,run};

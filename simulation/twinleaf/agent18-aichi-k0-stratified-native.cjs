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
 * @returns {object} Failure-inclusive fixed six-rank public summary.
 */
function run(){
  const originals=sourceDecks();
  const champion=originals.get(1);
  assert.equal(champion?.playableUnderEngine,true);
  const rows=[];
  for(const rank of SOURCE_RANKS){
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
        row.physicalObjectsRestored===true),
        'Both owner roots must pass authentic K0 source invariance');
      Object.assign(entry,{
        status:'native-source-K0-both-owner-roots-passed',
        ownerRoots:observed.rows.map(row=>({
          physicalSeat:row.seat,globalTurn:row.turn,
          chosenIntent:row.chosenOwnerOnlyIntent,
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
  return {schema:'agent18-aichi-original-source-K0-six-rank-survey-v1',
    registration:'agents/agent18/20261029-aichi-k0-stratified-native-protocol.md',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixedChampionOriginalRank:1,rankSet:SOURCE_RANKS,
    passed:rows.filter(row=>row.status.includes('passed')).length,
    blocked:rows.filter(row=>row.status==='blocked').length,
    rows,competitiveQualifiedGames:0,
    caveat:'48-action source-openers only, owner-only selection observer and weak original bot, no finished matchup or win-rate estimate.'};
}
if(require.main===module){
  const audit=run();
  process.stdout.write(JSON.stringify(audit,null,2)+'\n');
  if(audit.blocked>0)process.exitCode=1;
}
module.exports={SOURCE_RANKS,outcome,run};

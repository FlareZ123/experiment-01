'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {withAttachedToolPowerTactic} = require('./attached-tool-power-tactic.cjs');

/**
 * Bounded source-rank-5 Mew/Genesect mirror experiment. Both sides retain the
 * same published, fixed 60. No rank or win-rate extrapolation is permitted:
 * purpose is to measure whether a newly enumerable Tool-granted Power is
 * ever selected under the weak default score and prompt policies.
 */
function runSourcePilot() {
  const field = resolveManifestFile(
    path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true}
  );
  const deck = field.decks.find(d=>d.rank===5);
  assert.ok(deck?.playableUnderEngine, 'Published rank 5 must resolve under the pinned engine');
  assert.equal(deck.cardIds.length,60);
  const seeds=[20261016,20261017];
  const trials=[];
  for(const seed of seeds) {
    const common={
      deckA:deck.cardIds,deckB:deck.cardIds,seed,maxActions:250,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      isolatePolicyRandomness:true,
      label:'bounded Tool-granted Power source-policy characterization'
    };
    for(const kind of ['default','attached-tool-power-v1']){
      try {
        const run=()=>runMatch(common);
        const result=kind==='default'?run():withAttachedToolPowerTactic(run);
        const star=result.abilityTrace.filter(x=>x.name==='Star Alchemy');
        const stones=result.cardsPlayedBySeat.map(plays=>plays['Forest Seal Stone']||0);
        assert.equal(result.deckHashes[0],result.deckHashes[1],
          'Frozen symmetric mirror must use identical 60-card identities');
        trials.push({seed,kind,status:result.finished?'finished':'action-limited',
          actions:result.actions,turns:result.turns,stonesAttachedBySeat:stones,
          starAlchemyActions:star,deckHashes:result.deckHashes,
          gamePolicy:result.policy});
      } catch(error) {
        trials.push({seed,kind,status:'engine-exception',
          error:String(error.message)});
      }
    }
  }
  for(const t of trials.filter(x=>x.kind==='default'&&x.status!=='engine-exception')){
    assert.equal(t.starAlchemyActions.length,0,
      'Pinned default bot unexpectedly used a Tool-only Power');
  }
  return {kind:'source-print Tool-granted Ability policy characterization',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    publishedRank:5, sampledSeeds:seeds,
    limitation:'No competitive bot validation; maxActions=250; no win rate',
    trials};
}

if(require.main===module) {
  const report=runSourcePilot();
  console.log(JSON.stringify(report,null,2));
  if(report.trials.every(t=>t.status==='engine-exception'))process.exitCode=1;
}
module.exports={runSourcePilot};

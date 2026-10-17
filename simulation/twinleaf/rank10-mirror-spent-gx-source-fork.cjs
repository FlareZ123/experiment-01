'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withSourceApexObservation,firstActionDifference}=
  require('./rank10-apex-prize-source-pair.cjs');

/** Source-matched version-frozen diagnostic, not a qualified win sample. */
function main(){
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const deck=manifest.decks.find(x=>x.rank===10);
  assert.ok(deck?.playableUnderEngine);
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const base={
    deckA:deck.cardIds,deckB:deck.cardIds,
    seed:3245590697,maxActions:350,
    label:'rank10-mirror-source-GX-fork',
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true,
    apexSpreadPrizeWindowPolicy:true
  };
  const run=spent=>withSourceApexObservation(Store,()=>
    runMatch({...base,...(spent?{spentGxCopyPolicy:true}:{})}));
  const control=run(false),legalCopy=run(true);
  assert.deepEqual(control.result.deckHashes,legalCopy.result.deckHashes);
  assert.ok(control.firstNormalTurnZoneDigest);
  assert.equal(control.firstNormalTurnZoneDigest,
    legalCopy.firstNormalTurnZoneDigest,
    'Changed initial full source hand/deck/Prize-zone deal');
  assert.equal(control.result.firstTurnSlot,0);
  assert.equal(legalCopy.result.firstTurnSlot,0);
  const first=firstActionDifference(control.sourceActions,legalCopy.sourceActions);
  assert.ok(first,'Expected a reproducible source decision divergence');
  assert.equal(first.control?.selectedAttack,'Timeless-GX',
    'Unexpected first source change in control');
  assert.equal(first.experimental?.selectedAttack,'Shred',
    'Source usedGX-aware policy failed to select legal Shred');
  const info=x=>({
    finished:x.result.finished,actions:x.result.actions,turns:x.result.turns,
    winner:x.result.winner,prizesRemaining:x.result.prizesRemaining,
    copyChoices:x.copyChoices,spreadChoices:x.spreadChoices,
    rootActions:x.sourceActions.length,
    traceSha256:crypto.createHash('sha256')
      .update(JSON.stringify(x.sourceActions)).digest('hex')
  });
  return {
    schema:'rank10-mirror-spent-gx-policy-source-fork-v1',
    exactSourceOpponentRank:10,actualFirstSlot:0,seed:base.seed,
    engine:control.result.engine,
    basePolicy:'DDEv4+ApexSpreadPrizeWindow',
    experimentalAddition:'SpentGxLegalCopy-v1',
    sameInitialSourceDeal:true,firstRootActionDifference:first,
    control:info(control),experimental:info(legalCopy),
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};

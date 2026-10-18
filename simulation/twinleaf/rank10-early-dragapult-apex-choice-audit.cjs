'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {observableDigest} = require('./dde-source-clone-seat-panel.cjs');
const {withSourceApexCopyTrace} =
  require('./dde-root133-apex-copy-audit.cjs');
const {withDragapultCostAnswer} =
  require('./rank10-early-dragapult-discard-fork.cjs');

const output = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const BASELINE =
  '376b5219aafa79a3730e0a574e5d538b2b927180ea66d0c79df717228ee071dc';
const DRAGON_FORK =
  '901e1f5fa7073a3b6961563055dd19fad03d3bf8b913a72d4725e30b3fe6485d';

/**
 * Source Store copies and observed public state, including missed resolution.
 * @param {object} attack One real-root Apex Dragon declaration's lifecycle.
 * @returns {object} Read-only, concise print-aware turn provenance.
 */
function summarizeAttack(attack) {
  return {
    turn:attack.turn,rootStep:attack.rootStep,
    dragonDiscardBefore:attack.before.ownDragonDiscard,
    opponentBefore:attack.before.opposingActive,
    opponentBenchBefore:attack.before.opposingBench,
    selectedCopiedAttacks:attack.copySelections.map(choice=>({
      printedSource:choice.selectedPrinting,attack:choice.selectedName,
      legalOptions:choice.available.filter(option=>!option.blocked)
        .map(option=>({source:option.printing,name:option.name,
          printedDamage:option.printedDamage})),
      opponentAfterSelection:choice.after.opposingActive,
      prizesAfterSelection:choice.after.prizesRemaining
    })),
    endOfTurn:attack.endOfTurn ?? attack.lastObserved ?? null
  };
}

/**
 * Observe two already frozen source-root games without changing further
 * decisions: one original, one actual Dragon-discard prompt counterfactual.
 * @returns {object} Source copied-attack outcome witness.
 */
function main() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),
  {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  assert.ok(byRank.get(1)?.playableUnderEngine &&
    byRank.get(10)?.playableUnderEngine);
  const request={deckA:byRank.get(1).cardIds,
    deckB:byRank.get(10).cardIds,seed:4246551500,
    maxActions:350,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank10-early-Dragapult-real-Apex-copy-choice-observation'};
  initializeCards();
  const {Store}=require(path.join(output,'game/store/store'));
  const control=withSourceApexCopyTrace(Store,()=>runMatch(request));
  const altered=withSourceApexCopyTrace(Store,()=>
    withDragapultCostAnswer(Store,()=>runMatch(request)));
  const repeat=runMatch(request);
  const candidate=altered.result.result;
  assert.equal(observableDigest(control.result),BASELINE);
  assert.equal(observableDigest(repeat),BASELINE,
    'Original source changed after nested fork and root observer cleanup');
  assert.equal(observableDigest(candidate),DRAGON_FORK);
  assert.equal(altered.result.forcedSelections,1,
    'Root-only earlier Dragon selection was not exercised');
  assert.equal(altered.result.physicalDiscardConfirmed,true);
  assert.equal(control.attacks.length,6);
  assert.equal(altered.attacks.length,5);
  return {
    kind:'rank10-early-Dragapult-actual-Apex-copy-resolutions',
    source:{ranksByPhysicalSeat:[1,10],seed:4246551500,
      pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      policy:'simplified DoubleDragonAttachTactic-v4'},
    sourceControlVerified:true,
    earlierPhysicalDiscardVerified:true,
    original:{terminal:{winner:control.result.winner,turns:control.result.turns,
      actions:control.result.actions,prizesRemaining:control.result.prizesRemaining},
      digest:BASELINE,realCopiedAttacks:control.attacks.map(summarizeAttack)},
    changedDiscard:{terminal:{winner:candidate.winner,turns:candidate.turns,
      actions:candidate.actions,prizesRemaining:candidate.prizesRemaining},
      digest:DRAGON_FORK,realCopiedAttacks:altered.attacks.map(summarizeAttack)},
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={summarizeAttack,main};

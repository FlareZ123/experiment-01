'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');

/**
 * Bounded paired source-locked 4-versus-17 mirror under generic Twinleaf AI.
 * The policy is known to be strategically weak and never produces an
 * admissible competitive win-rate estimate. Goal: determine whether the
 * corrected Electro Rain attack is exercised in this concrete policy run.
 */
function compareSourceReachability() {
  const resolved=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,
      allowJapanesePromoHooks:true
    });
  const a=resolved.decks.find(d=>d.rank===4);
  const b=resolved.decks.find(d=>d.rank===17);
  assert.ok(a?.playableUnderEngine&&b?.playableUnderEngine);
  const common={
    deckA:a.cardIds,deckB:b.cardIds,
    seed:20261016,maxActions:350,
    strictPromptValidation:true,
    supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    label:'source-rank4-rank17-paired-semantic-reachability'
  };
  const control=runMatch({...common,electroRainDamageCorrection:false});
  const corrected=runMatch({...common,electroRainDamageCorrection:true});
  assert.deepEqual(control.deckHashes,corrected.deckHashes);
  assert.deepEqual(control.rules,corrected.rules);
  assert.equal(control.firstTurnSlot,corrected.firstTurnSlot);
  assert.equal(control.electroRainDamageCorrection,false);
  assert.equal(corrected.electroRainDamageCorrection,true);

  /** @param {object} x */
  const summarize=x=>({
    actions:x.actions,
    finished:x.finished,
    turns:x.turns,
    firstTurnSlot:x.firstTurnSlot,
    prizesRemaining:x.prizesRemaining,
    attacks:x.attackTrace.map(event=>({
      turn:event.turn,seat:event.seat,attacker:event.activePokemon,attack:event.attack
    })),
    electroRainCount:x.attackTrace.filter(event=>event.attack==='Electro Rain').length,
    evolutionCount:(x.actionCounts?.PlayPokemonAction??0),
    terminalReason:x.endReason,
    policy:x.policy,
    promptValidationMode:x.promptValidationMode
  });
  return {
    kind:'one fixed-seed bounded generic-policy attack-reachability diagnostic',
    sourceRanks:[4,17],
    seed:common.seed,
    maxActions:common.maxActions,
    control:summarize(control),
    corrected:summarize(corrected),
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    warning:'No candidate optimization, representative game policy, matchup estimate or victory-rate inference'
  };
}
if(require.main===module)console.log(JSON.stringify(compareSourceReachability(),null,2));
module.exports={compareSourceReachability};

'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');
const restoreLoader = installStateScopedCopySessionLoader();
let restoreSimulator = () => {};
try {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const load = name => require(path.join(output,name));
  const {resolveManifestFile} = require('./resolve-field.cjs');
  const {runMatch,initializeCards} = require('./headless.cjs');
  const {installCopySessionAwareSimulatorHook} =
    require('./copy-session-aware-simulator-hook.cjs');
  const prefab = load('game/store/prefabs/copy-attack-delegation');
  const originalInherit = prefab.inheritCopyAttackSessionsFromState;
  const exact = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const ranks = new Map(exact.decks.map(row=>[row.rank,row]));
  const candidate = ranks.get(1);
  const opponent = ranks.get(10);
  assert.ok(candidate?.playableUnderEngine && opponent?.playableUnderEngine);
  assert.equal(candidate.cardIds.length,60);
  assert.equal(opponent.cardIds.length,60);
  const request = {
    deckA:opponent.cardIds,
    deckB:candidate.cardIds,
    seed:4246551499,
    maxActions:350,
    label:'agent12-session-source-rank10-historical-deal',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,
    doubleDragonRecovery:true,
    doubleDragonArchiveV3:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  /** @param {object} game */
  const digest = game => crypto.createHash('sha256').update(JSON.stringify({
    firstTurnSlot:game.firstTurnSlot,
    initialCards:game.initialCards,
    rootActionLedger:game.rootActionLedger,
    attackDeclarations:game.attackDeclarationTrace,
    prizesRemaining:game.prizesRemaining,
    winner:game.winner
  })).digest('hex');
  /** @param {object} game */
  const summarize = game=>({
    turns:game.turns,actions:game.actions,
    finished:game.finished,winner:game.winner,firstTurnSlot:game.firstTurnSlot,
    verifiedStartByDrawLog:game.verifiedByDrawLog,
    prizesRemaining:game.prizesRemaining,
    rank10ApexDeclarations:(game.attackDeclarationTrace||[]).filter(
      x=>x.playerSlot===0 && x.attackName==='Apex Dragon').length,
    sourceDigest:digest(game)
  });

  initializeCards();
  // Both games use the same State-scoped copied-session module. Only explicit
  // inheritance into bot-created Simulator branches changes between arms.
  const baseline = runMatch(request);
  const observed = {constructed:0,withCopiedSession:0,
    examples:[]};
  prefab.inheritCopyAttackSessionsFromState = function(parent,clone,...args) {
    const present = prefab.describeCopySessionsForState(parent);
    observed.constructed++;
    if (present.length) {
      observed.withCopiedSession++;
      if (observed.examples.length<5) {
        observed.examples.push({turn:parent.turn,actor:parent.activePlayer,
          session:present.map(item=>({
            copiedPokemon:item.copiedPokemon,
            sourcePokemon:item.sourcePokemon,
            selectedHistory:item.selectedHistory
          }))});
      }
    }
    return originalInherit.call(this,parent,clone,...args);
  };
  let repaired;
  try {
    restoreSimulator = installCopySessionAwareSimulatorHook({
      allowSubclasses:true
    });
    repaired = runMatch(request);
  } finally {
    restoreSimulator();
    restoreSimulator=()=>{};
    prefab.inheritCopyAttackSessionsFromState = originalInherit;
  }
  assert.equal(baseline.verifiedByDrawLog,true);
  assert.equal(repaired.verifiedByDrawLog,true);
  assert.equal(baseline.firstTurnSlot,repaired.firstTurnSlot);
  assert.deepEqual(baseline.deckHashes,repaired.deckHashes);
  assert.ok(observed.constructed>0,
    'Copy-aware subclass must actually wrap bot simulator construction');
  assert.ok(repaired.attackDeclarationTraceProtocol,
    'Central Store attack declarations must remain available');
  const result = {
    schema:'agent12-ranked-source-copied-session-exposure-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:10,sourceCandidateRank:1,seed:request.seed,
    actualStartSeat:repaired.firstTurnSlot,
    immutablePublishedSixties:true,
    baseline:summarize(baseline),
    copiedSessionAware:summarize(repaired),
    simulatorInheritance:observed,
    completeRootLedgerIdentical:digest(baseline)===digest(repaired),
    scope:'One archived exact source 60 versus 60 engine match, frozen seed and policies. Experimental State-scoped copied-attack sessions, no competitive inference.'
  };
  console.log('RANK10_SOURCE_COPY_SESSION',JSON.stringify(result,null,2));
} finally {
  restoreSimulator();
  restoreLoader();
}

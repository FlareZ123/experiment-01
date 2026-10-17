'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {withRank10SourceKoraidonFork}=require('./rank10-koraidon-source-attack-fork.cjs');
const {withRank10PaleMoonWindow}=require('./rank10-pale-moon-window.cjs');
const {withPendingEndTurnSwitchCleanup}=require('./pending-end-turn-switch-cleanup.cjs');

const engine=part=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',part));
const choices=['pass','attack','retreat'];
const semantics=['raw','retreat-corrected'];

/**
 * Evaluate both paper-rule profiles under identical initial source deals and
 * three genuinely dispatched turn-five action choices. Action selection
 * depends only on the public Active, attached Energy and Bench Pokémon.
 * The original policy can make later unrelated decisions differently.
 *
 * @param {{candidate:string,choice:string,semantics:string,sourceDigest:string,
 * winner:unknown,prizes:unknown,removedRootPending:number,rootEvents:object[],
 * window:object[],deckHashes:object}} x
 * @returns {object}
 */
function summarize(x) {
  return {
    choice:x.choice,semantics:x.semantics,sourceDigest:x.sourceDigest,
    winner:x.winner,prizes:x.prizes,
    removedRootPending:x.removedRootPending,
    rootEvents:x.rootEvents,
    window:x.window,
    deckHashes:x.deckHashes
  };
}

/**
 * Validate that all six branches are tied to one actual frozen physical deal.
 * @param {object[]} entries
 */
function assertMatchedMatrix(entries) {
  assert.equal(entries.length,6);
  const observed=new Set();
  const first=entries[0];
  for(const e of entries) {
    const key=e.choice+'/'+e.semantics;
    assert.ok(choices.includes(e.choice));
    assert.ok(semantics.includes(e.semantics));
    assert.ok(!observed.has(key),'Duplicate source action/profile: '+key);
    observed.add(key);
    assert.equal(e.sourceDigest,first.sourceDigest,'Source divergence before decision');
    assert.deepEqual(e.deckHashes,first.deckHashes,'Source 60-card printing identity changed');
    assert.ok(Array.isArray(e.window)&&e.window.length>0);
    assert.ok(e.prizes!==undefined);
  }
  const rawRetreat=entries.find(e=>e.choice==='retreat'&&e.semantics==='raw');
  const correctedRetreat=entries.find(e=>e.choice==='retreat'&&e.semantics==='retreat-corrected');
  assert.equal(rawRetreat.removedRootPending,0);
  assert.ok(correctedRetreat.removedRootPending>0,
    'Corrected source retreat must remove real queued Pale Moon effect');
  for(const choice of ['pass','attack']) {
    const corrected=entries.find(e=>e.choice===choice&&e.semantics==='retreat-corrected');
    assert.equal(corrected.removedRootPending,0,
      'Source action without Active-to-Bench transition must not trigger correction');
  }
  return true;
}

/** Execute and classify every source comparison from exact 60-card source inventories. */
function main() {
  initializeCards();
  const {AttackAction,RetreatAction}=engine('game/store/actions/game-actions');
  const Store=engine('game/store/store').Store;
  const Bot=engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Player=engine('game/store/state/player').Player;
  const types={Store,Bot,AttackAction,RetreatAction};
  const seed=deriveSlotSeeds(20261016,'pilot',10,0).A;
  assert.equal(seed,3162592764);
  const candidates=[
    {id:'champion-reference',value:1},
    {id:'hood-shield-v1',value:JSON.parse(fs.readFileSync(path.resolve(
      __dirname,'../../results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8'))}
  ];
  const findings=[];
  for(const candidate of candidates) {
    const field=planAichi(candidate.value,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
    const opponent=field.opponents.find(d=>d.rank===10);
    assert.equal(field.candidate.cards.length,60);
    assert.equal(opponent.cards.length,60);
    const request={
      deckA:field.candidate.cards,deckB:opponent.cards,
      label:'pilot:10:0:'+candidate.id+':A',seed,maxActions:600,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      captureAttackPassProbes:true,prototypeSafeSimulatorIsolation:false,
      leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
      entryDrawLockCorrection:true
    };
    const cells=[];
    for(const choice of choices) for(const semantic of semantics) {
      const corrected=semantic==='retreat-corrected';
      const observation=withRank10PaleMoonWindow(Store,()=>{
        const doFork=()=>withRank10SourceKoraidonFork(types,()=>runMatch(request),{
          forceAttack:choice==='attack',forceRetreat:choice==='retreat'
        });
        return corrected?withPendingEndTurnSwitchCleanup({Store,Player},doFork):
          {result:doFork(),removedFromRoot:0,
            removedFromSimulatedStores:0,rootEvents:[]};
      });
      const hook=observation.result;
      const fork=hook.result;
      assert.equal(fork.sourceDecisions.length,1);
      cells.push(summarize({
        candidate:candidate.id,choice,semantics:semantic,
        sourceDigest:fork.sourceDecisions[0].stateDigest,
        winner:fork.result.winner,prizes:fork.result.prizesRemaining,
        deckHashes:fork.result.deckHashes,
        removedRootPending:hook.removedFromRoot,
        rootEvents:hook.rootEvents,window:observation.events
      }));
    }
    assertMatchedMatrix(cells);
    findings.push({candidate:candidate.id,sourceDigest:cells[0].sourceDigest,
      cells});
  }
  return {
    schema:'rank10-koraidon-choice-by-delayed-ko-semantics-v1',
    seed,sourceRank:10,candidateSeat:'A',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    exactSourceDecks:true,
    materialLimit:'Later bot policy RNG and strategic choices are not held constant',
    paperRulesValidated:false,qualifiedForCompetitiveInference:false,
    findings
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,assertMatchedMatrix};

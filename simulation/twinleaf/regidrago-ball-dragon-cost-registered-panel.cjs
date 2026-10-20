'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {observableDigest}=require('./dde-source-clone-seat-panel.cjs');
const {POLICY_VERSION,withRegidragoBallDragonCost}=
  require('./regidrago-ball-dragon-cost-policy.cjs');

const project=path.resolve(__dirname,'../..');
const schedule=JSON.parse(fs.readFileSync(path.join(project,
  'results/aichi-2026/registrations/agent20-regidrago-ball-prompt-v1-20261020.json'),'utf8'));

/** @returns {{seat:string,seed:number,repeat:number}[]} */
function registeredPairs(){
  assert.equal(schedule.schema,'agent20-regidrago-ball-dragon-cost-v1');
  const rows=[];
  for(const slot of ['A','B']){
    assert.equal(schedule.seeds[slot].length,8);
    schedule.seeds[slot].forEach((seed,repeat)=>{
      const digest=createHash('sha256').update(
        `agent20-regidrago-ball-dragapult-v1-${slot}-${repeat}`).digest('hex');
      const expected=Number.parseInt(digest.slice(0,8),16);
      assert.equal(seed,expected,'Frozen source-seed registration mismatch');
      rows.push({seat:slot,seed,repeat});
    });
  }
  assert.equal(new Set(rows.map(row=>row.seed)).size,16);
  return rows;
}

/** @param {object} game @param {0|1} regidragoSeat */
function gameSummary(game,regidragoSeat){
  assert.equal(game.verifiedByDrawLog,true);
  return {finished:game.finished,winnerSeat:game.winner,
    endReason:game.endReason??null,firstTurnSlot:game.firstTurnSlot,
    sourceRank10ActuallyFirst:game.firstTurnSlot===regidragoSeat,
    actions:game.actions,turns:game.turns,
    prizesRemaining:game.prizesRemaining,
    sourceApexDeclarations:game.attackTrace.filter(row=>
      row.seat===regidragoSeat&&row.attack==='Apex Dragon').length,
    sourceAttackNames:game.attackTrace.filter(row=>
      row.seat===regidragoSeat).map(row=>row.attack),
    observableDigest:observableDigest(game)};
}

/**
 * Frozen 16-block, 32(+16 restoration controls) source-dealt panel.
 * Every block is kept even when the source didn't play a qualifying Item.
 * Only the 10th-place Regidrago bot's already-played Item cost changes.
 * @returns {object} Mechanically auditable, noncompetitive source diagnosis.
 */
function main(){
  const field=resolveManifestFile(path.join(project,
    'results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  assert.ok(byRank.get(1)?.playableUnderEngine&&
    byRank.get(10)?.playableUnderEngine);
  initializeCards();
  const output=path.join(project,'vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const rows=[];
  for(const arm of registeredPairs()){
    const sourceIsA=arm.seat==='A';
    const slot=sourceIsA?0:1;
    const request={
      deckA:byRank.get(sourceIsA?10:1).cardIds,
      deckB:byRank.get(sourceIsA?1:10).cardIds,
      seed:arm.seed,maxActions:schedule.max_actions,
      label:'agent20-prospective-source-Dragon-cost-'+arm.seat+'-'+arm.repeat,
      doubleDragonRecovery:true,isolatePolicyRandomness:true,
      captureDecisionTrace:true
    };
    const control=runMatch(request);
    const treatment=withRegidragoBallDragonCost(Store,
      sourceIsA?101:202,()=>runMatch(request));
    const replay=runMatch(request);
    const base=gameSummary(control,slot);
    const changed=gameSummary(treatment.result,slot);
    const unchanged=gameSummary(replay,slot);
    assert.equal(base.observableDigest,unchanged.observableDigest,
      'The unmodified source changed after reversible policy intervention');
    assert.equal(base.firstTurnSlot,changed.firstTurnSlot,
      'Policy altered the actual first player from an identical deal');
    assert.equal(treatment.changed,treatment.observed.filter(x=>x.changed).length);
    rows.push({
      rank10PhysicalSeat:arm.seat,seed:arm.seed,repeat:arm.repeat,
      actualSourceFirst:base.sourceRank10ActuallyFirst,
      eligiblePromptCount:treatment.observed.filter(x=>x.eligibleDragon).length,
      selectedDragonCostCount:treatment.changed,
      prompts:treatment.observed,
      baseline:base,treatment:changed,
      exactUnmodifiedReplay:true
    });
  }
  const total=rows.reduce((x,y)=>x+y.selectedDragonCostCount,0);
  const exposure=rows.filter(x=>x.selectedDragonCostCount>0).length;
  return {
    kind:'agent20-registered-regidrago-owner-visible-dragon-cost-16-pairs',
    policy:POLICY_VERSION,
    registeredSource: 'results/aichi-2026/registrations/agent20-regidrago-ball-prompt-v1-20261020.json',
    printedRanks:[1,10],
    pinnedTwinleaf:schedule.twinleaf_pin,
    headGitSha:process.env.GITHUB_SHA??null,
    allRegisteredPairsPresent:rows.length===16,
    totalPairs:rows.length,
    actualRegidragoStartsFirst:rows.filter(row=>row.actualSourceFirst).length,
    actualRegidragoStartsSecond:rows.filter(row=>!row.actualSourceFirst).length,
    selectedDragonCostCount:total,changedGameCount:exposure,
    unaffectedGameCount:rows.length-exposure,
    raw:rows,
    ownerOnlyHook:true,
    wholeMatchBotHiddenInformationSafe:false,
    sourcePaperRulesFullyVerified:false,
    qualifiesForCompetitiveInference:false,
    limits:[
      'Generic bot and opponent unqualified; game winners are diagnostics only',
      'Source baseline and treatment same 60s/deals but diverge after any changed discard cost',
      'Retain all no-exposure, unfinished, zero-attack and censored arms',
      'Original owner must initiate a Ball/Treasure play and prompt; this does not improve Item selection',
      'No independent rule, hidden-information, 25-minute physical-clock, or field-wide qualification'
    ]
  };
}
if(require.main===module){
  const report=main();
  process.stderr.write('AGENT20_DRAGON_COST_PANEL_SUMMARY '+
    JSON.stringify({total:report.totalPairs,
      actualFirst:report.actualRegidragoStartsFirst,
      actualSecond:report.actualRegidragoStartsSecond,
      eligible:report.raw.reduce((n,r)=>n+r.eligiblePromptCount,0),
      selected:report.selectedDragonCostCount,
      changedGames:report.changedGameCount})+'\n');
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={registeredPairs,gameSummary,main};

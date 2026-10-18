'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {buildCampaign,parseField}=require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {object} game @param {number} seat */
function summarize(game,seat){
  return {finished:game.finished,endReason:game.endReason,
    winner:game.finished?game.winner:null,turns:game.turns,
    actions:game.actions,prizesRemaining:game.prizesRemaining,
    candidateActuallyFirst:game.firstTurnSlot===seat,
    candidateTurnStarts:game.copycatTurnStartEvidence.length,
    candidateMimikyuCopycatTurns:game.attackTrace.filter(x=>
      x.seat===seat&&x.activePokemon==='Mimikyu'&&x.attack==='Copycat')
      .map(x=>x.turn)};
}

/** Four prospective rank 10/12 × physical A/B source deals; paired on/off. */
function main(){
  const dir=path.resolve(__dirname,'../../results/aichi-2026');
  const source=JSON.parse(fs.readFileSync(path.join(dir,'full-decklists.json'),'utf8'));
  const field=parseField(fs.readFileSync(path.join(dir,'field.csv'),'utf8'));
  const champion=source.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const schedule=buildCampaign({field,source,candidates:[{
    id:'champion-reference',cards:champion.cards,referenceOnly:true
  }],pilotRanks:[10,12],repeats:1,seedBase:20261019,
  seatSeedMode:'decorrelated-slots-v3'});
  const manifest=resolveManifestFile(path.join(dir,'full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const ranks=new Map(manifest.decks.map(x=>[x.rank,x]));
  initializeCards();
  const trials=schedule.trials.filter(x=>x.phase==='pilot');
  assert.equal(trials.length,4);
  const results=[];
  for(const trial of trials){
    const seat=trial.candidateEngineSlot==='A'?0:1;
    const candidate=ranks.get(1),opponent=ranks.get(trial.rank);
    assert.ok(candidate?.playableUnderEngine&&opponent?.playableUnderEngine);
    const request={
      deckA:seat===0?candidate.cardIds:opponent.cardIds,
      deckB:seat===1?candidate.cardIds:opponent.cardIds,
      seed:trial.seed,maxActions:350,label:trial.trialId,
      captureDecisionTrace:true,captureCopycatTurnStartSeat:seat,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      supporterDecisionCorrection:true,doubleDragonRecovery:true,
      isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
      mimikyuApexCopycatCompatibility:true,mimikyuApexTimelessPolicy:true,
      mimikyuApexTimelessPolicySeat:seat,
      mimikyuDeclaredHistoryCorrection:true,
      regidragoDeclaredHistoryCorrection:true,
      passClearsLastAttackCorrection:true
    };
    const control=runMatch(request);
    const alternate=runMatch({...request,mimikyuAutonomousShredSeat:seat});
    assert.deepEqual(control.deckHashes,alternate.deckHashes);
    assert.equal(control.firstTurnSlot,alternate.firstTurnSlot);
    assert.equal(control.mimikyuAutonomousShredSeat,null);
    assert.equal(alternate.mimikyuAutonomousShredSeat,seat);
    results.push({trialId:trial.trialId,rank:trial.rank,seed:trial.seed,
      candidateSeat:seat,
      control:summarize(control,seat),
      autonomous:summarize(alternate,seat)});
  }
  return {schema:'rank10-rank12-autonomous-shred-natural-v1',
    sourceScheduleDigest:schedule.planDigest,seedBase:20261019,
    pairedTrials:results.length,results,noSourceTurn27Setup:true,
    noForcedRootActions:true,policy:'current DDE v4',
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,summarize};

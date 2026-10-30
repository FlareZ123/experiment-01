'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {plannedTrials,REGISTRATION_BLOB}=
  require('./agent41-prospective-canonical-scout.cjs');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {captureSetupOnly}=require('./aichi-setup-only-capture.cjs');
const {openingInventoriesMatch}=
  require('../twinleaf/opening-setup-zones.cjs');
const {withPerSeatSetupShuffleStreams}=
  require('./agent26-per-seat-setup-shuffle-streams.cjs');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const root=path.resolve(__dirname,'../..');
const {Store}=require(path.join(root,
  'vendor/twinleaf/ptcg-server/output/game/store/store'));

const REGISTRATION=
  'results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';

/**
 * Read-only, newly coupled per-physical-seat shuffle experiment, all 32
 * original preregistered seed/seat/60 inventories. This is a separate
 * posthoc protocol comparison, no game play, not original trial replication.
 * @returns {object}
 */
function run(){
  const bytes=fs.readFileSync(path.join(root,REGISTRATION));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTRATION_BLOB);
  const plan=JSON.parse(bytes.toString('utf8'));
  const trials=plannedTrials(plan);
  const inputs=loadCampaignInputs();
  const ids=['champion-reference','new-moon-lockbreaker-v1'];
  const allow={
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  };
  const candidates=new Map(ids.map(id=>{
    const row=inputs.candidates.find(c=>c.id===id);
    assert.ok(row);
    const p=planAichi({label:id,cards:row.cards},allow);
    assert.equal(p.engineRevision,plan.enginePin);
    return [id,p];
  }));
  const sources=new Map(plan.ranks.map(rank=>{
    const src=candidates.get(ids[0]).opponents.find(o=>o.rank===rank);
    assert.equal(src?.status,'ready');
    assert.equal(src.cards.length,60);
    assert.deepEqual(
      candidates.get(ids[1]).opponents.find(o=>o.rank===rank).cards,
      src.cards);
    return [rank,src.cards];
  }));
  initializeCards();
  const rows=[];
  for(const trial of trials){
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    const sourceSeat=1-candidateSeat;
    const candidate=candidates.get(trial.candidateId).candidate.cards;
    const source=sources.get(trial.rank);
    const deckA=candidateSeat===0?candidate:source;
    const deckB=candidateSeat===1?candidate:source;
    const row={trialId:trial.id,rank:trial.rank,repeat:trial.repeat,
      candidateId:trial.candidateId,candidateSeat,sourceSeat,
      seed:trial.seed,status:'setup-error',
      qualifiedCompetitive:false};
    try {
      const wrapped=withPerSeatSetupShuffleStreams(Store,trial.seed,()=>
        captureSetupOnly(Store,()=>runMatch({
          deckA,deckB,seed:trial.seed,maxActions:150,
          strictPromptValidation:true,isolatePolicyRandomness:true,
          label:'agent26-all32-perseat-setup-only-'+trial.id
        }),{sourceSeat,captureFirstTurnEvidence:true}));
      const observed=wrapped.result;
      assert.equal(observed.stoppedAtFirstTurn,true);
      assert.ok(openingInventoriesMatch(observed.setupZones?.seats,
        [deckA,deckB]));
      assert.equal(observed.firstTurnEvidence?.verifiedByDrawLog,true);
      assert.equal(observed.sourcePhysicalDeal?.seat,sourceSeat);
      const sourceShuffles=wrapped.shuffleTape.filter(t=>
        t.seat===sourceSeat);
      const candidateShuffles=wrapped.shuffleTape.filter(t=>
        t.seat===candidateSeat);
      assert.ok(sourceShuffles.length>0&&candidateShuffles.length>0);
      const src=observed.setupZones.seats[sourceSeat];
      Object.assign(row,{
        status:'setup-verified',
        actualFirstTurnSeat:observed.firstTurnEvidence.firstTurnSlot,
        sourcePhysicalDealSha256:
          observed.sourcePhysicalDeal.digestSha256,
        sourceActive:src.active,
        sourceBench:src.bench.filter(xs=>xs.length>0)
          .map(xs=>xs[0]),
        sourceHandCount:src.hand.length,
        sourceDeckRemaining:src.deckRemaining,
        sourcePrizeCopyCount:src.prizes.flat().length,
        sourceMulliganCount:sourceShuffles.length-1,
        candidateMulliganCount:candidateShuffles.length-1,
        sourceShuffles,candidateShuffles
      });
    }catch(error){
      row.error=String(error?.message||error);
    }
    rows.push(row);
  }
  const pairs=[];
  for(let i=0;i<rows.length;i+=2){
    const a=rows[i],b=rows[i+1];
    assert.equal(a.candidateId,ids[0]);
    assert.equal(b.candidateId,ids[1]);
    const pairId=a.trialId.slice(0,a.trialId.lastIndexOf(':'));
    assert.equal(pairId,b.trialId.slice(0,b.trialId.lastIndexOf(':')));
    assert.equal(a.seed,b.seed);
    const both=a.status==='setup-verified'&&b.status==='setup-verified';
    const sameSourceShufflePermutation=both?
      JSON.stringify(a.sourceShuffles.map(x=>x.permutationSha256))===
      JSON.stringify(b.sourceShuffles.map(x=>x.permutationSha256)):null;
    pairs.push({
      pairId,rank:a.rank,seed:a.seed,candidateSeat:a.candidateSeat,
      status:both?'setup-verified':'setup-incomplete',
      sameSourcePhysicalDeal:both?
        a.sourcePhysicalDealSha256===b.sourcePhysicalDealSha256:null,
      sameSourceShuffles:sameSourceShufflePermutation,
      sameSourceMulliganCount:both?
        a.sourceMulliganCount===b.sourceMulliganCount:null,
      sameCandidateMulliganCount:both?
        a.candidateMulliganCount===b.candidateMulliganCount:null,
      sameSourceActiveAndBench:both?
        JSON.stringify([a.sourceActive,a.sourceBench])===
        JSON.stringify([b.sourceActive,b.sourceBench]):null
    });
  }
  const complete=pairs.filter(p=>p.status==='setup-verified');
  return {
    schema:'agent26-all32-per-seat-coupled-native-source-setup-v1',
    protocol:'alternative independent physical seat shuffle sequences',
    originalFrozenFullGameProtocolUnchanged:true,
    registrationBlob:blob,enginePin:plan.enginePin,
    registeredArms:trials.length,setupArms:rows.length,
    verifiedArms:rows.filter(r=>r.status==='setup-verified').length,
    failures:rows.filter(r=>r.status!=='setup-verified')
      .map(r=>({trialId:r.trialId,error:r.error??null})),
    totalPairs:pairs.length,completePairs:complete.length,
    pairsWithIdenticalSourceFullDeals:complete.filter(p=>
      p.sameSourcePhysicalDeal).length,
    pairsWithIdenticalSourceShuffles:complete.filter(p=>
      p.sameSourceShuffles).length,
    pairsWithDifferentCandidateMulligans:complete.filter(p=>
      !p.sameCandidateMulliganCount).length,
    pairsWithDifferentSourceMulligans:complete.filter(p=>
      !p.sameSourceMulliganCount).length,
    pairsWithDifferentSourceBoards:complete.filter(p=>
      !p.sameSourceActiveAndBench).length,
    pairs,rows,fullGames:0,competitiveQualifiedGames:0,
    caveat:'This is a new 32-setup protocol, evaluated on the old sealed seeds solely as a diagnostic. Source cards, candidate cards and source seat are fixed per pair but new per-seat shuffle seeds change source and candidate deck arrangements and possible mulligans. No matched game outcomes and no competitive-policy inference.'
  };
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(r.failures.length>0)process.exitCode=1;
}
module.exports={run};

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {createHash} = require('node:crypto');

const ROOT = path.resolve(__dirname, '../..');
const REGISTRATION_FILE =
  'results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const FROZEN_SOURCE_LEDGER_SHA256 =
  '9317d7ddbc56bb7b7353a862603f0a91c4540a41caed226d75efc38249045640';

/**
 * Original Store setup-only paired reproduction of the full 32-arm
 * prospective scout. No match decisions are made. All attempts are retained.
 * @returns {object}
 */
function run() {
  const {plannedTrials,REGISTRATION_BLOB} =
    require('./agent41-prospective-canonical-scout.cjs');
  const {loadCampaignInputs} =
    require('./aichi-campaign-runner.cjs');
  const {planAichi} = require('./aichi-pilot.cjs');
  const {runMatch,initializeCards} = require('../twinleaf/headless.cjs');
  const {oneSetup} = require('../twinleaf/setup-audit.cjs');
  const {captureSetupOnly} = require('./aichi-setup-only-capture.cjs');
  const {openingInventoriesMatch} =
    require('../twinleaf/opening-setup-zones.cjs');
  const {Store} = require(path.resolve(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));

  const bytes=fs.readFileSync(path.resolve(ROOT,REGISTRATION_FILE));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTRATION_BLOB,'Frozen registration modified');
  const registration=JSON.parse(bytes.toString('utf8'));
  const trials=plannedTrials(registration);
  assert.equal(trials.length,32);
  const ids=['champion-reference','new-moon-lockbreaker-v1'];
  const field=loadCampaignInputs();
  const settings={
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  };
  const plans=new Map(ids.map(id=>{
    const input=field.candidates.find(c=>c.id===id);
    assert.ok(input);
    const plan=planAichi({label:id,cards:input.cards},settings);
    assert.equal(plan.engineRevision,registration.enginePin);
    assert.equal(plan.candidate.cards.length,60);
    return [id,plan];
  }));
  const sourceDecks=new Map(registration.ranks.map(rank=>{
    const source=plans.get(ids[0]).opponents.find(o=>o.rank===rank);
    assert.equal(source?.status,'ready');
    assert.equal(source.cards.length,60);
    const target=plans.get(ids[1]).opponents.find(o=>o.rank===rank);
    assert.deepEqual(source.cards,target.cards);
    return [rank,source.cards];
  }));
  initializeCards();

  const rows=[];
  for(const trial of trials){
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    const sourceSeat=1-candidateSeat;
    const sourceDeck=sourceDecks.get(trial.rank);
    const candidateDeck=plans.get(trial.candidateId).candidate.cards;
    const deckA=candidateSeat===0?candidateDeck:sourceDeck;
    const deckB=candidateSeat===1?candidateDeck:sourceDeck;
    const row={
      id:trial.id,rank:trial.rank,repeat:trial.repeat,seed:trial.seed,
      candidateId:trial.candidateId,candidateSeat,sourceSeat,
      status:'setup-error',competitiveQualified:false
    };
    try{
      const other=oneSetup(deckA,deckB,trial.seed,
        {traceShuffleOffsets:true});
      const sourceShuffles=other.shuffleRngTape.filter(e=>
        e.seat===sourceSeat);
      const candidateShuffles=other.shuffleRngTape.filter(e=>
        e.seat===candidateSeat);
      const snapshot=captureSetupOnly(Store,()=>runMatch({
        deckA,deckB,seed:trial.seed,maxActions:150,
        strictPromptValidation:true,isolatePolicyRandomness:true,
        label:'agent26-frozen32-setup-only-'+trial.id
      }),{sourceSeat,captureFirstTurnEvidence:true});
      assert.equal(snapshot.stoppedAtFirstTurn,true);
      assert.ok(openingInventoriesMatch(snapshot.setupZones?.seats,
        [deckA,deckB]));
      assert.equal(snapshot.sourcePhysicalDeal?.seat,sourceSeat);
      assert.equal(snapshot.firstTurnEvidence?.verifiedByDrawLog,true);
      const seat=snapshot.setupZones.seats[sourceSeat];
      const bench=seat.bench.filter(x=>x.length>0).map(x=>x[0]);
      Object.assign(row,{
        status:'setup-verified',
        actualStartingSeat:snapshot.firstTurnEvidence.firstTurnSlot,
        sourcePhysicalDealSha256:
          snapshot.sourcePhysicalDeal.digestSha256,
        sourceActive:seat.active,sourceBench:bench,
        sourceStartingPokemonCount:seat.active.length+bench.length,
        sourceMulligans:other.mulligans[sourceSeat],
        candidateMulligans:other.mulligans[candidateSeat],
        sourceBonusOffered:other.bonusOffered[sourceSeat],
        sourceBonusDrawn:other.bonusDrawn[sourceSeat],
        candidateBonusOffered:other.bonusOffered[candidateSeat],
        candidateBonusDrawn:other.bonusDrawn[candidateSeat],
        sourceFinalShuffle:sourceShuffles[sourceShuffles.length-1],
        candidateFinalShuffle:candidateShuffles[candidateShuffles.length-1],
        nativePromptPolicyMatchesOriginalFullGame:false
      });
    }catch(error){
      row.error=String(error?.message||error);
    }
    rows.push(row);
  }
  assert.equal(rows.length,trials.length);
  const successful=rows.filter(row=>row.status==='setup-verified');
  const observedLedgerHash=successful.length===32?
    createHash('sha256').update(JSON.stringify(rows.map(row=>[
      row.id,row.sourcePhysicalDealSha256
    ]))).digest('hex'):null;
  const pairs=[];
  for(let i=0;i<rows.length;i+=2){
    const first=rows[i],second=rows[i+1];
    assert.equal(first.candidateId,ids[0]);
    assert.equal(second.candidateId,ids[1]);
    const base=first.id.slice(0,first.id.lastIndexOf(':'));
    assert.equal(base,second.id.slice(0,second.id.lastIndexOf(':')));
    const verified=first.status==='setup-verified' &&
      second.status==='setup-verified';
    pairs.push({
      pairId:base,rank:first.rank,seed:first.seed,
      status:verified?'setup-verified':'setup-incomplete',
      sameSourcePhysicalDeal:verified?
        first.sourcePhysicalDealSha256===second.sourcePhysicalDealSha256:null,
      sameSourceStartingPokemonCount:verified?
        first.sourceStartingPokemonCount===
          second.sourceStartingPokemonCount:null,
      sameSourceMulliganCount:verified?
        first.sourceMulligans===second.sourceMulligans:null,
      sameCandidateMulliganCount:verified?
        first.candidateMulligans===second.candidateMulligans:null,
      sourceBonusDrawDifference:verified?
        second.sourceBonusDrawn-first.sourceBonusDrawn:null,
      candidateBonusDrawDifference:verified?
        second.candidateBonusDrawn-first.candidateBonusDrawn:null,
      sourceFinalShuffleOffsetDifference:verified?
        second.sourceFinalShuffle.firstRngDraw-
          first.sourceFinalShuffle.firstRngDraw:null,
      sourceFinalShufflePermutationSame:verified?
        first.sourceFinalShuffle.permutationSha256===
          second.sourceFinalShuffle.permutationSha256:null
    });
  }
  const verifiedPairs=pairs.filter(p=>p.status==='setup-verified');
  return {
    schema:'agent26-frozen32-all-source-setup-reproduction-v1',
    preregistration:REGISTRATION_FILE,registrationBlob:blob,
    originalFrozenScoutZipSha256:
      '55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2',
    originalFrozenSourceLedgerSha256:FROZEN_SOURCE_LEDGER_SHA256,
    reproducedSourceLedgerSha256:observedLedgerHash,
    allOriginalSourceFingerprintsReproduced:
      observedLedgerHash===FROZEN_SOURCE_LEDGER_SHA256,
    enginePin:registration.enginePin,registeredAttempts:trials.length,
    setupOnlyAttempts:rows.length,setupVerifiedArms:successful.length,
    setupErrors:rows.filter(r=>r.status!=='setup-verified')
      .map(r=>({id:r.id,error:r.error??null})),
    verifiedPairs:verifiedPairs.length,
    sameSourcePhysicalDealPairs:verifiedPairs.filter(p=>
      p.sameSourcePhysicalDeal).length,
    differentSourcePhysicalDealPairs:verifiedPairs.filter(p=>
      !p.sameSourcePhysicalDeal).length,
    differingCandidateMulliganPairs:verifiedPairs.filter(p=>
      !p.sameCandidateMulliganCount).length,
    differingSourceMulliganPairs:verifiedPairs.filter(p=>
      !p.sameSourceMulliganCount).length,
    differingSourceBonusDrawPairs:verifiedPairs.filter(p=>
      p.sourceBonusDrawDifference!==0).length,
    pairs,rows,
    completedFullGames:0,competitivelyQualifiedGames:0,
    caveat:'Registered original source/candidate 60s and paired seeds; 32 native setup-only reproductions with generic default prompt policy and separate oneSetup shuffle-mulligan audit. Full later-game actor policy, source strength and match outcomes were not evaluated.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.setupErrors.length ||
    !result.allOriginalSourceFingerprintsReproduced)
    process.exitCode=1;
}
module.exports={FROZEN_SOURCE_LEDGER_SHA256,run};

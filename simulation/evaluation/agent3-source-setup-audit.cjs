'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {captureSetupOnly}=require('./aichi-setup-only-capture.cjs');
const {withPerSeatSetupShuffleStreams}=
  require('./agent26-per-seat-setup-shuffle-streams.cjs');
const {openingInventoriesMatch}=require('../twinleaf/opening-setup-zones.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {saveResult}=
  require('../twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');

const VERSION='agent3-source-marginal-native-setup-audit-v1';
const BASE=20261104,REPEATS=12,RANKS=[5,6];
const CANDIDATES=['champion-reference','new-moon-lockbreaker-v1'];
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {object} setup @param {0|1} seat @returns {number} */
function sourceExposure(setup,seat){
  const p=setup.seats[seat];
  return p.hand.length+p.active.length+
    p.bench.reduce((n,x)=>n+x.length,0);
}

/**
 * Actual pinned Store opening for one of three predeclared comparison arms.
 * No player-turn action or qualified match outcome can occur.
 * @param {Function} Store
 * @param {string[]} source
 * @param {string[]} candidate
 * @param {0|1} seat Original-source physical seat.
 * @param {number} seed
 * @param {string} id
 * @returns {object}
 */
function setupArm(Store,source,candidate,seat,seed,id){
  const deckA=seat===0?source:candidate;
  const deckB=seat===1?source:candidate;
  const result={candidateId:id,status:'NOT_RUN'};
  try{
    const observed=withPerSeatSetupShuffleStreams(Store,seed,()=>
      captureSetupOnly(Store,()=>runMatch({deckA,deckB,seed,
        maxActions:60,strictPromptValidation:true,
        isolatePolicyRandomness:true}),{
        sourceSeat:seat,captureFirstTurnEvidence:true
      }));
    const setup=observed.result.setupZones;
    assert.equal(observed.result.stoppedAtFirstTurn,true);
    assert.ok(openingInventoriesMatch(setup?.seats,[deckA,deckB]));
    assert.equal(observed.result.firstTurnEvidence?.verifiedByDrawLog,true);
    assert.equal(observed.result.sourcePhysicalDeal?.seat,seat);
    const sourceFirst=setup.firstTurnSlot===seat;
    const exposed=sourceExposure(setup,seat);
    const extra=exposed-7-Number(sourceFirst);
    assert.ok(Number.isInteger(extra)&&extra>=0,
      'Seven initial cards, plus source first-turn draw and mulligan bonuses');
    const sourceShuffles=observed.shuffleTape.filter(x=>x.seat===seat);
    const candidateShuffles=observed.shuffleTape.filter(x=>x.seat===1-seat);
    assert.ok(sourceShuffles.length>=1&&candidateShuffles.length>=1);
    Object.assign(result,{status:'CAPTURED',
      sourceDealSha256:observed.result.sourcePhysicalDeal.digestSha256,
      sourcePrizeDigest:sha([...setup.seats[seat].prizes.flat()].sort()),
      sourceExtraDraws:extra,sourceFirst,sourceExposure:exposed,
      sourceShuffles:sourceShuffles.length,
      candidateShuffles:candidateShuffles.length,
      fullInventoryVerified:true});
  }catch(error){
    result.status='ERROR';result.error=String(error?.stack||error);
  }
  return result;
}

/** @returns {object} */
function run(){
  initializeCards();
  const input=loadCampaignInputs();
  const selected=CANDIDATES.map(id=>{
    const c=input.candidates.find(x=>x.id===id);
    assert.ok(c,'Missing fixed candidate '+id);
    return c;
  });
  const opts={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const plans=selected.map(c=>planAichi({label:c.id,cards:c.cards},opts));
  for(const p of plans){
    assert.equal(p.engineRevision,
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
    assert.equal(p.candidate.cards?.length,60);
  }
  const sources=new Map(RANKS.map(rank=>{
    const found=plans.map(p=>p.opponents.find(x=>x.rank===rank));
    assert.ok(found.every(x=>x?.status==='ready'&&x.cards?.length===60));
    assert.deepEqual(found[0].cards,found[1].cards);
    return [rank,found[0].cards];
  }));
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const groups=[],seen=new Set();
  for(const rank of RANKS)for(let repeat=0;repeat<REPEATS;repeat++){
    const seeds=deriveSlotSeeds(BASE,'published-field',rank,repeat);
    for(const [slot,seat,seed] of [['A',1,seeds.A],['B',0,seeds.B]]){
      assert.ok(seed>0&&!seen.has(seed));seen.add(seed);
      const source=sources.get(rank);
      const arms=[0,1,0].map(i=>setupArm(Store,source,
        plans[i].candidate.cards,seat,seed,CANDIDATES[i]));
      const all=arms.every(a=>a.status==='CAPTURED');
      const repeatedControlMatched=all&&
        arms[0].sourceDealSha256===arms[2].sourceDealSha256&&
        arms[0].sourceExtraDraws===arms[2].sourceExtraDraws&&
        arms[0].sourceFirst===arms[2].sourceFirst;
      const matchedSourceSetup=all?
        arms[0].sourceDealSha256===arms[1].sourceDealSha256:null;
      groups.push({rank,repeat,slot,seat,seed,arms,
        repeatedControlMatched,matchedSourceSetup,qualifiedGames:0});
    }
  }
  const full=groups.filter(g=>g.arms.every(x=>x.status==='CAPTURED'));
  const summary={
    groups:groups.length,nativeSetupAttempts:3*groups.length,
    successfulSetups:groups.flatMap(g=>g.arms)
      .filter(a=>a.status==='CAPTURED').length,
    repeatedControlMatched:groups.filter(g=>g.repeatedControlMatched).length,
    crossCandidatePhysicalMatched:full.filter(g=>g.matchedSourceSetup).length,
    crossCandidatePhysicalDifferent:full.filter(g=>!g.matchedSourceSetup).length,
    sourceBonusDrawDifference:full.filter(g=>g.arms[0].sourceExtraDraws!==
      g.arms[1].sourceExtraDraws).length,
    sourcePrizeDifference:full.filter(g=>g.arms[0].sourcePrizeDigest!==
      g.arms[1].sourcePrizeDigest).length,
    errors:groups.flatMap(g=>g.arms.filter(a=>a.status!=='CAPTURED')
      .map(a=>({rank:g.rank,repeat:g.repeat,slot:g.slot,arm:a.candidateId,
        error:a.error}))),
    completedGames:0,competitiveQualifiedGames:0
  };
  return {schema:VERSION,sourceRanks:RANKS,originalSourceCount:29,
    originalSourceJsonBlob:'ae773f6201d7aa69d31914dbfee66f3fba692200',
    seedBase:BASE,repeats:REPEATS,candidateIds:CANDIDATES,
    originalSourceDeckDigests:Object.fromEntries([...sources].map(([r,c])=>[r,sha(c)])),
    candidateDeckDigests:plans.map(p=>sha(p.candidate.cards)),
    enginePin:plans[0].engineRevision,
    sourceShuffleProtocol:'Agent26 per-seat setup shuffles, separate opt-in hook',
    interpretation:'Developmental native opening setup only. No qualified games or statistical RNG validation.',
    summary,groups};
}
module.exports={VERSION,BASE,REPEATS,RANKS,sourceExposure,setupArm,run};

if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),'agent3-source-setup-audit.json'),result);
  process.stdout.write('AGENT3_NATIVE_SOURCE_SETUP '+
    JSON.stringify(result.summary)+'\n');
  if(result.summary.groups!==48||
     result.summary.nativeSetupAttempts!==144||
     result.summary.successfulSetups!==144||
     result.summary.repeatedControlMatched!==48||
     result.summary.errors.length)process.exitCode=1;
}

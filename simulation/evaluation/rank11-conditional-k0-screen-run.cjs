'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/rank11-conditional-firstturn-k0-v1-20261018.json');

const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');

/** @param {unknown} value @returns {string} */
function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
/** @param {string} file @returns {string} */
function gitBlobSha(file) {
  const bytes=fs.readFileSync(path.join(ROOT,file));
  return createHash('sha1').update(Buffer.concat([
    Buffer.from('blob '+bytes.length+'\0'),bytes
  ])).digest('hex');
}
/**
 * @param {number} index An attempt index in the frozen registration.
 * @param {object} [frame]
 * @returns {number} Deterministic unsigned 32-bit real-game seed.
 */
function seedFor(index,frame=registration) {
  assert.ok(Number.isInteger(index) && index>=0 && index<frame.attemptCount);
  return createHash('sha256').update(JSON.stringify([
    frame.seedDomain,frame.seedBase,index
  ])).digest().readUInt32LE(0);
}
/** @param {object} [frame] @returns {true} */
function verifyRegistration(frame=registration) {
  const {frameSha256,...payload}=frame;
  assert.equal(sha256(payload),frameSha256,'Registration digest mismatch');
  assert.equal(frame.schema,'aichi-rank11-conditional-original-store-K0-screen-v1');
  assert.equal(frame.sourceRank,11);
  assert.equal(frame.sourceSeat,0);
  assert.equal(frame.candidateRank,1);
  assert.equal(frame.candidateSeat,1);
  assert.equal(frame.attemptCount,512);
  assert.equal(frame.partitionSize,32);
  const seeds=new Set(Array.from({length:frame.attemptCount},(_,i)=>
    seedFor(i,frame)));
  assert.equal(seeds.size,frame.attemptCount,'Nonunique physical seeds');
  assert.equal(seeds.has(0),false,'Reserved zero PRNG seed');
  return true;
}

/**
 * Freeze verified published rank11 against rank1 physical 60s once per
 * partition. Only source-own-hand/public-board K0 evidence is read at
 * first real root decision; no outcomes are gathered.
 * @returns {{deckA:string[],deckB:string[],engineRevision:string}}
 */
function resolvedPrintedDecks() {
  const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
  const {canonicalCards}=require('../../scripts/aichi-comparison-campaign.cjs');
  const inputs=loadCampaignInputs();
  const source=inputs.source.decks.find(x=>x.rank===registration.sourceRank);
  const candidate=inputs.source.decks.find(x=>x.rank===registration.candidateRank);
  assert.ok(source&&candidate);
  assert.equal(sha256(canonicalCards(source.cards)),registration.sourceDeckDigest);
  assert.equal(sha256(canonicalCards(candidate.cards)),registration.candidateDeckDigest);
  const {planAichi}=require('./aichi-pilot.cjs');
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(x=>x.rank===registration.sourceRank);
  assert.equal(plan.engineRevision,registration.engineRevision);
  assert.equal(opponent.status,'ready');
  assert.equal(opponent.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  return {deckA:opponent.cards,deckB:plan.candidate.cards,
    engineRevision:plan.engineRevision};
}

/**
 * @param {{partition?:number,screenOne?:(seed:number,index:number)=>object,
 *   verifyBlobs?:boolean}} [options]
 * @returns {object} All attempted source K0 screenings, never game outcomes.
 */
function executePartition(options={}) {
  verifyRegistration();
  const partition=options.partition??0;
  assert.ok(Number.isInteger(partition) && partition>=0 &&
    partition*registration.partitionSize<registration.attemptCount,
    'Partition outside precommitted index range');
  if(options.verifyBlobs!==false) {
    assert.equal(gitBlobSha('simulation/twinleaf/rank11-first-turn-screen.cjs'),
      registration.screenBlobSha,'Screen code drifted after precommit');
    assert.equal(gitBlobSha('simulation/twinleaf/rank11-autonomous-opener.cjs'),
      registration.openerBlobSha,'Opener predicate drifted after precommit');
  }
  let screenOne=options.screenOne;
  if(!screenOne) {
    const decks=resolvedPrintedDecks();
    const {runMatch}=require('../twinleaf/headless.cjs');
    const {screenRank11FirstTurn}=require('../twinleaf/rank11-first-turn-screen.cjs');
    const {openingOpportunity}=require('../twinleaf/rank11-autonomous-opener.cjs');
    const {SimpleTacticsAi}=require(path.join(OUTPUT,'simple-bot/simple-tactics-ai'));
    const {GamePhase}=require(path.join(OUTPUT,'game/store/state/state'));
    screenOne=(seed,index)=>screenRank11FirstTurn({
      sourceSeat:registration.sourceSeat,
      SimpleTacticsAi,
      playerTurnPhase:GamePhase.PLAYER_TURN,
      openingOpportunity,
      runMatch:()=>runMatch({
        ...decks,seed,label:'rank11-conditional-K0-screen-v1:'+index,
        maxActions:registration.maxSetupActions,
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        isolatePolicyRandomness:true
      })
    });
  }
  const records=[];
  const start=partition*registration.partitionSize;
  const end=Math.min(start+registration.partitionSize,registration.attemptCount);
  for(let index=start;index<end;index++) {
    const seed=seedFor(index);
    const trialId='rank11-conditional-K0-v1:'+index;
    try {
      const screen=screenOne(seed,index);
      const drawVerified=screen?.verifiedByDrawLog===true;
      const sourceFirst=screen?.sourceFirst===true;
      const K0=drawVerified&&sourceFirst&&screen?.eligibleK0===true;
      records.push({
        trialId,index,seed,
        status:!drawVerified?'unverified-first-draw':
          K0?'selected-K0':'verified-non-K0',
        drawVerified,sourceFirst,eligibleK0:K0,
        firstPlayerSeat:screen?.actualFirstPlayerSeat??null,
        sourceStarter:sourceFirst?screen?.sourceStarter??null:null,
        sourceOwnHandPrintings:sourceFirst?
          screen?.sourceOwnHandPrintings??null:null,
        firstDrawLogName:screen?.firstDrawLogName??null,
        continuedGame:false,
        qualifiedCompetitiveGame:false
      });
    } catch(error) {
      records.push({trialId,index,seed,status:'screen-exception',
        error:String(error?.stack||error),
        continuedGame:false,qualifiedCompetitiveGame:false});
    }
  }
  assert.equal(records.length,end-start);
  const count=status=>records.filter(row=>row.status===status).length;
  return {
    schema:'aichi-rank11-conditional-K0-attempt-ledger-v1',
    registrationSha256:registration.frameSha256,
    engineRevision:registration.engineRevision,
    sourceRank:11,sourceSeat:0,candidateRank:1,candidateSeat:1,
    partition,indices:[start,end-1],
    registeredAttemptCount:registration.attemptCount,
    attempted:records.length,
    selectedK0:count('selected-K0'),
    verifiedNonK0:count('verified-non-K0'),
    unverifiedDraw:count('unverified-first-draw'),
    screenExceptions:count('screen-exception'),
    records,
    qualifiedCompetitiveGames:0,
    warning:'Source-opening conditional selection only. All attempted seeds retained; no matched continuation or win rate.'
  };
}
if(require.main===module) {
  const partition=Number(process.env.RANK11_K0_PARTITION||0);
  process.stdout.write(JSON.stringify(executePartition({partition}),null,2)+'\n');
}
module.exports={sha256,gitBlobSha,seedFor,verifyRegistration,
  resolvedPrintedDecks,executePartition};

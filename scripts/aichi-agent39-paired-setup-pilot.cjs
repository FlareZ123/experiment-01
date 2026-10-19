'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const PROTOCOL='agent39-candidate-bonus-source-setup-precommitted-v1';
const RANKS=Object.freeze([6,11]), SEATS=Object.freeze([0,1]), REPEATS=64;

/** Freeze the ordered 256-pair seed schedule before any outcomes. @returns {object[]} */
function plannedPairedStarts() {
  const rows=[];
  for(const rank of RANKS)for(const candidateSlot of SEATS) {
    for(let repeat=0;repeat<REPEATS;repeat++) {
      const id=`rank${rank}-slot${candidateSlot}-repeat${repeat}`;
      const seed=createHash('sha256').update(`${PROTOCOL}|${id}`)
        .digest().readUInt32BE(0);
      rows.push({id,rank,candidateSlot,repeat,seed});
    }
  }
  assert.equal(rows.length,256);
  assert.equal(new Set(rows.map(x=>x.seed)).size,256);
  return rows;
}

/** Copy only setup counts indexed by actual source engine seat. @param {object} row @param {number} sourceSeat */
function extractSetup(row,sourceSeat){
  const candidateSeat=1-sourceSeat;
  return {
    candidateMulligans:row.mulligans[candidateSeat],
    sourceMulligans:row.mulligans[sourceSeat],
    sourceBonusOffered:row.bonusOffered[sourceSeat],
    sourceBonusSelected:row.bonusSelected[sourceSeat],
    sourceBonusDrawn:row.bonusDrawn[sourceSeat],
    candidateBonusOffered:row.bonusOffered[candidateSeat],
    sourcePromptCount:row.bonusPromptCount[sourceSeat],
    firstTurnSeat:row.firstSeat,setupActions:row.setupActions
  };
}

/** Execute all precommitted 256 paired real Store setups; preserve failures. @returns {object} */
function runPairedSetups(){
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
  const {loadNewMoonCandidate}=require('./aichi-new-moon-candidate.cjs');
  const {oneSetup}=require('../simulation/twinleaf/setup-audit.cjs');
  initializeCards();
  const opts={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const champion=planAichi(1,opts), moon=planAichi(loadNewMoonCandidate(),opts);
  const opponents=new Map(champion.opponents.map(x=>[x.rank,x]));
  assert.equal(champion.candidate.cards.length,60);
  assert.equal(moon.candidate.cards.length,60);
  const candidates={champion:champion.candidate.cards,newMoon:moon.candidate.cards};
  const plan=plannedPairedStarts();
  const scheduleSha256=createHash('sha256').update(JSON.stringify(plan)).digest('hex');
  const attempts=plan.map(trial=>{
    const opponent=opponents.get(trial.rank);
    assert.equal(opponent?.status,'ready');
    const sourceSeat=1-trial.candidateSlot,arms={};
    for(const [label,cards] of Object.entries(candidates)) {
      const a=trial.candidateSlot===0?cards:opponent.cards;
      const b=trial.candidateSlot===0?opponent.cards:cards;
      try {
        arms[label]={status:'setup-observed',
          ...extractSetup(oneSetup(a,b,trial.seed),sourceSeat)};
      }catch(error){
        arms[label]={status:'setup-engine-error',error:String(error?.stack||error)};
      }
    }
    const both=Object.values(arms).every(x=>x.status==='setup-observed');
    const differenceKeys=['candidateMulligans','sourceMulligans',
      'sourceBonusOffered','sourceBonusSelected','sourceBonusDrawn','firstTurnSeat'];
    return {...trial,sourceSeat,arms,
      pairStatus:both?'both-observed':'error-retained',
      ...(both?{differences:Object.fromEntries(differenceKeys.map(key=>
        [key,arms.champion[key]!==arms.newMoon[key]]))}:{})};
  });
  const summaries=[];
  for(const rank of RANKS)for(const candidateSlot of SEATS) {
    const rows=attempts.filter(x=>x.rank===rank&&x.candidateSlot===candidateSlot);
    const good=rows.filter(x=>x.pairStatus==='both-observed');
    const n=key=>good.filter(x=>x.differences[key]).length;
    summaries.push({
      rank,candidateSlot,attempts:rows.length,
      observedPairs:good.length,errorRetainedPairs:rows.length-good.length,
      candidateMulliganDifference:n('candidateMulligans'),
      sourceMulliganDifference:n('sourceMulligans'),
      sourceBonusOfferDifference:n('sourceBonusOffered'),
      sourceBonusSelectedDifference:n('sourceBonusSelected'),
      sourceBonusDrawnDifference:n('sourceBonusDrawn'),
      firstTurnSeatDifference:n('firstTurnSeat'),
      bonusDifferenceWithCandidateMulliganDifference:good.filter(x=>
        x.differences.sourceBonusOffered&&x.differences.candidateMulligans).length,
      bonusDifferenceWithoutCandidateMulliganDifference:good.filter(x=>
        x.differences.sourceBonusOffered&&!x.differences.candidateMulligans).length
    });
  }
  return {
    schema:PROTOCOL,scope:'real pinned Store setup, not complete game',
    competitiveGames:0,winRateCertified:false,
    strictSourceDealEqualityConditioning:false,
    scheduleSha256,attemptCount:attempts.length,
    armCount:attempts.length*2,
    candidateDigests:{champion:champion.candidateDigest,newMoon:moon.candidateDigest},
    engineRevision:champion.engineRevision,
    sourceManifestDigest:champion.manifestDigest,
    summaries,attempts
  };
}
if(require.main===module)console.log(JSON.stringify(runPairedSetups(),null,2));
module.exports={PROTOCOL,plannedPairedStarts,extractSetup,runPairedSetups};

'use strict';

const assert=require('node:assert/strict');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const sourceManifest=require('../../results/als/new-moon-lockbreak-english-proxy-60.json');
const alternateManifest=require('../../results/als/new-moon-two-gengar-one-cologne-english-proxy-60.json');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('./headless.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE,
  RANK26_COLOGNE_PUMP_PROFILE}=require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');

const SOURCE_RANKS=[6,11,26];
const REPEATS=2;
const SEED_BASE=20261018;
const permissions={allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};

/**
 * Pin the same 59 English-proxy physical printing identities and exchange one
 * Gengar & Mimikyu-GX TEU for one Canceling Cologne ASR. The full 60-card
 * manifest is independently hashed and published as a research proposal.
 * @returns {{source:object,alternate:object}}
 */
function candidatePair() {
  const source=loadNewMoonCandidate();
  assert.equal(source.proxyIdCountHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(sourceManifest.canonical_id_count_sha256,source.proxyIdCountHash);
  assert.equal(alternateManifest.canonical_id_count_sha256,
    '3c1cf2b5fa73a966c23260f3ceb85a5ebd70073cdd805f44b269969bfea2bd33');
  const counts=new Map(alternateManifest.entries.map(entry=>
    [entry.name_en,entry.count]));
  const cards=source.cards.map(card=>({...card,
    printing:{...card.printing},count:counts.get(card.name)}));
  assert.equal(cards.length,source.cards.length);
  assert.ok(cards.every(x=>Number.isInteger(x.count)&&x.count>0));
  assert.equal(cards.reduce((sum,x)=>sum+x.count,0),60);
  assert.equal(cards.find(x=>x.name==='Gengar & Mimikyu-GX').count,2);
  assert.equal(cards.find(x=>x.name==='Canceling Cologne').count,1);
  return {
    source,
    alternate:{id:'new-moon-Gengar2-Cologne1-v1',
      cards,proxyIdCountHash:alternateManifest.canonical_id_count_sha256,
      provisionalEnglishProxy:true,paperLegalPrintsVerified:false}
  };
}

/** @param {object} game @param {0|1} candidateSeat @returns {object} */
function observe(game,candidateSeat) {
  return {
    actualFirstSlot:game.firstTurnSlot,
    firstTurnVerifiedByDrawLog:game.verifiedByDrawLog,
    finished:game.finished,engineWinner:game.winner,
    turns:game.turns,rootActions:game.actions,
    remainingPrizes:game.prizesRemaining,
    engineDeckHashes:game.deckHashes,
    policy:game.policy,
    sourcePolicy:game.rank11AutonomousPolicy||
      game.rank26ColognePolicy||null,
    candidateAttackDeclarations:(game.attackDeclarationTrace||[])
      .filter(x=>x.playerSlot===candidateSeat)
      .map(x=>({turn:x.turnBefore,attack:x.attackName,
        disposition:x.resolutionStatus})),
    candidateTrainerActions:(game.decisionTrace||[])
      .filter(x=>x.playerSlot===candidateSeat&&
        x.action==='PlayCardAction' &&
        ['Battle Compressor','Field Blower','Canceling Cologne',
          'Secret Box'].some(name=>String(x.card||'').startsWith(name)))
      .map(x=>({turn:x.turnBefore,card:x.card,ordinal:x.actionOrdinal})),
    verifiedCompetitiveStrength:false
  };
}

/**
 * Preserve both candidate physical seats and all precommitted seeds, including
 * wrong turn orders and incomplete games. The source opponent gets the
 * documented bounded autonomous opener where available, never a forced trace.
 * @returns {object}
 */
function run() {
  const pair=candidatePair();
  const plans=Object.fromEntries([
    ['frozen',pair.source],['structural',pair.alternate]
  ].map(([kind,candidate])=>[kind,
    planAichi({label:candidate.id,cards:candidate.cards},permissions)]));
  assert.equal(plans.frozen.engineRevision,plans.structural.engineRevision);
  assert.equal(plans.frozen.manifestDigest,plans.structural.manifestDigest);
  for(const rank of SOURCE_RANKS) {
    const a=plans.frozen.opponents.find(x=>x.rank===rank);
    const b=plans.structural.opponents.find(x=>x.rank===rank);
    assert.equal(a?.status,'ready');
    assert.equal(b?.status,'ready');
    assert.deepEqual(a.cards,b.cards,
      'Source opponent changed when candidate inventory changed');
  }
  const rows=[];
  for(const rank of SOURCE_RANKS) {
    const source=plans.frozen.opponents.find(x=>x.rank===rank);
    for(const candidateSeat of [0,1]) {
      const sourceSeat=1-candidateSeat;
      for(let repeat=0;repeat<REPEATS;repeat++) {
        const seed=deriveSlotSeeds(SEED_BASE,'pilot',rank,repeat)[
          candidateSeat===0?'A':'B'];
        const arms={};
        for(const [variant,plan] of Object.entries(plans)) {
          const request={
            deckA:candidateSeat===0?plan.candidate.cards:source.cards,
            deckB:candidateSeat===1?plan.candidate.cards:source.cards,
            seed,maxActions:150,strictPromptValidation:true,
            forestSealSearchCorrection:true,
            battleCompressorPositiveSelectionCorrection:true,
            isolatePolicyRandomness:true,captureDecisionTrace:true,
            newMoonNativeOpeningPivotSeat:candidateSeat,
            newMoonAttackPayloadCompressorSeat:candidateSeat,
            newMoonOpeningHorrorHouseSeat:candidateSeat,
            label:'newmoon-gengar2-vs-cologne1-'+variant+'-rank'+rank
          };
          const execute=()=>{
            if(rank===11)return runWithResearchProfile({
              ...request,rank11SourceSeat:sourceSeat
            },RANK11_AUTONOMOUS_PROFILE);
            if(rank===26)return runWithResearchProfile({
              ...request,rank26SourceSeat:sourceSeat
            },RANK26_COLOGNE_PUMP_PROFILE);
            return runMatch(request);
          };
          try {
            const result=withNewMoonBlowerAutonomy(candidateSeat,execute);
            arms[variant]={ok:true,sourcePrintHash:plan.candidateDigest,
              telemetry:observe(result.result,candidateSeat),
              blowerSelections:result.policyAudit.opportunitySelections,
              confirmedToolRemovals:result.policyAudit.confirmedToolRemovals,
              competitivelyQualified:false};
          }catch(error){
            arms[variant]={ok:false,error:String(error?.stack||error),
              competitivelyQualified:false};
          }
        }
        rows.push({rank,candidateSeat,sourceSeat,repeat,seed,arms,
          competitiveQualification:false});
      }
    }
  }
  return {
    schema:'source-dealt-NewMoon-two-Gengar-one-Cologne-structural-probe-v1',
    scope:'Frozen English-equivalent candidate and a single-slot structural proposal, unqualified for competitive inference',
    ranks:SOURCE_RANKS,repeats:REPEATS,seatCount:2,
    sourceCandidateIdHash:pair.source.proxyIdCountHash,
    proposalIdHash:pair.alternate.proxyIdCountHash,
    sourceFieldDigest:plans.frozen.manifestDigest,
    engineRevision:plans.frozen.engineRevision,
    qualifiedCompetitiveGames:0,rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={candidatePair,observe,run};

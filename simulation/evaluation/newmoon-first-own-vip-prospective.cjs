'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {
  runWithResearchProfile,DEFAULT_PROFILE,RANK11_AUTONOMOUS_PROFILE
}=require('../twinleaf/policy-profiles.cjs');
const {withNewMoonFirstOwnVip}=
  require('../twinleaf/newmoon-first-own-vip.cjs');

const REGISTRATION=Object.freeze({
  study:'newmoon-first-own-vip-v1',
  seedBase:20261019,
  repeatsPerRankAndSeat:4,
  ranks:[6,11],
  seats:['A','B'],
  enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  maxActions:90,
  pairedPolicies:['unchanged-weak-profile','newmoon-first-own-vip-v1'],
  sourceDecks:'published exact 60-card Aichi Open League ranks 6 and 11',
  candidate:'unchanged English-equivalent New Moon Lockbreaker v1 60',
  branchSelection:'all registered seeds retained regardless of VIP opportunities or terminal outcome'
});

/**
 * A deterministic, output-independent 16-row schedule across two genuinely
 * different source archetypes and both physical seats. Each selected source
 * seed is replayed with and without a candidate-only first-turn VIP policy.
 *
 * @returns {object[]}
 */
function plannedTrials(){
  const rows=[];
  for(const rank of REGISTRATION.ranks){
    for(let repeat=0;repeat<REGISTRATION.repeatsPerRankAndSeat;repeat++){
      const seeds=deriveSlotSeeds(REGISTRATION.seedBase,'pilot',rank,repeat);
      for(const seat of REGISTRATION.seats){
        rows.push({trialId:`newmoon-vip-v1:rank${rank}:repeat${repeat}:seat${seat}`,
          rank,repeat,candidateSeat:seat,
          candidateEngineSeat:seat==='A'?0:1,seed:seeds[seat]});
      }
    }
  }
  assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(x=>x.trialId)).size,16);
  return rows;
}

const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Archive each prospect including exposed absence, capped game or exception.
 * No winner field contributes to a win-rate denominator.
 */
function run(){
  const raw=loadNewMoonCandidate();
  const opts={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true};
  const plan=planAichi({label:raw.id,cards:raw.cards},opts);
  assert.equal(plan.engineRevision,REGISTRATION.enginePin);
  assert.equal(plan.candidate.cards.length,60);
  const sources=new Map(REGISTRATION.ranks.map(rank=>{
    const source=plan.opponents.find(o=>o.rank===rank);
    assert.equal(source?.status,'ready');
    assert.equal(source.cards.length,60);
    return [rank,source.cards];
  }));
  const trials=plannedTrials();
  const observations=[];

  for(const trial of trials){
    const candidateA=trial.candidateEngineSeat===0;
    const source=sources.get(trial.rank);
    const deckA=candidateA?plan.candidate.cards:source;
    const deckB=candidateA?source:plan.candidate.cards;
    const opponentSeat=1-trial.candidateEngineSeat;
    const profile=trial.rank===11?RANK11_AUTONOMOUS_PROFILE:DEFAULT_PROFILE;
    const request={
      deckA,deckB,seed:trial.seed,maxActions:REGISTRATION.maxActions,
      rank11SourceSeat:opponentSeat,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      label:trial.trialId
    };
    const input={...trial,candidateDigest:sha(plan.candidate.cards),
      sourceDigest:sha(source),engineRevision:plan.engineRevision,
      sourcePolicyProfile:profile};
    try{
      const baseline=runWithResearchProfile(request,profile);
      const candidate=withNewMoonFirstOwnVip(trial.candidateEngineSeat,
        ()=>runWithResearchProfile(request,profile));
      const alternative=candidate.result;
      assert.deepEqual(baseline.deckHashes,alternative.deckHashes);
      assert.equal(baseline.seed,trial.seed);
      assert.equal(alternative.seed,trial.seed);
      assert.equal(baseline.verifiedByDrawLog,true);
      assert.equal(alternative.verifiedByDrawLog,true);
      assert.equal(baseline.firstTurnSlot,alternative.firstTurnSlot);
      assert.equal(alternative.engine,'twinleafgg/'+plan.engineRevision);
      assert.equal(baseline.engine,alternative.engine);

      const firstOwnTurn=baseline.firstTurnSlot===
        trial.candidateEngineSeat?1:2;
      const ownMoves=game=>game.decisionTrace.filter(e=>
        e.playerSlot===trial.candidateEngineSeat &&
        e.turnBefore===firstOwnTurn).slice(0,25).map(e=>({
          action:e.action,card:e.card??null,ability:e.ability??null,
          selection:e.cardSelection?.selectedCards??null
        }));
      observations.push({...input,
        status:'original-and-candidate-policy-bounded',
        firstTurnSlot:baseline.firstTurnSlot,
        candidateActuallyFirst:baseline.firstTurnSlot===trial.candidateEngineSeat,
        verifiedByDrawLog:true,
        policyAudit:candidate.policyAudit,
        baseline:{finished:baseline.finished,actions:baseline.actions,
          firstOwnTurnActions:ownMoves(baseline)},
        alternative:{finished:alternative.finished,actions:alternative.actions,
          firstOwnTurnActions:ownMoves(alternative)},
        cardConservationVerified:true,
        competitiveQualification:false});
    }catch(error){
      observations.push({...input,status:'engine-or-provenance-exception',
        error:String(error?.stack||error),
        competitiveQualification:false});
    }
  }
  assert.equal(observations.length,trials.length);
  const active=observations.filter(x=>x.policyAudit?.selectedLegalVip);
  const selected=observations.filter(x=>x.policyAudit?.validatedSearchSelection);
  return {
    schema:'newmoon-first-own-vip-prospective-mechanical-exposure-v1',
    registration:REGISTRATION,
    plannedIds:trials.map(x=>x.trialId),
    sourceEngineRevision:plan.engineRevision,
    candidateId:raw.id,
    candidatePrinted60Digest:sha(plan.candidate.cards),
    opponentPrinted60Digests:Object.fromEntries([...sources].map(([k,v])=>[k,sha(v)])),
    observations,
    registeredSourceDeals:trials.length,
    observedAttempts:observations.length,
    verifiedActualStartingOrders:observations.filter(x=>
      x.verifiedByDrawLog===true).length,
    legalVIPDispatches:active.length,
    ownerPromptValidSelections:selected.length,
    falseOrFailedAttempts:observations.filter(x=>
      x.status==='engine-or-provenance-exception').length,
    competitivelyQualifiedGames:0,
    warning:'Mechanical owner-first-turn source-exposure diagnostic only. Seeds prospectively fixed; bot attacks and official clock are unqualified.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={REGISTRATION,plannedTrials,run};

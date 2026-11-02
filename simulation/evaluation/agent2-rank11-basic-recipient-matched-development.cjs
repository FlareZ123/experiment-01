'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {preflight}=require('./agent43-guzma-nominal-fresh-rank11-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {replayFingerprint}=require('./agent43-guzma-held-root-retrospective.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent2-rank11-basic-energy-recipient-existing16-paired-dev-v1';
const FROZEN_CONTROL_ROOT_DIGEST=
  '4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216';

/** @param {unknown} value @returns {string} */
const digest=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Count public face-up Energy investment at the first native root of each
 * authentic owner turn. The owner-only observer inspects no opponent
 * hand, unknown deck cards or face-down Prize identities.
 * @param {object} row Native full-game attempt.
 * @returns {object} Public development-only repeated-turn counts.
 */
function investmentBySeat(row){
  const first=row.ownerSupporterOpportunityAudit?.firstRoots??[];
  const bySeat={0:{turns:0,benchInvested:0,activeInvested:0,
    totalBenchCards:0,totalActiveCards:0},
  1:{turns:0,benchInvested:0,activeInvested:0,
    totalBenchCards:0,totalActiveCards:0}};
  for(const event of first){
    const x=bySeat[event.ownerSeat];
    if(!x)throw Error('Invalid physical owner seat');
    const g=event.publicGuzmaGeometry;
    if(!g||!Number.isSafeInteger(g.ownActiveEnergyCards)||
        !Number.isSafeInteger(g.ownBenchedEnergyCards))
      throw Error('Missing native face-up Energy witness');
    x.turns++;
    x.benchInvested+=Number(g.ownBenchedEnergyCards>0);
    x.activeInvested+=Number(g.ownActiveEnergyCards>0);
    x.totalBenchCards+=g.ownBenchedEnergyCards;
    x.totalActiveCards+=g.ownActiveEnergyCards;
  }
  return bySeat;
}

/** @param {object} row Native full-game attempt. */
function receipt(row){
  return {
    id:row.trial?.id??null,seed:row.trial?.seed??null,
    candidateSlot:row.trial?.candidateSlot??null,
    candidateId:row.trial?.candidateId??null,
    sourceSeat:row.sourceSeat??null,
    sourceFirst:row.sourceActuallyFirst??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceDeal:row.sourceDealFingerprint??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    candidateDeckHash:row.candidateDeckFingerprint??null,
    sourceDeckHash:row.sourceDeckFingerprint??null,
    nativeRootDigest:row.rootActionLedgerSha256??null,
    nativeRootCount:row.rootActionCount??null,
    finished:row.finished===true,winner:row.winner??null,
    status:row.status??(row.finished===true?'terminal':'capped'),
    error:row.error??null,
    attacks:row.attackDeclarations??null,
    nativeTargetCertification:row.physicalTargetCertification?.status??null,
    benchInvestment:row.ownerSupporterOpportunityAudit?
      investmentBySeat(row):null,
    nativeBasicRecipientProfile:row.bilateralBasicEnergyRecipientProfile??null,
    qualifiesForCompetitiveInference:false
  };
}

/** Pair identical physical source-deal opponent arms; fail on missing trials. */
function pairArms(controlRows,treatmentRows){
  assert.equal(controlRows.length,16);
  assert.equal(treatmentRows.length,16);
  const control=new Map(controlRows.map(x=>[x.trial?.id,x]));
  const treated=new Map(treatmentRows.map(x=>[x.trial?.id,x]));
  assert.equal(control.size,16);assert.equal(treated.size,16);
  const pairs=[];
  for(const [id,rawA] of control){
    const rawB=treated.get(id);
    assert.ok(rawB,'Missing treatment of previously frozen physical trial '+id);
    const a=receipt(rawA),b=receipt(rawB);
    assert.equal(a.seed,b.seed);
    assert.equal(a.candidateSlot,b.candidateSlot);
    assert.equal(a.candidateId,b.candidateId);
    assert.equal(a.sourceSeat,b.sourceSeat);
    assert.equal(a.sourceDeal,b.sourceDeal,
      'Source physical setup changed between comparator policies');
    assert.equal(a.fullPhysicalDeal,b.fullPhysicalDeal,
      'Complete physical setup changed between comparator policies');
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.ok(a.fullPhysicalDeal&&a.sourceDeal,
      'Missing authentic initial physical deal: '+id);
    assert.equal(a.nativeBasicRecipientProfile,null,
      'Control must not enable the two-seat treatment');
    assert.equal(b.nativeBasicRecipientProfile?.bothPhysicalSeats,true,
      'Treatment not enabled identically for both physical seats');
    pairs.push({id,seed:a.seed,
      candidateSeat:a.candidateSlot==='A'?0:1,
      sourceSeat:a.sourceSeat,
      matchedNativeRootDigest:a.nativeRootDigest===b.nativeRootDigest,
      control:a,treatment:b});
  }
  return pairs;
}

/** @param {object[]} pairs Native matched attempts. */
function summarizePairs(pairs){
  const byPolicy={control:{},treatment:{}};
  for(const label of Object.keys(byPolicy)){
    const result=byPolicy[label];
    result.engineTerminal=0;result.actionCapped=0;
    result.nativeErrors=0;result.changedNativeRoots=0;
    result.nativeSourceAttacks=0;result.nativeCandidateAttacks=0;
    result.sourceFirstTurnWithBenchEnergy=0;
    result.candidateFirstTurnWithBenchEnergy=0;
    result.sourceObservedTurns=0;result.candidateObservedTurns=0;
    for(const p of pairs){
      const r=p[label];
      result.engineTerminal+=Number(r.finished);
      result.actionCapped+=Number(!r.finished&&r.error==null);
      result.nativeErrors+=Number(r.error!=null);
      result.nativeSourceAttacks+=r.attacks?.source??0;
      result.nativeCandidateAttacks+=r.attacks?.candidate??0;
      const s=r.benchInvestment?.[p.sourceSeat];
      const c=r.benchInvestment?.[1-p.sourceSeat];
      if(s){result.sourceFirstTurnWithBenchEnergy+=s.benchInvested;
        result.sourceObservedTurns+=s.turns;}
      if(c){result.candidateFirstTurnWithBenchEnergy+=c.benchInvested;
        result.candidateObservedTurns+=c.turns;}
    }
  }
  byPolicy.treatment.changedNativeRoots=pairs.filter(p=>
    !p.matchedNativeRootDigest).length;
  return byPolicy;
}

/** Same historical original 16 source-dealt game arms; no new seed inference. */
function run(){
  const p=preflight();
  const options={...p.registration.setupAndPolicyFixed,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    nativeOwnerSupporterOpportunity:true,
    actorGuzmaNominalGust:false};
  assert.equal(options.actorOnlyComposition,true);
  assert.equal(p.registration.trials.length,16);
  const before=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let control,treatment;
  try{
    control=runDevelopment({
      ...options,bilateralBasicEnergyRecipientFrontier:false
    });
    treatment=runDevelopment({
      ...options,bilateralBasicEnergyRecipientFrontier:true
    });
  }finally{
    if(before===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=before;
  }
  assert.equal(replayFingerprint(control.rows),FROZEN_CONTROL_ROOT_DIGEST,
    'Current canonical original-16 control no longer reproduces archived baseline');
  const pairs=pairArms(control.rows,treatment.rows);
  return {
    schema:VERSION,runDateUtc:new Date().toISOString(),
    sourceRank:11,pinnedTwinleaf:p.native,
    registeredTrialFrame:p.registration.schema,
    registrationGitBlobSha:p.registrationBlob,
    printed60RosterGitBlobSha:p.rosterBlob,
    comparativeSource:'same 16 previously used original physical deals',
    newRandomTrialCount:0,
    frozenControlRootDigest:FROZEN_CONTROL_ROOT_DIGEST,
    observedControlRootDigest:replayFingerprint(control.rows),
    treatmentRootDigest:replayFingerprint(treatment.rows),
    controlPolicyFlag:false,treatmentPolicyFlag:true,
    symmetricActorOnly:true,diagnosticOnly:true,
    fixedCandidate60s:p.registration.candidateIds,
    summary:summarizePairs(pairs),pairs,
    // Complete raw data permits independent native owner action and physical
    // recipient audits, including any unsuccessful or capped arms.
    control,treatment,
    competitiveQualifiedGames:0,
    target99Point5Verified:false,
    caveats:[
      'Original 16 registered historical native games reused after studying their held-Guzma outcome; exploratory matched development only',
      'Native 260-action cap, not Aichi paper tournament clock; a native engine terminal is not a paper-qualified win',
      'Attached face-up Energy card counts do not prove current attack payability, opponent continuation quality or source skill',
      'Only one new symmetric Basic Energy recipient policy toggle, no changed source or candidate sixty, seed, or deck order',
      'Printed target-energy bonuses, native prompt legality, prize settlement, timing and deck-independent field comparisons remain separate release vetoes'
    ]
  };
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    process.stdout.write(JSON.stringify({
      schema:VERSION,rank:11,registeredOriginalTrials:p.registration.trials.length,
      controlDigest:FROZEN_CONTROL_ROOT_DIGEST,
      frozenSource:p.rosterBlob,originalRegistration:p.registrationBlob,
      nativePin:p.native,oneDevelopmentBoolean:true})+'\n');
  }else{
    const result=run();
    if(process.env.AGENT2_RANK11_BASIC_RECIPIENT_OUTPUT)
      save(process.env.AGENT2_RANK11_BASIC_RECIPIENT_OUTPUT,result);
    process.stdout.write('AGENT2_RANK11_BASIC_RECIPIENT_PAIRED '+
      JSON.stringify({controlReplayConfirmed:
        result.observedControlRootDigest===FROZEN_CONTROL_ROOT_DIGEST,
        stats:result.summary,registration:result.registeredTrialFrame,
        seedGroups:8,gameArms:16,competitiveQualifiedGames:0})+'\n');
  }
}
module.exports={VERSION,FROZEN_CONTROL_ROOT_DIGEST,
  investmentBySeat,receipt,pairArms,summarizePairs,run};

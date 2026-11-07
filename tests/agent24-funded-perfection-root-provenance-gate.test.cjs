'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyFundedPerfectionRootProvenance}=require(
  '../simulation/evaluation/agent24-funded-perfection-root-provenance-gate.cjs');

/** @returns {object} */
function fixture() {
  const roots=[
    {actionOrdinal:0,playerSlot:1,turnBefore:4,action:'AttackAction'},
    {actionOrdinal:1,playerSlot:1,turnBefore:4,action:'ResolvePromptAction'},
    {actionOrdinal:2,playerSlot:0,turnBefore:5,action:'PlayCardAction',
      card:'Telepathic Psychic Energy'},
    {actionOrdinal:3,playerSlot:0,turnBefore:5,action:'PassTurnAction'},
    {actionOrdinal:4,playerSlot:1,turnBefore:6,action:'AttackAction'}
  ];
  const publicBoard=[
    {active:{name:'Mewtwo & Mew-GX',
      energyCards:['Telepathic Psychic Energy'],printing:'sm11-71'},
    bench:[{name:'Gengar & Mimikyu-GX',printing:'sm9-53',
      energyCards:[]}]},
    {active:{name:'Oranguru V',energyCards:['Darkness Energy'],
      printing:'swsh10-133'},bench:[]}
  ];
  const replies=[{sameEpochCandidateReplyVerified:true,
    candidateReplyTurnFinalPass:{
      ordinal:3,turn:5,publicBoardBeforePass:publicBoard
    }}];
  const record={
    schema:'agent24-post-choice-funded-perfection-stratum-v1',
    actionOrdinal:3,actorPlayerId:101,seat:0,turnBefore:5,
    eligible:true,reason:'funded-donor-present',energyCards:1,donorCount:1,
    optionPaperAffordabilityCertified:false,
    ownerEligibilityFilterReadsOpponentHiddenZones:false,
    detachedNativeProbeUsesFullStateClone:true,
    hiddenInformationIndependenceCertified:false,
    livePolicyChangedByObserver:false,
    detachedMenu:{
      sourceEligibility:{
        sourcePokemonCount:1,bench:[{name:'Gengar & Mimikyu-GX',
          printing:'sm9-53'}],discard:[]
      },
      validAttackNames:['Horror House-GX']
    }
  };
  const observer={passRootCount:1,missingPreStateCount:0,
    records:[record],
    sampler:{passRootsChecked:1,recorded:1,
      sampledActionOrdinals:[3],budgetCensored:0,
      completeOpportunityCensus:false}
  };
  return {rootActionLedger:roots,candidateRepliesAfterSourceAttacks:replies,
    fundedPerfectionObserver:observer};
}

test('joins real accepted Pass to independent public pre-Pass Energy and donor',()=>{
  const result=verifyFundedPerfectionRootProvenance(fixture());
  assert.equal(result.verifiedActualPassRoots,1);
  assert.equal(result.verifiedFundedPerfectionSamples,1);
  assert.equal(result.samples[0].energyCards,1);
  assert.equal(result.samples[0].publicBenchDonorsCorroborated,1);
  assert.equal(result.samples[0].copiedAttackPaperCostCertified,false);
  assert.equal(result.paperQualifiedGames,0);
});

test('detects mutated post-Pass Energy snapshot',()=>{
  const input=fixture();
  input.fundedPerfectionObserver.records[0].energyCards=2;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input),
    /independently captured public pre-Pass Energy/);
});

test('detects detached cloned donor absent from actual public Bench',()=>{
  const input=fixture();
  input.candidateRepliesAfterSourceAttacks[0]
    .candidateReplyTurnFinalPass.publicBoardBeforePass[0].bench=[];
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input),
    /missing from independent pre-Pass Bench/);
});

test('cannot attribute one seat Pass to other seat',()=>{
  const input=fixture();
  input.fundedPerfectionObserver.records[0].seat=1;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input));
});

test('requires actual Store accepted Pass root rather than an AI proposal',()=>{
  const input=fixture();
  input.rootActionLedger[3].action='AttackAction';
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input));
});

test('refuses missing same-epoch independent pre-Pass board',()=>{
  const input=fixture();
  input.candidateRepliesAfterSourceAttacks[0].sameEpochCandidateReplyVerified=false;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input),
    /No independent same-epoch/);
});

test('rejects missing pre-dispatch state even when other sample data exist',()=>{
  const input=fixture();
  input.fundedPerfectionObserver.missingPreStateCount=1;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input),
    /lacked a genuine pre-dispatch state/);
});

test('rejects any sample falsely marked hidden-information certified',()=>{
  const input=fixture();
  input.fundedPerfectionObserver.records[0].hiddenInformationIndependenceCertified=true;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input));
});

test('rejects samples marked as already paper payable',()=>{
  const input=fixture();
  input.fundedPerfectionObserver.records[0].optionPaperAffordabilityCertified=true;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input));
});

test('rejects inconsistent root and observer Pass denominators',()=>{
  const input=fixture();
  input.fundedPerfectionObserver.passRootCount=2;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input));
});

test('sample root ordinals must be unique',()=>{
  const input=fixture();
  input.fundedPerfectionObserver.records.push({
    ...input.fundedPerfectionObserver.records[0]
  });
  input.fundedPerfectionObserver.sampler.recorded=2;
  input.fundedPerfectionObserver.sampler.sampledActionOrdinals=[3,3];
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input),
    /cannot count twice/);
});

test('source turn action ordinal must be contiguous',()=>{
  const input=fixture();
  input.rootActionLedger[4].actionOrdinal=7;
  assert.throws(()=>verifyFundedPerfectionRootProvenance(input));
});

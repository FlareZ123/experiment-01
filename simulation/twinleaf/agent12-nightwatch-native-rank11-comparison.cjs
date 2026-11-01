'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const profile=require('../evaluation/agent41-frozen-bilateral-development-v2.json');
const registration=require('../../results/aichi-2026/registrations/agent16-balanced-native-rank6-rank11-coins-20261101.json');
const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
const {
  withUniformNightWatchOpponentSelection
}=require('./agent12-nightwatch-paper-random-chooser.cjs');

const VERSION='agent12-native-rank11-nightwatch-randomness-development-v1';
const GROUPS=[
  {rank:11,repeat:2,candidateSlot:'A'},
  {rank:11,repeat:0,candidateSlot:'B'}
];

/** @param {object} g Frozen historical physical source group identity. */
function registeredGroup(g){
  const row=registration.flatPredictions.find(x=>
    x.rank===g.rank&&x.repeat===g.repeat&&
    x.candidateSlot===g.candidateSlot);
  assert.ok(row,'Exact prior balanced-coin seed registration missing');
  return registration.candidateIds.map(candidateId=>({
    rank:row.rank,repeat:row.repeat,candidateSlot:row.candidateSlot,
    seed:row.seed,candidateId,
    id:[row.rank,row.repeat,row.candidateSlot,candidateId].join(':')
  }));
}

/** @param {object} row True native Game row after end/cap, no synthetic scores. */
function extract(row){
  const byOrdinal=new Map(row.rootActionLedger.map(e=>
    [e.actionOrdinal,e]));
  const choices=new Map((row.nativePromptChoices?.events??[])
    .map(e=>[e.ordinal,e]));
  const nights=row.rootActionLedger.filter(r=>
    r.action==='ResolvePromptAction'&&
    r.pendingPrompt==='ChooseCardsPrompt'&&
    byOrdinal.get(r.initiatingRootActionOrdinal)?.attack==='Night Watch')
    .map(e=>{
      const c=choices.get(e.actionOrdinal);
      return {ordinal:e.actionOrdinal,turn:e.turnBefore,
        actorSeat:e.playerSlot,ownerSeat:c?.sourcePlayerSlot??null,
        opponentHandSizeBefore:c?.sourceZoneCardCountBefore??null,
        selectedNames:c?.selectedCards??null,
        selectedCount:c?.selectedCards?.length??null,
        nativePromptMin:c?.nativePromptMin??null,
        nativePromptMax:c?.nativePromptMax??null};
    });
  return {
    trial:row.trial,status:row.status??null,
    finished:row.finished,winner:row.winner,
    actionCount:row.actionCount,turns:row.turns,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    rootActionLedgerSha256:row.rootActionLedgerSha256,
    nativeNightWatchPromptCount:nights.length,
    nightWatchPromptReceipts:nights,
    qualifiesForCompetitiveInference:false
  };
}

function run(){
  assert.equal(profile.pinnedVendorRevision,registration.enginePin);
  const prior={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    prior[k]=process.env[k];process.env[k]=v;
  }
  try{
    const out=[];
    for(const group of GROUPS){
      const groupRows=registeredGroup(group);
      const runNative=()=>runDevelopment({
        ...profile.policyOptions,registeredTrials:groupRows,
        registeredFrameName:VERSION+'-archived-exact-physical-seed'
      });
      const baseline=runNative();
      const audit=withUniformNightWatchOpponentSelection(runNative,{
        committedSeed:VERSION+':'+groupRows[0].seed+':'+
          group.candidateSlot+':'+group.repeat
      });
      assert.equal(baseline.rows.length,2);
      assert.equal(audit.result.rows.length,2);
      const base=baseline.rows.map(extract),
        treated=audit.result.rows.map(extract);
      for(let i=0;i<base.length;i++){
        assert.equal(base[i].trial.id,treated[i].trial.id);
        assert.equal(base[i].sourceDealFingerprint,
          treated[i].sourceDealFingerprint,
          'Source card deal changed under randomized opponent hand prompt');
        assert.equal(base[i].fullPhysicalDealFingerprint,
          treated[i].fullPhysicalDealFingerprint,
          'Full physical deal changed under RNG-only native prompt handling');
      }
      out.push({registration:group,seed:groupRows[0].seed,
        attemptedBaseline:base.length,attemptedUniform:treated.length,
        baseline:base,uniform:treated,
        randomHookAudit:audit.audit,
        competitiveQualified:false});
    }
    return {version:VERSION,
      pinnedVendorRevision:profile.pinnedVendorRevision,
      profileSchema:profile.schema,
      profileOptions:profile.policyOptions,
      groups:out,registeredGroups:GROUPS.length,
      gameArmsAttempted:GROUPS.length*2*2,
      independentPhysicalDeals:GROUPS.length,
      fullOriginalSourceSixtiesRetained:true,
      nativeValidCopyAttackSourcePaperVerification:false,
      printedNightWatchPromptAttributionRequired:true,
      competitiveQualifiedGameCount:0,
      winRateCertification:false};
  }finally{
    for(const [k,v] of Object.entries(prior)){
      if(v===undefined)delete process.env[k];
      else process.env[k]=v;
    }
  }
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,GROUPS,registeredGroup,extract,run};

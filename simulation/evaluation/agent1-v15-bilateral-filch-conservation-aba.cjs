'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runAgent1Horizon260V14}=
  require('./agent1-issue25-common-v14-horizon260.cjs');
const {registeredTrials}=
  require('./agent36-issue25-common-v6.cjs');
const {withConservativeOwnerFilch,VERSION:FILCH_VERSION,THRESHOLD}=
  require('../twinleaf/agent1-conservative-owner-filch.cjs');
const {PREFIX}=
  require('./agent1-v14-public-endstate-observer.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent1-v15-bilateral-24card-conservative-filch-original-eight-aba';
const REGISTRATION=
  'results/aichi-2026/registrations/agent1-v14-v15-bilateral-conservative-filch-20261106.md';
const HASH_PATHS=[
  REGISTRATION,
  'simulation/evaluation/agent1-v15-bilateral-filch-conservation-aba.cjs',
  'tests/agent1-v15-bilateral-filch-conservation-aba.test.cjs',
  'tests/agent1-v15-bilateral-filch-conservation-aba.native.test.cjs',
  'simulation/twinleaf/agent1-conservative-owner-filch.cjs',
  'tests/agent1-conservative-owner-filch.test.cjs'
];
const sha256=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Install the generic owner Filch choice INSIDE the actual native match,
 * after all common v13/v14 owner, actor and prompt wrappers are established.
 * The prior native Store call and all accepted root decisions are forwarded.
 *
 * @template T
 * @param {()=>T} execute Run the actual frozen eight.
 * @param {{headless?:object,adapter?:Function,filchDeps?:object}} [deps]
 * @returns {{result:T,audit:object[]}}
 */
function withRegisteredNativeFilchGuard(execute,deps={}){
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const adapter=deps.adapter??withConservativeOwnerFilch;
  const original=Object.getOwnPropertyDescriptor(headless,'runMatch');
  assert.equal(typeof original?.value,'function');
  const audit=[];
  function wrapped(request,...args){
    const label=request?.label;
    const id=typeof label==='string'&&label.startsWith(PREFIX)?
      label.slice(PREFIX.length):null;
    if(id===null)return original.value.apply(this,[request,...args]);
    try{
      const observed=adapter(()=>
        original.value.apply(this,[request,...args]),deps.filchDeps);
      audit.push({id,nativeReturned:true,filch:observed.audit});
      return observed.result;
    }catch(error){
      audit.push({id,nativeReturned:false,
        filch:error?.ownerConservativeFilchAudit??null});
      throw error;
    }
  }
  Object.defineProperty(headless,'runMatch',{...original,value:wrapped});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(headless.runMatch,wrapped);
    Object.defineProperty(headless,'runMatch',original);
  }
}

/** @param {object} row @returns {object} */
function publicOutcome(row){
  const end=row.originalNativeEndstate;
  return {
    id:row.id,sourceSeat:row.sourceSeat,
    rootCount:row.publicNativeRootCount,
    disposition:row.genuineNativeFinished?'native-engine-finished':
      row.nativeError?'engine-error':'action-limit-censored',
    finished:row.genuineNativeFinished,
    winner:row.reportedNativeWinner,
    sourceWinner:row.genuineNativeFinished?
      row.reportedNativeWinner===row.sourceSeat:null,
    finalPrizes:row.nativeFinalPrizes,
    finalDeckCountsBySeat:end?.publicDeckCountsBySeat??null,
    terminalReason:row.nativeEndReason,
    originalSourcePrintedAttacks:row.sourceActualAttacks?.map(x=>x.attackName)??[],
    rootLedgerSHA256:sha256(row.publicNativeRootActions),
    countsBySeat:[0,1].map(seat=>({
      seat,
      filch:row.publicNativeRootActions.filter(x=>
        x.playerSlot===seat&&x.action==='AttackAction'&&x.attack==='Filch').length,
      pass:row.publicNativeRootActions.filter(x=>
        x.playerSlot===seat&&x.action==='PassTurnAction').length,
      attack:row.publicNativeRootActions.filter(x=>
        x.playerSlot===seat&&x.action==='AttackAction').length
    }))
  };
}

/** @param {object[]} roots @param {object} event */
function matchedNativePass(roots,event){
  const matching=roots.filter(x=>x.turnBefore===event.globalTurn&&
    x.playerSlot===event.ownerSeat&&x.action==='PassTurnAction');
  return matching.length===1?matching[0].actionOrdinal:null;
}

/**
 * Complete A/B/A over the same eight native original-source developmental
 * trial IDs; nobody is removed because of an engine abort or root cap.
 *
 * @param {{base?:Function,runner?:Function,withGuard?:Function}} [deps]
 * @returns {object}
 */
function runAgent1V15FilchAba(deps={}){
  const base=deps.base??runAgent1Horizon260V14;
  const runner=deps.runner??runDevelopment;
  const withGuard=deps.withGuard??withRegisteredNativeFilchGuard;
  const observed=[];
  const control=base();
  const treated=base({runner:options=>{
    const wrapped=withGuard(()=>runner(options));
    observed.push(...wrapped.audit);
    return wrapped.result;
  }});
  const repeated=base();
  const reports=[control,treated,repeated];
  const registered=registeredTrials().map(x=>x.id).sort();
  const rows=reports.map(x=>x.diagnostic.publicNativeRows);
  assert.ok(rows.every(x=>Array.isArray(x)&&x.length===registered.length));
  const byId=rows.map(group=>new Map(group.map(x=>[x.id,x])));
  assert.deepEqual(byId.map(m=>[...m.keys()].sort()),
    [registered,registered,registered]);
  const fullPhysicalDealMatched=registered.every(id=>
    byId[0].get(id).fullPhysicalDealFingerprint===
      byId[1].get(id).fullPhysicalDealFingerprint&&
    byId[0].get(id).fullPhysicalDealFingerprint===
      byId[2].get(id).fullPhysicalDealFingerprint);
  const originalSourceDealMatched=registered.every(id=>
    byId[0].get(id).sourcePhysicalDealFingerprint===
      byId[1].get(id).sourcePhysicalDealFingerprint&&
    byId[0].get(id).sourcePhysicalDealFingerprint===
      byId[2].get(id).sourcePhysicalDealFingerprint);
  const exactRepeat=registered.every(id=>{
    const a=byId[0].get(id),c=byId[2].get(id);
    return sha256(a.publicNativeRootActions)===
      sha256(c.publicNativeRootActions)&&
      a.genuineNativeFinished===c.genuineNativeFinished&&
      a.reportedNativeWinner===c.reportedNativeWinner&&
      a.publicNativeRootCount===c.publicNativeRootCount;
  });
  const auditById=new Map();
  for(const item of observed){
    assert.equal(auditById.has(item.id),false,
      'Duplicate native Filch audit would invalidate role provenance');
    auditById.set(item.id,item);
  }
  const treatmentRootAssertions=registered.map(id=>{
    const a=byId[0].get(id),b=byId[1].get(id);
    const guard=auditById.get(id);
    const replacements=guard?.filch?.replacementEvents??[];
    const rootJoins=replacements.map(event=>({
      ...event,nativeAcceptedPassRootOrdinal:
        matchedNativePass(b.publicNativeRootActions,event)
    }));
    const repeatedOriginal=a.publicNativeRootActions;
    const treatedRoots=b.publicNativeRootActions;
    const commonPrefixLength=Math.min(repeatedOriginal.length,treatedRoots.length);
    let shared=0;
    while(shared<commonPrefixLength&&
      JSON.stringify(repeatedOriginal[shared])===JSON.stringify(treatedRoots[shared]))
      shared++;
    const unchanged=
      repeatedOriginal.length===treatedRoots.length&&
      shared===repeatedOriginal.length;
    const first=rootJoins[0]??null;
    const before=repeatedOriginal[shared]??null;
    const after=treatedRoots[shared]??null;
    const firstDivergenceExactlyOwnerFilchToAcceptedPass=first===null?
      unchanged:
      first.nativeAcceptedPassRootOrdinal===shared&&
      before?.actionOrdinal===shared&&
      before?.action==='AttackAction'&&before.attack==='Filch'&&
      before.playerSlot===first.ownerSeat&&
      before.turnBefore===first.globalTurn&&
      after?.actionOrdinal===shared&&
      after?.action==='PassTurnAction'&&
      after.playerSlot===first.ownerSeat&&
      after.turnBefore===first.globalTurn;
    return {
      id,proposals:guard?.filch?.proposedPrintedOwnerFilch??null,
      originalFilchAccepted:guard?.filch?.acceptedOriginalFilch??null,
      attemptedFilchToPassReplacements:replacements.length,
      matchedNativePassRoots:rootJoins.filter(x=>
        x.nativeAcceptedPassRootOrdinal!==null).length,
      rootJoins,
      sharedControlPrefixRoots:shared,
      hadAnyNativeRootDivergence:!unchanged,
      firstDivergenceExactlyOwnerFilchToAcceptedPass,
      noChangedNativeRootsWithoutAnOfferedReplacement:
        firstDivergenceExactlyOwnerFilchToAcceptedPass
    };
  });
  const presentIds=registered.every(id=>auditById.has(id));
  return {
    schema:VERSION,
    sourceRegistration:REGISTRATION,
    nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    inheritedNativeRootHorizon:260,
    originalSourceRankScope:[6,11],originalRegisteredTrialCount:8,
    fixedOwnerDeckConservationThreshold:THRESHOLD,
    nativeGuardVersion:FILCH_VERSION,
    arms:['control-A','conservative-B','control-A-repeat'],
    recordsByArm:reports.map((r,i)=>({
      arm:['control-A','conservative-B','control-A-repeat'][i],
      nativeRows:r.diagnostic.publicNativeRows,
      outcomes:r.diagnostic.publicNativeRows.map(publicOutcome),
      manifest:{
        ...r.manifest,
        originalV13PolicyUnmodified:i!==1,
        conservativeOwnerFilchOptIn:i===1
      }
    })),
    registeredNativeFilchAudits:observed,
    provenance:{
      sameAllEightFullPhysicalOpenings:fullPhysicalDealMatched,
      sameAllEightOriginalSourceOpenings:originalSourceDealMatched,
      exactEightControlRepeatRootsAndOutcomes:exactRepeat,
      everyTreatmentNativeTrialAudited:presentIds,
      everyReplacementMatchedToNativeAcceptedPass:
        treatmentRootAssertions.every(x=>
          x.attemptedFilchToPassReplacements===x.matchedNativePassRoots),
      noUnexplainedTreatmentRootChanges:
        treatmentRootAssertions.every(x=>
          x.noChangedNativeRootsWithoutAnOfferedReplacement),
      everyFirstNativeDivergenceIsRegisteredOwnerFilchPass:
        treatmentRootAssertions.every(x=>
          x.firstDivergenceExactlyOwnerFilchToAcceptedPass),
      treatmentByTrial:treatmentRootAssertions,
      registeredHashes:HASH_PATHS.map(hashRegisteredFile)
    },
    fullyQualifiedPaperGameCount:0,competitiveGamesQualified:0,
    selectedFinalFixed60:false,winRateEstimate:null,
    caveat:'A/B/A selected original eight developmental trials with a weak owner-only draw conservation threshold; not a complete paper or opponent-competent game evaluation.'
  };
}
module.exports={VERSION,REGISTRATION,HASH_PATHS,
  withRegisteredNativeFilchGuard,publicOutcome,matchedNativePass,
  runAgent1V15FilchAba};

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditMatchedPlumeriaControl}=
  require('../scripts/agent38-plumeria-paired-census.cjs');

/** A four-arm selected historical fixture, deliberately noncompetitive. */
function fixture(){
  const rows=Array.from({length:4},(_,i)=>({
    trial:{id:(i<2?6:11)+':retro:'+i+':B:reference',
      rank:i<2?6:11,seed:700+i,candidateSlot:'B'},
    verifiedFirstTurn:true,actualStarterSeat:0,
    sourceDealFingerprint:'deal-'+i,
    rootActionLedgerSha256:'root-'+i,
    qualifiesForCompetitiveInference:false,
    winner:1
  }));
  const control={attempted:4,sourceFirstRetrospective:true,
    competitiveQualifiedGames:0,actorPlumeriaAfterPassOptIn:false,
    rows};
  const treated=structuredClone(control);
  treated.actorPlumeriaAfterPassOptIn=true;
  for(const row of treated.rows)
    row.actorOnlyDecisionCoverage={ownerPlumeriaAfterPassAudit:{
      anyGameCompetitivelyQualified:false,
      policyStrategicallyValidated:false,sourceSeat:null,
      proposedPlumeria:0,acceptedPlumeria:0,
      settledEnergyDiscards:0,unresolvedChains:0,
      bySeat:{0:{accepted:0,settled:0},1:{accepted:0,settled:0}}
    }};
  return {control,treated};
}

test('same-deal all-four denominator counts native positive by real physical seat',()=>{
  const {control,treated}=fixture(),a=treated.rows[0]
    .actorOnlyDecisionCoverage.ownerPlumeriaAfterPassAudit;
  a.proposedPlumeria=2;a.acceptedPlumeria=1;a.settledEnergyDiscards=1;
  a.bySeat[1].accepted=1;a.bySeat[1].settled=1;
  treated.rows[0].rootActionLedgerSha256='changed-root';
  const c=auditMatchedPlumeriaControl(control,treated);
  assert.equal(c.registeredAttempts,4);
  assert.equal(c.treatedAudits,4);
  assert.equal(c.matchedDealAndActualStarter,4);
  assert.equal(c.totalProposals,2);
  assert.equal(c.totalAccepted,1);
  assert.equal(c.totalSettled,1);
  assert.equal(c.bySeat[1].settled,1);
  assert.equal(c.pairs[0].physicalRootChanged,true);
  assert.equal(c.competitivelyQualifiedGames,0);
  assert.equal(c.strategyQualified,false);
});

test('native error, uncensored attempts and mismatched starts remain in denominator',()=>{
  const {control,treated}=fixture();
  treated.rows[0].status='engine-error';
  treated.rows[0].actorOnlyDecisionCoverage=null;
  treated.rows[1].sourceDealFingerprint='other-deal';
  treated.rows[2].actualStarterSeat=1;
  const c=auditMatchedPlumeriaControl(control,treated);
  assert.equal(c.registeredAttempts,4);
  assert.equal(c.treatedAudits,3);
  assert.equal(c.treatedMissingAudits,1);
  assert.equal(c.matchedDealAndActualStarter,1);
  assert.equal(c.pairs[0].nativeAuditPresent,false);
  assert.equal(c.pairs[1].sameSourceDealAndActualStarter,false);
  assert.equal(c.pairs[2].sameSourceDealAndActualStarter,false);
});

test('reject corrupted original trial identity and seed, never call it a pair',()=>{
  for(const key of ['id','seed','candidateSlot']){
    const {control,treated}=fixture();
    treated.rows[0].trial[key]='different';
    assert.throws(()=>auditMatchedPlumeriaControl(control,treated),
      {name:'AssertionError'});
  }
});

test('reject apparent native settlement exceeding accepted roots',()=>{
  const {control,treated}=fixture();
  treated.rows[0].actorOnlyDecisionCoverage
    .ownerPlumeriaAfterPassAudit.settledEnergyDiscards=1;
  assert.throws(()=>auditMatchedPlumeriaControl(control,treated),
    {name:'AssertionError'});
});

test('reject fabricated competitive qualification or missing every source deal',()=>{
  const {control,treated}=fixture();
  treated.rows[0].qualifiesForCompetitiveInference=true;
  assert.throws(()=>auditMatchedPlumeriaControl(control,treated),
    {name:'AssertionError'});
  const q=fixture();
  q.treated.rows[0].sourceDealFingerprint=null;
  const c=auditMatchedPlumeriaControl(q.control,q.treated);
  assert.equal(c.matchedDealAndActualStarter,3);
  assert.equal(c.pairs[0].physicalRootChanged,false);
});

test('reject missing rank arms and mutated held opt-in state',()=>{
  const {control,treated}=fixture();
  treated.rows.pop();
  assert.throws(()=>auditMatchedPlumeriaControl(control,treated),
    {name:'AssertionError'});
  const x=fixture();
  x.treated.actorPlumeriaAfterPassOptIn=false;
  assert.throws(()=>auditMatchedPlumeriaControl(x.control,x.treated),
    {name:'AssertionError'});
});

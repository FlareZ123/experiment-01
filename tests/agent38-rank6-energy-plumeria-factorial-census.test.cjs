'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {ARMS,sourceEnergyPlayRoots,auditFactorial}=
  require('../scripts/agent38-rank6-energy-plumeria-factorial-census.cjs');

/** Synthetic 64 native arms retaining exact prior-random trial identity. */
function fixture(){
  const trials=[];
  for(const slot of ['A','B'])for(let rep=0;rep<4;rep++)
    for(const cid of ['champion-reference','new-moon-lockbreaker-v1'])
      trials.push({id:['6',rep,slot,cid].join(':'),rank:6,
        repeat:rep,candidateSlot:slot,candidateId:cid,
        seed:1234000+rep+(slot==='A'?0:40)});
  return ARMS.map(name=>({
    schema:'agent38-rank6-original-frozen-plumeria-special-energy-2x2-v1',
    registrationPath:'frozen-registration',
    registrationBlob:'fixed',priorRandomParentFrame:'parent',
    priorRandomParentBlob:'prior',registeredAttempts:16,
    competitiveQualifiedGames:0,
    frozenArm:{id:name,sourceScopedSpecialEnergyRoot:name.includes('energy'),
      actorPlumeriaAfterPass:name.includes('plumeria')},
    result:{
      sourceScopedSpecialEnergyRootOptIn:name.includes('energy'),
      actorPlumeriaAfterPassOptIn:name.includes('plumeria'),
      competitiveQualifiedGames:0,
      rows:trials.map((trial,i)=>({
        trial,sourceSeat:0,sourceActuallyFirst:i%2===0,
        actualStarterSeat:i%2,
        sourceDealFingerprint:'source:'+i,
        fullPhysicalDealFingerprint:'full:'+i,
        qualifiesForCompetitiveInference:false,finished:true,winner:1,
        rootActionLedger:[{playerSlot:0,action:'PlayCardAction',
          card:'Speed Lightning Energy'}],
        attackDeclarations:{source:1,candidate:2},
        actorOnlyDecisionCoverage:{ownerPlumeriaAfterPassAudit:{
          anyGameCompetitivelyQualified:false,acceptedPlumeria:0,
          settledEnergyDiscards:0,abandonedChains:0
        }}
      }))
    }
  }));
}

test('full sixteen starts and all sixty-four native arms remain accounted',()=>{
  const r=auditFactorial(fixture());
  assert.equal(r.registeredOriginalTrials,16);
  assert.equal(r.registeredNativeArms,64);
  assert.equal(r.fullPhysicalMatches,16);
  assert.equal(r.physicalMismatches,0);
  assert.equal(r.unverifiableStarts,0);
  assert.equal(r.table.base.sourceEnergyPlayRoots,16);
  assert.equal(r.table.energy.sourceAttackDeclarations,16);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('all rooted original Special Energy types are counted only on source',()=>{
  const row={sourceSeat:1,rootActionLedger:[
    {action:'PlayCardAction',playerSlot:1,card:'Speed Lightning Energy'},
    {action:'PlayCardAction',playerSlot:1,card:'Spiky Energy'},
    {action:'PlayCardAction',playerSlot:1,card:'Double Colorless Energy'},
    {action:'PlayCardAction',playerSlot:1,card:'Capture Energy'},
    {action:'PlayCardAction',playerSlot:0,card:'Speed Lightning Energy'},
    {action:'ResolvePromptAction',playerSlot:1,card:'Capture Energy'}
  ]};
  assert.equal(sourceEnergyPlayRoots(row),4);
});

test('full-deal mismatch and unverifiable source stay in counted denominator',()=>{
  const x=fixture();
  x[2].result.rows[0].fullPhysicalDealFingerprint='other-deal';
  x[3].result.rows[1].sourceDealFingerprint=null;
  x[3].result.rows[2].status='engine-error';
  x[3].result.rows[2].finished=false;
  const r=auditFactorial(x);
  assert.equal(r.registeredOriginalTrials,16);
  assert.equal(r.fullPhysicalMatches,14);
  assert.equal(r.physicalMismatches,1);
  assert.equal(r.unverifiableStarts,1);
  assert.equal(r.table['energy+plumeria'].errors,1);
  assert.equal(r.table['energy+plumeria'].engineTerminals,15);
});

test('all printed owner Plumeria receipts retained without win credit',()=>{
  const x=fixture(),a=x[3].result.rows[3]
    .actorOnlyDecisionCoverage.ownerPlumeriaAfterPassAudit;
  a.acceptedPlumeria=2;a.settledEnergyDiscards=2;a.abandonedChains=1;
  const r=auditFactorial(x);
  assert.equal(r.table['energy+plumeria'].plumeriaSettled,2);
  assert.equal(r.table['energy+plumeria'].plumeriaAbandoned,1);
  assert.equal(r.plumeriaConditionalPhysicalSettlementsWithSpecialEnergy,2);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('falsified registration, native seed or competitive qualification fails',()=>{
  for(const change of [
    f=>{f[1].registeredAttempts=15;},
    f=>{f[3].result.rows[7].trial.seed+=1;},
    f=>{f[2].result.rows[0].qualifiesForCompetitiveInference=true;},
    f=>{f[0].frozenArm.id='different';}
  ]){
    const f=fixture();change(f);
    assert.throws(()=>auditFactorial(f),{name:'AssertionError'});
  }
});

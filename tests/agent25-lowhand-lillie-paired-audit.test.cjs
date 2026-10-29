'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditLowHandLilliePair,SCHEMA}=
  require('../simulation/evaluation/agent25-lowhand-lillie-paired-audit.cjs');

function fixture(enabled){
  const rows=Array.from({length:4},(_,i)=>({
    trial:{id:'trial-'+i,rank:i%2?11:6},
    sourceDealFingerprint:'physical-'+i,
    actualStarterSeat:i%2,
    rootActionCount:10,
    rootActionLedgerSha256:'root-'+i,
    finished:true,winner:0,
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{
        lowHandLillieRootOptIn:enabled,
        typedIntentCounts:enabled&&i===0?{'play-lowhand-lillie':1}:{},
        nativePhysicalConfirmedByIntent:enabled&&i===0?
          {'play-lowhand-lillie':1}:{},
        nativePhysicalUnconfirmedByIntent:{}
      }
    }},
    paperSupporterDiscipline:{nativeSupporterEvents:enabled&&i===0?
      [{name:"Lillie's Determination M1L",settled:true}]:[]}
  }));
  return {attempted:4,rows,competitiveQualifiedGames:0,
    actorOnlyCompositionOptIn:true};
}

test('complete four-arm native comparison records authenticated physical play',()=>{
  const out=auditLowHandLilliePair(fixture(false),fixture(true));
  assert.equal(out.schema,SCHEMA);
  assert.equal(out.pairs,4);
  assert.equal(out.matchingSourceDeals,4);
  assert.equal(out.matchingFirstPlayers,4);
  assert.equal(out.proposed,1);
  assert.equal(out.physicallyConfirmed,1);
  assert.equal(out.nativeSettled,1);
  assert.equal(out.competitiveQualifiedGames,0);
});

test('native abort and mismatched original source deal remain failures',()=>{
  const base=fixture(false),treatment=fixture(true);
  treatment.rows[2]={
    trial:treatment.rows[2].trial,
    status:'engine-error',error:'typed-prompt abort'
  };
  treatment.rows[3].sourceDealFingerprint='DIFFERENT SOURCE';
  const out=auditLowHandLilliePair(base,treatment);
  assert.equal(out.pairs,4);
  assert.equal(out.matchingSourceDeals,2);
  assert.equal(out.rows[2].treatmentStatus,'engine-error');
  assert.equal(out.rows[2].treatmentError,'typed-prompt abort');
  assert.equal(out.competitiveQualifiedGames,0);
});

test('missing or extra attempts fail closed',()=>{
  const base=fixture(false),treatment=fixture(true);
  treatment.rows.pop();
  assert.throws(()=>auditLowHandLilliePair(base,treatment));
  treatment.rows.push(treatment.rows[0]);
  assert.throws(()=>auditLowHandLilliePair(base,treatment),
    /Missing comparison arm|/);
});

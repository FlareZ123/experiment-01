'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PHASES,assessPhase,auditActionChains}=
  require('../simulation/evaluation/agent34-paper-action-chain-gate.cjs');
const hash='a'.repeat(64);
const root={ordinal:3,seat:1,storeId:'real-1',
  action:'PlayCardAction',printing:'Roxie CEC 205'};
function witness(id,kind,changes={}){
  return {id,kind,storeId:'real-1',ordinal:3,seat:1,
    printing:'Roxie CEC 205',sourceSha256:hash,...changes};
}
function chain(){
  const witnesses=[];
  const phases={};
  for(const [name,kinds] of Object.entries(PHASES)){
    const ids=kinds.map(kind=>name+'-'+kind);
    phases[name]={status:'verified',witnessIds:ids};
    witnesses.push(...kinds.map(kind=>witness(name+'-'+kind,kind)));
  }
  return {chainId:'real-1:root:3',rootOrdinal:3,seat:1,storeId:'real-1',
    action:'PlayCardAction',printing:'Roxie CEC 205',
    executableLookup:'CardManager.getCardByName/Roxie CEC 205',
    witnesses,phases};
}
function archive(chains=[chain()],roots=[root]){
  return {schema:'paper-action-chains-v1',trialId:'test',
    enginePin:'a9905a76',profilePin:'policy-test',
    liveStoreId:'real-1',roots,chains};
}
test('all phases require two same-root witness families',()=>{
  const a=auditActionChains(archive());
  assert.equal(a.structurallyComplete,true);
  assert.equal(a.actionChainPaperVerified,false);
  assert.equal(a.competitiveGameQualified,false);
  for(const p of Object.keys(PHASES))
    assert.equal(a.counts[p].verified,1);
});
test('a missing native chain remains in accepted-Store denominator',()=>{
  const a=auditActionChains(archive([]));
  assert.equal(a.acceptedRootCount,1);
  assert.equal(a.rows[0].disposition,'PAPER_UNVERIFIED');
  assert.equal(a.counts.PAYMENT_PAPER.unverified,1);
});
test('a reported invalid phase vetoes a supposedly settled root',()=>{
  const c=chain();
  c.phases.PAYMENT_PAPER={status:'invalid',witnessIds:[]};
  const a=auditActionChains(archive([c]));
  assert.equal(a.rows[0].disposition,'PAPER_INVALID_REPORTED');
  assert.equal(a.structurallyComplete,false);
});
test('missing provenance or alias surface cannot upgrade evidence',()=>{
  const c=chain();
  c.witnesses[0].storeId='auxiliary-clone';
  assert.equal(auditActionChains(archive([c])).rows[0].phases.ROOT_PAPER.status,
    'unverified');
  c.witnesses[0].storeId='real-1';
  c.executableLookup='';
  assert.equal(auditActionChains(archive([c])).rows[0].disposition,
    'PAPER_UNVERIFIED');
});
test('missing rule/prompt/effect witness never verifies a phase',()=>{
  for(const phase of Object.keys(PHASES)){
    const c=chain();
    c.phases[phase].witnessIds=c.phases[phase].witnessIds.slice(0,1);
    const a=auditActionChains(archive([c]));
    assert.equal(a.rows[0].phases[phase].status,'unverified',phase);
  }
});
test('one root cannot be certified with another root identity',()=>{
  const c=chain();
  c.witnesses[0].ordinal=4;
  assert.equal(auditActionChains(archive([c])).rows[0].phases.ROOT_PAPER.status,
    'unverified');
});
test('duplicate, unmatched and missing chains are failure-inclusive',()=>{
  const second={ordinal:4,seat:0,storeId:'real-1',
    action:'PassTurnAction',printing:null};
  const a=auditActionChains(archive([chain(),chain(),{...chain(),rootOrdinal:99}],
    [root,second]));
  assert.equal(a.acceptedRootCount,2);
  assert.equal(a.extraOrDuplicateChains.length,2);
  assert.equal(a.rows[1].disposition,'PAPER_UNVERIFIED');
  assert.equal(a.structurallyComplete,false);
});
test('not-encountered needs explicit reason and empty witnesses',()=>{
  assert.equal(assessPhase({status:'not-encountered',reason:'no rng',
    witnessIds:[]},[],root,'real-1',PHASES.RANDOMNESS_PAPER).status,
    'not-encountered');
  assert.equal(assessPhase({status:'not-encountered',
    witnessIds:[]},[],root,'real-1',PHASES.RANDOMNESS_PAPER).status,
    'unverified');
});
test('real Store identity and unique root ordinals are mandatory',()=>{
  assert.throws(()=>auditActionChains(archive([],[root,root])),
    /duplicate-root/);
  assert.throws(()=>auditActionChains(archive([],[{...root,storeId:'clone'}])),
    /Expected values/);
});

test('accepted root and its effect cannot disappear as not encountered',()=>{
  const c=chain();
  for(const phase of ['ROOT_PAPER','EFFECT_PAPER'])
    c.phases[phase]={status:'not-encountered',
      reason:'falsely claimed no event',witnessIds:[]};
  const result=auditActionChains(archive([c]));
  assert.equal(result.rows[0].phases.ROOT_PAPER.status,'unverified');
  assert.equal(result.rows[0].phases.EFFECT_PAPER.status,'unverified');
  assert.equal(result.structurallyComplete,false);
});

test('zero-root archives and missing IDs never gain structural pass',()=>{
  assert.equal(auditActionChains(archive([],[])).structurallyComplete,false);
  const c=chain();delete c.chainId;
  assert.equal(auditActionChains(archive([c])).structurallyComplete,false);
});

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {preflightFresh}=require('./agent34-rank1-fresh-underworld-native-pair.cjs');
const {preflightHeldout}=require('./agent34-rank1-heldout-active-funding-native-pair.cjs');
const REG='results/aichi-2026/registrations/agent31-rank1-heldout-floatstone-20261103.json';
const BLOB='299aaba9f4f1b58be0a7ef067174441d4f53713b';

/** Read exact source-preregistered bytes, verify old seed exclusion. */
function prereg(){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',REG));
  assert.equal(gitBlobHash(bytes),BLOB,'Frozen registration changed');
  const registration=JSON.parse(bytes.toString('utf8'));
  const original=preflight();
  const old=preflightFresh().registration;
  const prior=preflightHeldout().registration;
  assert.equal(registration.registeredBeforeAnyNativeOutcomeForTheseSeeds,true);
  assert.equal(registration.originalRosterGitBlobSha,original.rosterBlob);
  assert.equal(registration.pinnedTwinleafRevision,original.pin);
  assert.equal(registration.originalRank,1);
  assert.equal(registration.trials.length,16);
  assert.equal(registration.totalNativeAttempts,32);
  const used=new Set([...old.seeds.A,...old.seeds.B,
    ...prior.seeds.A,...prior.seeds.B]);
  const seeds=[...registration.seeds.A,...registration.seeds.B];
  assert.equal(seeds.length,8);
  assert.equal(new Set(seeds).size,8);
  assert.ok(seeds.every(x=>Number.isSafeInteger(x)&&x>=0&&
    x<=0xffffffff&&!used.has(x)));
  const groups=new Map();
  for(const t of registration.trials){
    assert.equal(t.rank,1);
    assert.equal(t.seed,registration.seeds[t.candidateSlot][t.repeat]);
    assert.equal(t.id,[1,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    const group=t.candidateSlot+':'+t.repeat;
    const members=groups.get(group)??[];
    members.push(t.candidateId);
    groups.set(group,members);
  }
  assert.equal(groups.size,8);
  for(const members of groups.values())assert.deepEqual(members.sort(),
    registration.candidateIds.slice().sort());
  return {registration,original};
}
const roots=(row,seat,action)=>row.rootActionLedger?.filter(x=>
  x.playerSlot===seat&&x.action===action)??[];
const maxGeist=(row,seat)=>roots(row,seat,'AttackAction')
  .filter(x=>x.attack==='Max Geist').length;
const nativeStatus=(row,seat)=>
  row.status==='engine-error'||row.status==='engine-physical-invalid'?
    'engine-error':!row.finished?'censored':
    row.winner===seat?'source-native-terminal':
    row.winner===1-seat?'candidate-native-terminal':'other-terminal';

/** Require accepted physical Tool and retreat and separately settled attack. */
function completeSourceToolAttackChains(row,seat){
  const ledger=row.rootActionLedger??[];
  const targets=row.nativeAcceptedTargetSidecar?.events??[];
  const attacks=row.sourceAttackSettlement?.attacks??[];
  const accepted=(root,action)=>targets.some(e=>
    e.rootActionOrdinal===root.actionOrdinal&&e.playerSlot===seat&&
    e.action===action&&e.storeAccepted===true);
  let count=0;
  for(let i=0;i+2<ledger.length;i++){
    const [a,b,c]=ledger.slice(i,i+3);
    if(a.playerSlot!==seat||b.playerSlot!==seat||c.playerSlot!==seat||
      a.action!=='PlayCardAction'||a.card!=='Float Stone'||
      b.action!=='RetreatAction'||c.action!=='AttackAction'||
      c.attack!=='Max Geist'||a.turnBefore!==b.turnBefore||
      b.turnBefore!==c.turnBefore)continue;
    if(accepted(a,'PlayCardAction')&&accepted(b,'RetreatAction')&&
      attacks.some(e=>e.actionOrdinal===c.actionOrdinal&&
        e.attackName==='Max Geist'&&e.settledPromptChain===true))
      count++;
  }
  return count;
}
module.exports={REG,BLOB,prereg,roots,maxGeist,nativeStatus,
  completeSourceToolAttackChains};

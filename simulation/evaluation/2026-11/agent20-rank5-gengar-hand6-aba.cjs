'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {arm,firstDifference,firstPhysicalDivergence}=
  require('./agent20-rank5-gengar-tempo-aba.cjs');
const {registration:originalRegistration}=
  require('./agent44-first-original-rank5-newmoon-case.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REG='results/aichi-2026/registrations/agent20-rank5-gengar-hand6-posthoc-aba-20261109.json';
const OUTPUT=path.join(ROOT,'artifacts/agent20-rank5-gengar-hand6-posthoc-aba.json');
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/** Select only actual Store root records and owner physical zones relevant to GX timing. */
function tacticalEvidence(record){
  const roots=record.roots;
  const tape=record.physicalTape.postAcceptedRoots;
  const candidateGX=roots.filter(x=>x.playerSlot===1&&
    x.action==='AttackAction'&&x.attack==='Horror House-GX');
  const sourceEnergy=roots.filter(x=>x.playerSlot===0&&
    x.action==='PlayCardAction'&&x.card==='Double Colorless Energy');
  const keyRoots=[45,69,70,71,...candidateGX.map(x=>x.actionOrdinal),
    ...sourceEnergy.map(x=>x.actionOrdinal)];
  return {gx:candidateGX.map(x=>({root:x.actionOrdinal,turn:x.turnBefore})),
    sourceDce:sourceEnergy.map(x=>({root:x.actionOrdinal,turn:x.turnBefore})),
    sourceAttacks:record.source.attacks,candidateAttacks:record.candidate.attacks,
    records:[...new Set(keyRoots)].sort((a,b)=>a-b).map(n=>{
      const x=tape[n],actor=x?.physicalZones[1],enemy=x?.physicalZones[0];
      return {root:n,action:roots[n]?.action,
        turn:roots[n]?.turnBefore,seat:roots[n]?.playerSlot,
        candidateActive:actor?.active?.cards?.map(y=>y.printing)??null,
        candidateActiveEnergy:actor?.active?.energies?.map(y=>y.printing)??null,
        sourceHandCount:enemy?.hand?.length??null,
        sourceActiveEnergy:enemy?.active?.energies?.map(y=>y.printing)??null};
    })};
}
/** Save all three native rows and source-reply root witnesses atomically. */
function save(data){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function main(){
  const reg=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  const original=originalRegistration().reg;
  assert.equal(reg.sourceFrozenCaseId,original.caseId);
  assert.equal(reg.registeredTrials[0].seed,original.preRegisteredTrials[0].seed);
  const arms=[arm('A-control',false,reg),
    arm('C-public-hand-6',true,reg,{minOpponentHandCount:6}),
    arm('A-repeat',false,reg)];
  const result={schema:'agent20-rank5-public-hand-6-gx-tempo-aba-v1',
    registration:reg,
    arms:arms.map(a=>({...a,tacticalEvidence:tacticalEvidence(a)})),
    controlReplayDifference:firstDifference(arms[0],arms[2]),
    firstPhysicalDifference:firstPhysicalDivergence(arms[0],arms[1]),
    controlPhysicalReplayDifference:firstPhysicalDivergence(arms[0],arms[2]),
    treatmentFirstDifferentAction:firstDifference(arms[0],arms[1]),
    sourceDealsMatched:arms.every(a=>
      a.sourceFingerprint===reg.sourceDealFingerprint),
    physicalDealsMatched:arms.every(a=>
      a.fullFingerprint===reg.fullPhysicalDealFingerprint),
    paperQualifiedGames:0,posthocSameSeed:true,
    artifactFingerprintBeforeWrite:digest(arms.map(a=>a.rootLedgerSha256))};
  save(result);
  console.log('AGENT20_GENGAR_PUBLIC_HAND_SIX',JSON.stringify({
    dealsMatched:result.sourceDealsMatched&&result.physicalDealsMatched,
    controlReplay:result.controlReplayDifference,
    physicalFirst:result.firstPhysicalDifference,
    firstDifference:result.treatmentFirstDifferentAction,
    arms:result.arms.map(a=>({phase:a.phase,roots:a.rootCount,
      winner:a.nativeWinner,finished:a.nativeFinished,error:a.nativeError,
      prizes:a.remainingPrizes,
      gx:a.tacticalEvidence.gx,sourceDce:a.tacticalEvidence.sourceDce,
      sourceAttacks:a.source.attacks,candidateAttacks:a.candidate.attacks}))
  }));
  assert.equal(result.controlReplayDifference,null);
  assert.equal(result.controlPhysicalReplayDifference,null);
  assert.ok(result.sourceDealsMatched&&result.physicalDealsMatched);
  return result;
}
if(require.main===module)main();
module.exports={main,tacticalEvidence};

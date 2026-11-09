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
const REG='results/aichi-2026/registrations/agent20-rank5-gengar-lillie-factorial-20261109.json';
const OUTPUT=path.join(ROOT,'artifacts/agent20-rank5-gengar-lillie-factorial.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/** Actual actor-derived attack and paper Supporter outcomes per treatment. */
function summary(armRecord){
  const roots=armRecord.roots;
  const supporters=roots.filter(x=>x.playerSlot===1&&
    x.action==='PlayCardAction'&&x.card==="Lillie's Determination")
    .map(x=>({root:x.actionOrdinal,turn:x.turnBefore}));
  const energy=roots.filter(x=>x.playerSlot===1&&x.action==='PlayCardAction'&&
    (x.card==='Psychic Energy'||x.card==='Telepathic Psychic Energy'))
    .map(x=>({root:x.actionOrdinal,turn:x.turnBefore,card:x.card}));
  return {phase:armRecord.phase,roots:roots.length,
    nativeFinished:armRecord.nativeFinished,nativeWinner:armRecord.nativeWinner,
    nativeError:armRecord.nativeError,finalPrizes:armRecord.remainingPrizes,
    physicalIntegrity:armRecord.physicalIntegrity,
    sourceAttacks:armRecord.source.attacks,
    candidateAttacks:armRecord.candidate.attacks,
    candidateRetreats:armRecord.candidate.retreats,
    candidateLillieSupporters:supporters,
    candidateEnergyAttachments:energy,
    physicalRootLedgerSha256:armRecord.rootLedgerSha256,
    lillieAudit:armRecord.lillieAudit};
}
/** Exclusive lock, temporary write and fsync followed by atomic rename. */
function save(value){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(tmp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function main(){
  const reg=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  const original=originalRegistration().reg;
  assert.equal(reg.sourceFrozenCaseId,original.caseId);
  assert.equal(reg.registeredTrials[0].seed,original.preRegisteredTrials[0].seed);
  const cases=[
    {phase:'A-control',gengar:false,lillie:false,handCount:0},
    {phase:'B-owner-Lillie',gengar:false,lillie:true,handCount:0},
    {phase:'C-public-Gengar',gengar:true,lillie:false,handCount:6},
    {phase:'D-combined',gengar:true,lillie:true,handCount:6},
    {phase:'A-repeat',gengar:false,lillie:false,handCount:0}
  ];
  const arms=cases.map(c=>arm(c.phase,c.gengar,reg,{
    minOpponentHandCount:c.handCount,
    ownerLillieAfterPass:c.lillie
  }));
  const result={schema:'agent20-rank5-owner-lillie-gengar-timing-2x2-v1',
    registration:reg,summary:arms.map(summary),
    earliestPhysicalVsBaseline:arms.slice(1,4).map(a=>
      ({phase:a.phase,first:firstPhysicalDivergence(arms[0],a)})),
    earliestActionVsBaseline:arms.slice(1,4).map(a=>
      ({phase:a.phase,first:firstDifference(arms[0],a)})),
    controlRepeatAction:firstDifference(arms[0],arms[4]),
    controlRepeatPhysical:firstPhysicalDivergence(arms[0],arms[4]),
    matchedFullDeal:arms.every(a=>
      a.fullFingerprint===reg.fullPhysicalDealFingerprint),
    matchedSourceDeal:arms.every(a=>
      a.sourceFingerprint===reg.sourceDealFingerprint),
    samePrintedSixties:true,posthocOriginalSeed:true,
    paperQualifiedGames:0,
    sourceNativeRevision:reg.enginePinnedCommit,
    trialOutcomeProof:hash(arms.map(a=>a.rootLedgerSha256)),
    arms};
  save(result);
  console.log('AGENT20_GENGAR_LILLIE_FACTORIAL',JSON.stringify({
    matchedFullDeal:result.matchedFullDeal,
    matchedSourceDeal:result.matchedSourceDeal,
    controlRepeatAction:result.controlRepeatAction,
    controlRepeatPhysical:result.controlRepeatPhysical,
    evidence:result.summary.map(x=>({
      phase:x.phase,roots:x.roots,nativeFinished:x.nativeFinished,
      nativeWinner:x.nativeWinner,nativeError:x.nativeError,
      sourceAttacks:x.sourceAttacks,
      candidateAttacks:x.candidateAttacks,
      candidateRetreats:x.candidateRetreats,
      candidateLillieSupporters:x.candidateLillieSupporters,
      candidateEnergyAttachments:x.candidateEnergyAttachments,
      acceptedLillieRoots:x.lillieAudit?.acceptedLillieRoots??null
    }))
  }));
  assert.ok(result.matchedFullDeal&&result.matchedSourceDeal);
  assert.equal(result.controlRepeatAction,null);
  assert.equal(result.controlRepeatPhysical,null);
  return result;
}
if(require.main===module)main();
module.exports={main,summary};

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {arm, firstDifference, firstPhysicalDivergence} =
  require('./agent20-rank5-gengar-tempo-aba.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const SOURCE = 'results/aichi-2026/registrations/' +
  'agent50-rank5-gengar-flexible-v2-fresh-eight-20261109.json';
const OUTPUT = path.join(ROOT,
  'artifacts/agent36-gengar-v3-original-regression-native.json');
const sha256 = value => createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/** Recover the originally observed negative source opening without redrawing. */
function originalNegativeTrial() {
  const raw = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
  const registration = JSON.parse(raw);
  const trial = registration.registeredTrials.find(t => t.repeat === 50703);
  assert.deepEqual(trial, {
    rank:5, repeat:50703, candidateSlot:'A', seed:1569489968,
    candidateId:'new-moon-lockbreaker-v1',
    id:'5:50703:A:new-moon-lockbreaker-v1'
  });
  assert.equal(registration.enginePinnedCommit,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  return {trial, registrationSha256:createHash('sha256').update(raw)
    .digest('hex')};
}

/** Postgame candidate-seat action and terminal summary only. */
function summary(record) {
  const attacks=record.roots.filter(x=>x.playerSlot===0 &&
    x.action==='AttackAction').map(x=>({
    root:x.actionOrdinal,turn:x.turnBefore,attack:x.attack
  }));
  return {phase:record.phase,nativeFinished:record.nativeFinished,
    nativeWinner:record.nativeWinner,
    candidateWon:record.nativeFinished?record.nativeWinner===0:null,
    errors:record.nativeError,acceptedRoots:record.roots.length,
    finalPrizes:record.remainingPrizes,
    sourceDeal:record.sourceFingerprint,
    completeDeal:record.fullFingerprint,
    physicalIntegrity:record.physicalIntegrity,
    candidateAttacks:attacks,
    rootLedgerSha256:record.rootLedgerSha256,
    physicalTapeSha256:record.physicalTape.allRootPhysicalZonesSha256};
}

/** Exclusive process lock, fsync, atomic rename. */
function save(output) {
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try {
    fs.writeFileSync(tmp,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
    const sync=fs.openSync(tmp,'r');
    try{fs.fsyncSync(sync);}finally{fs.closeSync(sync);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/**
 * Historical-negative mechanism check. The registration precedes v3 but the
 * v3 treatment was designed after observing this seed, so this is explicitly
 * posthoc and cannot count as a prospective win-rate sample.
 */
function main() {
  const {trial,registrationSha256}=originalNegativeTrial();
  const same={caseId:'agent36-posthoc-original-negative-50703',
    rootCap:320,registeredTrials:[trial]};
  const modes=[
    {phase:'A-flexible-v2',flexibleV2:true,resourceV3:false},
    {phase:'B-protected-v3',flexibleV2:false,resourceV3:true},
    {phase:'A-repeat',flexibleV2:true,resourceV3:false}
  ];
  const arms=modes.map(m=>arm(m.phase,false,same,{
    ownerLillieAfterPass:true,minOpponentHandCount:6,
    flexibleV2:m.flexibleV2,resourceV3:m.resourceV3
  }));
  const summaries=arms.map(summary);
  const matched=arms.every(x=>x.fullFingerprint===arms[0].fullFingerprint &&
    x.sourceFingerprint===arms[0].sourceFingerprint);
  const replayActions=firstDifference(arms[0],arms[2]);
  const replayPhysical=firstPhysicalDivergence(arms[0],arms[2]);
  const treatmentPhysical=firstPhysicalDivergence(arms[0],arms[1]);
  const treatmentActions=firstDifference(arms[0],arms[1]);
  const result={
    schema:'agent36-posthoc-real-native-gengar-resource-v3-50703-aba-v1',
    caseId:same.caseId,sourceRank:5,trial,registrationPath:SOURCE,
    priorV2RegistrationSha256:registrationSha256,
    originalPublishedSourceAndNewMoonPrintedSixtiesUnchanged:true,
    pinnedVendor:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    posthocTargetSelection:true,qualifiedPaperGames:0,
    matchedCompletePhysicalDeal:matched,
    controlRepeatActionDifference:replayActions,
    controlRepeatPhysicalDifference:replayPhysical,
    treatmentFirstPhysicalDifference:treatmentPhysical,
    treatmentFirstActionDifference:treatmentActions,
    summaries,arms
  };
  save(result);
  console.log('AGENT36_GENGAR_V3_ORIGINAL_NEGATIVE',
    JSON.stringify({matched,replayActions,replayPhysical,
      treatmentPhysical,treatmentActions,summaries}));
  assert.ok(matched,'same full starting physical deal for all arms');
  assert.equal(replayActions,null,'A/A repeat action reproduction');
  assert.equal(replayPhysical,null,'A/A repeat physical reproduction');
  return result;
}
if(require.main===module)main();
module.exports={SOURCE,originalNegativeTrial,summary,main};

'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {arm,firstDifference,firstPhysicalDivergence}=
  require('./agent20-rank5-gengar-tempo-aba.cjs');
const {perfectionPrizeReceipts}=
  require('./agent36-perfection-prize-receipts.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const SOURCE='results/aichi-2026/registrations/' +
  'agent50-rank5-gengar-resource-v3-fresh-eight-20261109.json';
const OUTPUT=path.join(ROOT,
  'artifacts/agent36-rank5-held-forest-stone-50801-aba.json');
const hash=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/** Historical one-sided resource-strand from already published fresh v3 run. */
function originalTrial() {
  const raw=fs.readFileSync(path.join(ROOT,SOURCE),'utf8');
  const reg=JSON.parse(raw);
  const trial=reg.registeredTrials.find(t=>t.repeat===50801);
  assert.deepEqual(trial,{
    rank:5,repeat:50801,candidateSlot:'A',seed:3719950840,
    candidateId:'new-moon-lockbreaker-v1',
    id:'5:50801:A:new-moon-lockbreaker-v1'
  });
  return {trial,sourceRegistrationSha256:createHash('sha256')
    .update(raw).digest('hex')};
}

function summarize(record) {
  const seats=[0,1].map(seat=>{
    const selected=record.roots.filter(r=>r.playerSlot===seat);
    return {seat,forestStonePlayRoots:selected
      .filter(r=>r.action==='PlayCardAction'&&r.card==='Forest Seal Stone')
      .map(r=>r.actionOrdinal),
    starAlchemyRoots:selected
      .filter(r=>r.action==='UseAbilityAction'&&r.ability==='Star Alchemy')
      .map(r=>r.actionOrdinal),
    ordinaryAttacks:selected
      .filter(r=>r.action==='AttackAction')
      .map(r=>({root:r.actionOrdinal,attack:r.attack})),
    perfectionInitiations:selected
      .filter(r=>r.action==='UseAbilityAction'&&r.ability==='Perfection')
      .map(r=>r.actionOrdinal)};
  });
  return {
    phase:record.phase,terminal:record.nativeFinished,
    winner:record.nativeWinner,remainingPrizes:record.remainingPrizes,
    error:record.nativeError,rootCount:record.roots.length,
    fullFingerprint:record.fullFingerprint,
    sourceFingerprint:record.sourceFingerprint,
    fullRootLedgerSha256:record.rootLedgerSha256,
    physicalSha256:record.physicalTape?.allRootPhysicalZonesSha256,
    seats,
    candidatePerfectionPrizeReceipts:record.rootPhysicalLinked?
      perfectionPrizeReceipts(record.roots,record.physicalTape,0):null
  };
}

function save(value) {
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    const data=fs.openSync(temp,'r');
    try{fs.fsyncSync(data);}finally{fs.closeSync(data);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/**
 * Posthoc known held-Stone opportunity: v3 baseline / both-seat owner
 * Forest Seal Stone + Star Alchemy / repeated v3 baseline. This is a genuine
 * game-policy counterfactual. Source and candidate decks and physical opening
 * are frozen, but selected after seeing original 50801's bad outcome.
 */
function main(){
  const {trial,sourceRegistrationSha256}=originalTrial();
  const common={caseId:'agent36-observed-rank5-50801-stone-posthoc',
    rootCap:320,registeredTrials:[trial]};
  const modes=[
    {phase:'A-v3-no-Stone',earlyForestSealRoot:false},
    {phase:'B-v3-symmetric-Stone',earlyForestSealRoot:true},
    {phase:'A-v3-repeat',earlyForestSealRoot:false}
  ];
  const games=modes.map(mode=>arm(mode.phase,false,common,{
    resourceV3:true,ownerLillieAfterPass:true,
    minOpponentHandCount:6,
    earlyForestSealRoot:mode.earlyForestSealRoot
  }));
  const summaries=games.map(summarize);
  const identicalOpening=games.every(x=>
    x.fullFingerprint===games[0].fullFingerprint &&
    x.sourceFingerprint===games[0].sourceFingerprint);
  const repeatActionDifference=firstDifference(games[0],games[2]);
  const repeatPhysicalDifference=firstPhysicalDivergence(games[0],games[2]);
  const difference=firstDifference(games[0],games[1]);
  const physicalDifference=firstPhysicalDivergence(games[0],games[1]);
  const output={
    schema:'agent36-forest-stone-owner-native-50801-posthoc-aba-v1',
    sourceRegistration:SOURCE,sourceRegistrationSha256,
    trial,pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    printedSixtiesUnchanged:true,symmetricOwnerStonePolicy:true,
    posthocSelectedSeed:true,qualifiedPaperGames:0,
    identicalOpening,repeatActionDifference,repeatPhysicalDifference,
    firstActionDifference:difference,firstPhysicalDifference:physicalDifference,
    summaries,games
  };
  save(output);
  console.log('AGENT36_RANK5_HELD_STONE_50801',JSON.stringify({
    identicalOpening,repeatActionDifference,repeatPhysicalDifference,
    firstActionDifference:difference,firstPhysicalDifference:physicalDifference,
    summaries
  }));
  assert.ok(identicalOpening,'all arms must start from identical 120 physical cards');
  assert.equal(repeatActionDifference,null);
  assert.equal(repeatPhysicalDifference,null);
  return output;
}
if(require.main===module)main();
module.exports={SOURCE,originalTrial,summarize,main};
